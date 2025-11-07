export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🔗 API URL:', API_URL);

export const apiEndpoints = {
  // Auth
  login: `${API_URL}/api/auth/login`,
  forgotPassword: `${API_URL}/api/auth/forgot-password`,
  resetPassword: `${API_URL}/api/auth/reset-password`,
  
  // Articles
  articles: `${API_URL}/api/articles`,
  myArticles: `${API_URL}/api/articles/my`,
  uploadArticle: `${API_URL}/api/articles/upload`,
  
  // Users
  users: `${API_URL}/api/usuarios`,
  userById: (id) => `${API_URL}/api/usuarios/${id}`,
  updateUserRole: (id) => `${API_URL}/api/usuarios/${id}/rol`,
  
  // Roles
  roles: `${API_URL}/api/roles`,
  
  // Photos
  photos: `${API_URL}/api/fotos`,
  uploadPhoto: `${API_URL}/api/fotos/upload`,
  
  // Categories
  categories: `${API_URL}/api/categorias`,
  
  // Notifications - ENDPOINTS CORREGIDOS
  notifications: `${API_URL}/api/notificaciones`,
  userNotifications: (usuarioId) => `${API_URL}/api/notificaciones/${usuarioId}`,
  markNotificationRead: `${API_URL}/api/notificaciones/marcar-leida`,
  createNotification: `${API_URL}/api/notificaciones/crear`,
  
  // Admin
  onlineUsers: `${API_URL}/api/admin/online-users`,
  heartbeat: `${API_URL}/api/admin/heartbeat`,
  logsStats: `${API_URL}/api/logs/stats`,
  logs: `${API_URL}/api/logs`,
};

// Helper para fetch con autenticación
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };
  
  const response = await fetch(url, config);
  
  if (response.status === 401) {
    // Token expirado
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login?expired=true';
  }
  
  return response;
};