export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const endpoints = {
  login: `${API_URL}/api/auth/login`,
  articles: `${API_URL}/api/articles`,
  users: `${API_URL}/api/usuarios`,
};