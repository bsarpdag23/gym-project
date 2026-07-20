import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { MessagesGateway } from './messages.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private gateway: MessagesGateway,
  ) {}

  // Sohbet başlatılabilecek kişiler: aynı salondakiler (super_admin için tüm salonlar), kendisi hariç
  async getDirectory(currentUser: any) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return this.userRepo.find({
        where: { id: Not(currentUser.userId) },
        select: { id: true, fullName: true, avatarUrl: true, role: true },
        order: { fullName: 'ASC' },
      });
    }

    const isStaff = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.TRAINER;
    const conditions: any[] = [];

    // Koşul 1: Aynı salondaki diğer yöneticiler ve antrenörler
    conditions.push({
      gymId: currentUser.gymId,
      role: In([UserRole.ADMIN, UserRole.TRAINER]),
      id: Not(currentUser.userId),
    });

    // Koşul 2: Aynı salondaki üyeler
    if (isStaff) {
      // Admin/Trainer gizli profilliler dahil tüm üyeleri görebilir ve yazabilir
      conditions.push({
        gymId: currentUser.gymId,
        role: UserRole.MEMBER,
        id: Not(currentUser.userId),
      });
    } else {
      // Normal üyeler yalnızca profili gizli olmayan diğer üyeleri görebilir
      conditions.push({
        gymId: currentUser.gymId,
        role: UserRole.MEMBER,
        hideProfile: false,
        id: Not(currentUser.userId),
      });
    }

    return this.userRepo.find({
      where: conditions,
      select: { id: true, fullName: true, avatarUrl: true, role: true },
      order: { fullName: 'ASC' },
    });
  }

  // Mevcut sohbetler: her karşı taraf için son mesaj + okunmamış sayısı
  async getConversations(userId: number) {
    const messages = await this.messageRepo.find({
      where: [{ senderId: userId }, { recipientId: userId }],
      relations: { sender: true, recipient: true },
      select: {
        id: true, content: true, createdAt: true, readAt: true, senderId: true, recipientId: true,
        sender: { id: true, fullName: true, avatarUrl: true },
        recipient: { id: true, fullName: true, avatarUrl: true },
      },
      order: { createdAt: 'DESC' },
    });

    const byOtherUser = new Map<number, { user: { id: number; fullName: string; avatarUrl: string | null }; lastMessage: any; unreadCount: number }>();
    for (const m of messages) {
      const otherUser = m.senderId === userId ? m.recipient : m.sender;
      if (!byOtherUser.has(otherUser.id)) {
        byOtherUser.set(otherUser.id, {
          user: { id: otherUser.id, fullName: otherUser.fullName, avatarUrl: otherUser.avatarUrl },
          lastMessage: { content: m.content, createdAt: m.createdAt, senderId: m.senderId },
          unreadCount: 0,
        });
      }
      if (m.recipientId === userId && !m.readAt) {
        byOtherUser.get(otherUser.id)!.unreadCount++;
      }
    }

    return Array.from(byOtherUser.values());
  }

  // İki kullanıcı arasındaki mesaj geçmişi; okunmamışları okundu olarak işaretler
  async getThread(currentUserId: number, otherUserId: number) {
    const messages = await this.messageRepo.find({
      where: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: currentUserId },
      ],
      select: { id: true, content: true, createdAt: true, senderId: true, recipientId: true, readAt: true },
      order: { createdAt: 'ASC' },
    });

    await this.messageRepo.update(
      { senderId: otherUserId, recipientId: currentUserId, readAt: IsNull() },
      { readAt: new Date() },
    );

    return messages;
  }

  async sendMessage(currentUser: any, recipientId: number, content: string) {
    if (recipientId === currentUser.userId) {
      throw new BadRequestException('Kendine mesaj gönderemezsin.');
    }

    const recipient = await this.userRepo.findOne({ where: { id: recipientId } });
    if (!recipient) throw new NotFoundException('Kullanıcı bulunamadı.');

    if (currentUser.role !== 'super_admin' && recipient.gymId !== currentUser.gymId) {
      throw new BadRequestException('Bu kullanıcı sizin salonunuza ait değil.');
    }

    // Profilini gizlemiş biriyle sadece daha önce başlamış bir sohbet varsa devam edilebilir
    // Ancak antrenör/admin ise gizli profili olan üyelere de mesaj atabilmelidir
    if (recipient.hideProfile && currentUser.role === UserRole.MEMBER) {
      const existingCount = await this.messageRepo.count({
        where: [
          { senderId: currentUser.userId, recipientId },
          { senderId: recipientId, recipientId: currentUser.userId },
        ],
      });
      if (existingCount === 0) {
        throw new BadRequestException('Bu kullanıcı profilini gizlemiş, yeni bir sohbet başlatamazsın.');
      }
    }

    const message = this.messageRepo.create({
      senderId: currentUser.userId,
      recipientId,
      content,
    });
    const saved = await this.messageRepo.save(message);

    const payload = {
      id: saved.id, content: saved.content, createdAt: saved.createdAt,
      senderId: saved.senderId, recipientId: saved.recipientId,
    };

    this.gateway.notifyUser(recipientId, 'newMessage', payload);
    this.gateway.notifyUser(currentUser.userId, 'newMessage', payload);

    return payload;
  }
}
