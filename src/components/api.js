import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:9090',
});

// =================================================
// TOKEN & AUTH
// =================================================

let token = localStorage.getItem('token') || '';

export const setToken = (t) => {
  token = t || '';
  if (t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
};

export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('roles');
  setToken('');
};

api.interceptors.request.use(cfg => {
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuthData();
      window.location.href = '/cms/login';
    }
    return Promise.reject(error);
  }
);

// =================================================
// AUTH API
// =================================================

export const login = async (username, password) => {
  const res = await api.post('/api/auth/login', { username, password });
  const { token: tk, username: u, roles } = res.data;
  setToken(tk);
  return { token: tk, username: u, roles };
};

export const getSession = async () => (await api.get('/api/auth/me')).data;

// =================================================
// POSTS API
// =================================================

export const fetchPosts = async ({ page = 0, size = 5, q = '', language } = {}) => {
  return (await api.get('/api/posts', { params: { page, size, q, language } })).data;
};

export const fetchPostsByCategory = async ({ page = 0, size = 10, category, language } = {}) => {
  const params = { page, size, category };
  if (language === 'en') params.lang = 'en';
  return (await api.get('/api/posts', { params })).data;
};

export const getPost = async (id) => (await api.get(`/api/posts/${id}`)).data;

export const getAbout = async (lang) => 
  (await api.get('/api/posts/about', { params: { lang } })).data;

// =================================================
// IMAGES API
// =================================================

export const fetchImages = async ({ ethnic, search = '', language, page = 0, size = 10 } = {}) => {
  return (await api.get('/api/images', { params: { ethnic, search, language, page, size } })).data;
};

export const getImage = async (id) => (await api.get(`/api/images/${id}`)).data;

export const updateImage = async (id, payload) =>
  (await api.put(`/api/images/${id}`, payload)).data;

export const deleteImage = async (id) => (await api.delete(`/api/images/${id}`)).data;

export const deleteImagesBulk = async (ids) =>
  (await api.delete('/api/images/bulk', { data: ids })).data;

export const uploadImage = async (file) => {
  const form = new FormData();
  form.append('file', file);
  return (await api.post('/api/images/upload', form)).data;
};

// =================================================
// GOOGLE DRIVE APIS
// =================================================

export const get3dImages = async ({ page = 0, size = 10 } = {}) =>
  (await api.get('/api/ggdrive/3d-images', { params: { page, size } })).data;

export const get360Images = async ({ page = 0, size = 10 } = {}) =>
  (await api.get('/api/ggdrive/360-images', { params: { page, size } })).data;

export const getListVideoMp4 = async ({ page = 0, size = 10 } = {}) =>
  (await api.get('/api/videos', { params: { page, size } })).data;

// =================================================
// 🔥 CUSTOM APIS (HOME, NEWS, CACHE)
// =================================================

export const getHome = async (language = 'vi') => {
  const res = await api.get('/api/posts/home', { params: { lang: language } });
  return res.data;
};

export const getNews = async (language = 'vi') => {
  const res = await api.get('/api/posts', {
    params: { page: 0, size: 4, language }
  });
  return res.data;
};

export const invalidateImagesCache = async (ethnic) => {
  try {
    const prefix = `images_${ethnic || ''}`;
    Object.keys(localStorage)
      .filter(k => k.startsWith(prefix))
      .forEach(k => localStorage.removeItem(k));
  } catch (err) {
    console.warn('invalidateImagesCache error:', err);
  }
};
// =================================================
// ADMIN USERS API
// =================================================

export const adminCreateManager = async (payload) =>
  (await api.post('/api/admin/users', payload)).data;

export const adminUpdateManager = async (id, payload) =>
  (await api.put(`/api/admin/users/${id}`, payload)).data;

export const adminDeleteUser = async (id) =>
  await api.delete(`/api/admin/users/${id}`);

export const adminListUsers = async ({ page = 0, size = 10, q = '' } = {}) =>
  (await api.get('/api/admin/users', { params: { page, size, q } })).data;

export const adminGetUser = async (id) =>
  (await api.get(`/api/admin/users/${id}`)).data;

// =================================================
// EXPORT DEFAULT — MUST BE LAST
// =================================================
export const createPost = async (payload) =>
  (await api.post('/api/posts', payload)).data;

export const updatePost = async (id, payload) =>
  (await api.put(`/api/posts/${id}`, payload)).data;

export const deletePost = async (id) =>
  await api.delete(`/api/posts/${id}`);
// =================================================
// CLIPS API
// =================================================

export const updateClip = async (id, payload) =>
  (await api.put(`/api/clips/${id}`, payload)).data;

export const deleteClip = async (id) =>
  await api.delete(`/api/clips/${id}`);

export const fetchClips = async ({ page = 0, size = 10 } = {}) =>
  (await api.get('/api/clips', { params: { page, size } })).data;
export const uploadClip = async (file) => {
  const form = new FormData();
  form.append("file", file);
  return (await api.post('/api/clips/upload', form)).data;
};
// =================================================
// USER PROFILE API
// =================================================

export const getMe = async () =>
  (await api.get('/api/users/profile')).data;

export const updateMe = async (payload) =>
  (await api.put('/api/users/profile', payload)).data;
// =================================================
// YOUTUBE PLAYLIST API
// =================================================

export const getFromU2bePlaylist = async ({ playlistId, page = 0, size = 10 } = {}) => {
  const res = await api.get('/api/u2be/playlist', {
    params: { playlistId, page, size }
  });
  return res.data;
};

export default api;
