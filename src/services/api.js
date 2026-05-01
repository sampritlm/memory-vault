import axios from 'axios';

const API = axios.create({ 
  baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : '/api' 
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/me'),
};

export const memoriesAPI = {
  create: (data) => API.post('/memories', data),
  getAll: () => API.get('/memories'),
  getOne: (id) => API.get(`/memories/${id}`),
  update: (id, data) => API.put(`/memories/${id}`, data),
  delete: (id) => API.delete(`/memories/${id}`),
};