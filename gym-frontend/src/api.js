const API_URL = 'http://localhost:3001';

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
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Hata oluştu' }));
      throw new Error(err.message);
    }
    return res.json();
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
  },
  healthProfile: {
    getMine: ()  => api.req('/health-profile/me'),
    save:    (d) => api.req('/health-profile/me', { method:'PUT', body: JSON.stringify(d) }),
  },
  fitness: {
    preview:  () => api.req('/programs/preview'),
    generate: () => api.req('/programs/generate', { method:'POST' }),
    active:   () => api.req('/programs/active'),
    history:  () => api.req('/programs/history'),
  },
  checkIns: {
    scan:    (qrToken) => api.req('/check-ins/scan', { method:'POST', body: JSON.stringify({ qrToken }) }),
    getAll:  ()        => api.req('/check-ins'),
  },
  dashboard: {
    getStats: () => api.req('/dashboard/stats'),
  },
  gyms: {
    getAll: ()  => api.req('/gyms'),
    create: (d) => api.req('/gyms', { method:'POST', body: JSON.stringify(d) }),
    getDetail: (id) => api.req(`/gyms/${id}/detail`),
    getUsers:  (id) => api.req(`/gyms/${id}/users`),
  },
};

export default api;