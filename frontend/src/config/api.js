// frontend/src/config/api.js - CORREGIDO
// Eliminar cualquier barra final de la API_URL
const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export const API_URL = baseURL;

console.log('🔗 API URL configurada:', API_URL);

export const apiEndpoints = {
  // Auth
  login: `${baseURL}/api/auth/login`,
  forgotPassword: `${baseURL}/api/auth/forgot-password`,
  resetPassword: `${baseURL}/api/auth/reset-password`,
  
  // Articles
  articles: `${baseURL}/api/articles`,
  myArticles: `${baseURL}/api/articles/my`,
  uploadArticle: `${baseURL}/api/articles/upload`,
  downloadArticle: (id) => `${baseURL}/api/articles/download/${id}`,        // ✅ NUEVO
  viewArticle: (id) => `${baseURL}/api/articles/view/${id}`,                // ✅ NUEVO
  sendToReview: (id) => `${baseURL}/api/articles/${id}/send-to-review`,     // ✅ NUEVO
  deleteArticle: (id) => `${baseURL}/api/articles/${id}`,                   // ✅ NUEVO
  getArticleById: (id) => `${baseURL}/api/articles/${id}`,                  // ✅ NUEVO
  
  
  // Users
  users: `${baseURL}/api/usuarios`,
  userById: (id) => `${baseURL}/api/usuarios/${id}`,
  updateUserRole: (id) => `${baseURL}/api/usuarios/${id}/rol`,
  
  // Roles
  roles: `${baseURL}/api/roles`,
  
  // Photos
  photos: `${baseURL}/api/fotos`,
  uploadPhoto: `${baseURL}/api/fotos/upload`,
  
  // Categories
  categories: `${baseURL}/api/categorias`,
  
  // Notifications
  notifications: `${baseURL}/api/notificaciones`,
  userNotifications: (usuarioId) => `${baseURL}/api/notificaciones/${usuarioId}`,
  markNotificationRead: `${baseURL}/api/notificaciones/marcar-leida`,
  createNotification: `${baseURL}/api/notificaciones/crear`,
  
  // Admin
  onlineUsers: `${baseURL}/api/admin/online-users`,
  heartbeat: `${baseURL}/api/admin/heartbeat`,
  logsStats: `${baseURL}/api/logs/stats`,
  logs: `${baseURL}/api/logs`,
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
  
  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Token expirado
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login?expired=true';
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    throw error;
  }
};

// Debug: mostrar endpoints importantes
console.log('🔗 Login endpoint:', apiEndpoints.login);
console.log('🔗 Categories endpoint:', apiEndpoints.categories);