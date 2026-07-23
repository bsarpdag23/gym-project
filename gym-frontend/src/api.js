// Nginx ters proxy (reverse proxy) sayesinde üretim ortamında bağımsız port açmaya gerek yoktur.
export const API_URL = process.env.REACT_APP_API_URL || '';

// Sunucudan gelen göreli avatar yolunu (/uploads/avatars/x.webp) tam URL'e çevirir
export const resolveAvatarUrl = (avatarUrl) => avatarUrl ? `${API_URL}${avatarUrl}` : null;

// ─── Merkezi API yardımcısı ───────────────────────────────────────────────────
const api = {
  async req(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      const msg = data?.message || `Hata oluştu (${res.status})`;
      throw new Error(msg);
    }
    return data;
  },
  // multipart/form-data gönderir — Content-Type header'ı elle set edilmez,
  // tarayıcı doğru boundary'i kendisi ekler
  async upload(endpoint, file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      const msg = data?.message || `Yükleme başarısız oldu (${res.status})`;
      throw new Error(msg);
    }
    return data;
  },
  auth: {
    register: (d)    => api.req('/auth/register', { method:'POST', body: JSON.stringify(d) }),
    login:    (d)    => api.req('/auth/login',    { method:'POST', body: JSON.stringify(d) }),
  },
  users: {
    getAll:       ()          => api.req('/users'),
    updateRole:   (id, role)  => api.req(`/users/${id}/role`, { method:'PATCH', body: JSON.stringify({ role }) }),
    getTrainers:  ()          => api.req('/users/trainers'),
    assignTrainer:(id, trainerId) => api.req(`/users/${id}/trainer`, { method:'PATCH', body: JSON.stringify({ trainerId }) }),
    getMyMembers: () => api.req('/users/my-members'),
    getMe: () => api.req('/users/me'),
    getGamification: () => api.req('/users/me/gamification'),
    updatePrivacy: (hideProfile) => api.req('/users/me/privacy', { method:'PATCH', body: JSON.stringify({ hideProfile }) }),
    uploadAvatar: (file) => api.upload('/users/me/avatar', file),
    deleteMe: () => api.req('/users/me', { method: 'DELETE' }),
    remove: (id) => api.req(`/users/${id}`, { method: 'DELETE' }),
  },
  plans: {
    getAll:  ()      => api.req('/membership-plans'),
    create:  (d)     => api.req('/membership-plans',    { method:'POST',   body: JSON.stringify(d) }),
    update:  (id, d) => api.req(`/membership-plans/${id}`, { method:'PATCH',  body: JSON.stringify(d) }),
    remove:  (id)    => api.req(`/membership-plans/${id}`, { method:'DELETE' }),
  },
  enrollments: {
    getAll:  ()   => api.req('/enrollments'),
    getMine: ()   => api.req('/enrollments/my-enrollments'),
    create:  (id) => api.req('/enrollments', { method:'POST', body: JSON.stringify({ planId: id }) }),
    decrementPt: (id) => api.req(`/enrollments/${id}/decrement-pt`, { method:'POST' }),
  },
  exercises: {
    getAll:  ()      => api.req('/exercises'),
    create:  (d)     => api.req('/exercises',    { method:'POST',   body: JSON.stringify(d) }),
    update:  (id, d) => api.req(`/exercises/${id}`, { method:'PATCH',  body: JSON.stringify(d) }),
    remove:  (id)    => api.req(`/exercises/${id}`, { method:'DELETE' }),
  },
  programs: {
    getAll:       ()          => api.req('/workout-programs'),
    create:       (d)         => api.req('/workout-programs',    { method:'POST',   body: JSON.stringify(d) }),
    update:       (id, d)     => api.req(`/workout-programs/${id}`, { method:'PATCH',  body: JSON.stringify(d) }),
    remove:       (id)        => api.req(`/workout-programs/${id}`, { method:'DELETE' }),
    addExercise:  (pid, eid)  => api.req(`/workout-programs/${pid}/exercises/${eid}`, { method:'POST' }),
    dropExercise: (pid, eid)  => api.req(`/workout-programs/${pid}/exercises/${eid}`, { method:'DELETE' }),
    rate:         (id, d)     => api.req(`/workout-programs/${id}/ratings`, { method:'POST', body: JSON.stringify(d) }),
    assignToMember: (memberId, workoutProgramId) => api.req(`/programs/assign/${memberId}/${workoutProgramId}`, { method:'POST' }),
  },
  healthProfile: {
    getMine: ()  => api.req('/health-profile/me'),
    save:    (d) => api.req('/health-profile/me', { method:'PUT', body: JSON.stringify(d) }),
  },
  fitness: {
    preview:    () => api.req('/programs/preview'),
    generate:   () => api.req('/programs/generate', { method:'POST' }),
    generateAI: () => api.req('/programs/generate-ai', { method:'POST' }),
    generateDietAI: () => api.req('/programs/generate-diet-ai', { method:'POST' }),
    active:     () => api.req('/programs/active'),
    history:    () => api.req('/programs/history'),
    activate:   (id) => api.req(`/programs/activate/${id}`, { method:'POST' }),
  },
  checkIns: {
    scan:    (qrToken) => api.req('/check-ins/scan', { method:'POST', body: JSON.stringify({ qrToken }) }),
    getAll:  ()        => api.req('/check-ins'),
  },
  dashboard: {
    getStats: () => api.req('/dashboard/stats'),
    getOccupancyPrediction: () => api.req('/dashboard/occupancy-prediction'),
  },
  gyms: {
    getPublicList: () => api.req('/gyms/public'),
    getPublicDetail: (id) => api.req(`/gyms/${id}/public-detail`),
    getAll: ()  => api.req('/gyms'),
    create: (d) => api.req('/gyms', { method:'POST', body: JSON.stringify(d) }),
    getDetail: (id) => api.req(`/gyms/${id}/detail`),
    getUsers:  (id) => api.req(`/gyms/${id}/users`),
    update: (id, d) => api.req(`/gyms/${id}`, { method:'PATCH', body: JSON.stringify(d) }),
    remove: (id) => api.req(`/gyms/${id}`, { method:'DELETE' }),
    getGlobalStats: () => api.req('/gyms/global-stats'),
  },
  messages: {
    getDirectory:     ()        => api.req('/messages/directory'),
    getConversations: ()        => api.req('/messages/conversations'),
    getThread:        (userId)  => api.req(`/messages/${userId}`),
    send:             (userId, content) => api.req(`/messages/${userId}`, { method:'POST', body: JSON.stringify({ content }) }),
  },
};

export default api;