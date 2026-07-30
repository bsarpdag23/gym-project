import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaPaperPlane } from 'react-icons/fa';
import { BRAND, Btn, Card, Badge, Avatar } from './ui';
import { useTheme } from '../context/ThemeContext';
import api, { resolveAvatarUrl } from '../api';
import { getSocket } from '../socket';

export default function ChatTab({ user }) {
  const { isDark } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [showDirectory, setShowDirectory] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const activeUserRef = useRef(null);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  const loadConversations = async () => {
    try {
      setConversations(await api.messages.getConversations());
    } catch (e) {
      console.error(e.message);
    }
  };

  const loadDirectory = async () => {
    try {
      setDirectory(await api.messages.getDirectory());
    } catch (e) {
      console.error(e.message);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (msg) => {
      const otherPartyId = msg.senderId === user?.id ? msg.recipientId : msg.senderId;
      if (activeUserRef.current && otherPartyId === activeUserRef.current.id) {
        setThread((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      loadConversations();
    };
    socket.on('newMessage', handler);
    return () => socket.off('newMessage', handler);
  }, [user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const openThread = async (otherUser) => {
    setActiveUser(otherUser);
    setShowDirectory(false);
    setLoadingThread(true);
    try {
      const msgs = await api.messages.getThread(otherUser.id);
      setThread(msgs);
      loadConversations();
    } catch (e) {
      alert(e.message);
    }
    setLoadingThread(false);
  };

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !activeUser || sending) return;
    setSending(true);
    try {
      const msg = await api.messages.send(activeUser.id, content);
      setThread((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setDraft('');
      loadConversations();
    } catch (e) {
      alert(e.message);
    }
    setSending(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: 560 }}>
      <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '14px 16px',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: isDark ? '#f8fafc' : '#1e293b' }}>
            <FaComments /> Sohbetler
          </h4>
          <Btn size="sm" outline onClick={() => { setShowDirectory(!showDirectory); if (!showDirectory) loadDirectory(); }}>
            {showDirectory ? 'Geri' : '+ Yeni'}
          </Btn>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {showDirectory ? (
            directory.length === 0 ? (
              <p style={{ padding: 16, color: isDark ? '#94a3b8' : '#64748b', fontSize: 13 }}>Sohbet başlatılabilecek kullanıcı yok.</p>
            ) : (
              directory.map((u) => (
                <div key={u.id} onClick={() => openThread(u)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer',
                    borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #f8fafc',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                  <Avatar src={resolveAvatarUrl(u.avatarUrl)} name={u.fullName} size={30} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: isDark ? '#f8fafc' : '#1e293b' }}>{u.fullName}</span>
                    {u.role && (
                      <span style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>
                        {u.role === 'admin' ? 'Yönetici' : u.role === 'trainer' ? 'Antrenör' : 'Üye'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )
          ) : conversations.length === 0 ? (
            <p style={{ padding: 16, color: isDark ? '#94a3b8' : '#64748b', fontSize: 13 }}>Henüz sohbetin yok. "+ Yeni" ile başlat.</p>
          ) : (
            conversations.map((c) => (
              <div key={c.user.id} onClick={() => openThread(c.user)}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #f8fafc',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: activeUser?.id === c.user.id ? (isDark ? 'rgba(6, 182, 212, 0.18)' : '#faf5ff') : 'transparent',
                  borderLeft: activeUser?.id === c.user.id ? `3px solid ${isDark ? '#00f2fe' : BRAND.primary}` : '3px solid transparent',
                  transition: 'background .15s'
                }}>
                <Avatar src={resolveAvatarUrl(c.user.avatarUrl)} name={c.user.fullName} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: isDark ? '#f8fafc' : '#1e293b' }}>{c.user.fullName}</span>
                    {c.unreadCount > 0 && <Badge label={c.unreadCount} color={isDark ? '#00f2fe' : '#e94560'} />}
                  </div>
                  <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.lastMessage.senderId === user?.id ? 'Sen: ' : ''}{c.lastMessage.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeUser ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: isDark ? '#94a3b8' : '#64748b', gap: 10 }}>
            <FaComments size={40} />
            <p style={{ margin: 0 }}>Sohbet etmek için soldan bir kullanıcı seç.</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '14px 16px', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f0f0f0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, color: isDark ? '#f8fafc' : '#1e293b' }}>
              <Avatar src={resolveAvatarUrl(activeUser.avatarUrl)} name={activeUser.fullName} size={30} /> {activeUser.fullName}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loadingThread ? (
                <p style={{ color: isDark ? '#94a3b8' : '#64748b', textAlign: 'center' }}>Yükleniyor...</p>
              ) : thread.length === 0 ? (
                <p style={{ color: isDark ? '#94a3b8' : '#64748b', textAlign: 'center' }}>İlk mesajı sen gönder!</p>
              ) : (
                thread.map((m) => (
                  <div key={m.id} style={{
                    alignSelf: m.senderId === user?.id ? 'flex-end' : 'flex-start',
                    background: m.senderId === user?.id ? (isDark ? '#00f2fe' : BRAND.primary) : (isDark ? '#1e293b' : '#f3f4f6'),
                    color: m.senderId === user?.id ? (isDark ? '#090d16' : '#fff') : (isDark ? '#f8fafc' : '#111827'),
                    borderRadius: 14, padding: '8px 14px', maxWidth: '70%', fontSize: 14, wordBreak: 'break-word',
                    fontWeight: m.senderId === user?.id && isDark ? 600 : 400
                  }}>
                    {m.content}
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: 12, borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                placeholder="Mesaj yaz..."
                style={{
                  flex: 1, border: isDark ? '1px solid rgba(6, 182, 212, 0.3)' : '1.5px solid #e5e7eb',
                  borderRadius: 9, padding: '10px 14px', fontSize: 14, outline: 'none',
                  background: isDark ? '#0b1120' : '#fff', color: isDark ? '#f8fafc' : '#1e293b'
                }}
              />
              <Btn onClick={sendMessage}><FaPaperPlane /></Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
