// 📁 src/config/api.js - VERSIÓN MEJORADA
const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://diario-gestion-archivos-production-5c69.up.railway.app';
const API_URL = RAW_API_URL.replace(/\/$/, '');

console.log('🔧 API URL configurada:', API_URL);

// ✅ Función fetch mejorada con manejo de errores
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const fetchOptions = {
    ...options,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // ✅ NO forzar 'Content-Type' para FormData
  if (!(options.body instanceof FormData)) {
    fetchOptions.headers['Content-Type'] = 'application/json';
  }

  try {
    console.log('🌐 Haciendo request a:', url);
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        console.error('📄 Respuesta del servidor:', errorText.substring(0, 500));
        
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        }
      } catch (textError) {
        console.error('❌ Error leyendo respuesta:', textError);
      }
      
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error en API fetch:', {
      url,
      error: error.message,
      type: error.name
    });
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión. Verifica tu internet o si el servidor está disponible.');
    }
    
    throw error;
  }
};

// ✅ ENDPOINTS CORREGIDOS
export const apiEndpoints = {
  // Autenticación
  login: `${API_URL}/api/auth/login`,
  register: `${API_URL}/api/usuarios`,
  forgotPassword: `${API_URL}/api/auth/forgot-password`,
  resetPassword: `${API_URL}/api/auth/reset-password`,
  
  // Usuarios
  users: `${API_URL}/api/usuarios`,
  userById: (id) => `${API_URL}/api/usuarios/${id}`,
  updateUserRole: (id) => `${API_URL}/api/usuarios/${id}/rol`,
  
  // Fotos
  photos: `${API_URL}/api/fotos`,
  uploadFoto: `${API_URL}/api/fotos/upload`,
  myFotos: `${API_URL}/api/fotos/my`,
  fotosGlobales: `${API_URL}/api/fotos/global`,
  fotoById: (id) => `${API_URL}/api/fotos/${id}`,
  toggleFotoVisibility: (id) => `${API_URL}/api/fotos/${id}/toggle-visibility`,
  deleteFoto: (id) => `${API_URL}/api/fotos/${id}`,
  downloadFoto: (id) => `${API_URL}/api/fotos/download/${id}`,
  viewFoto: (id) => `${API_URL}/api/fotos/view/${id}`,
  
  // Artículos - ✅ CORREGIDOS
  uploadArticle: `${API_URL}/api/articles/upload`,
  myArticles: `${API_URL}/api/articles/my`,
  articleById: (id) => `${API_URL}/api/articles/${id}`,
  updateArticle: (id) => `${API_URL}/api/articles/${id}`,
  deleteArticle: (id) => `${API_URL}/api/articles/${id}`,
  downloadArticle: (id) => `${API_URL}/api/articles/download/${id}`,
  viewArticle: (id) => `${API_URL}/api/articles/view/${id}`,
  sendToReview: (id) => `${API_URL}/api/articles/${id}/send-to-review`,
  
  // Editor endpoints
  articlesForReview: `${API_URL}/api/articles/editor/review`,
  articlesApproved: `${API_URL}/api/articles/editor/approved`,
  approveArticle: (id) => `${API_URL}/api/articles/${id}/approve`,
  rejectArticle: (id) => `${API_URL}/api/articles/${id}/reject`,
  
  // Estados de artículos
  articlesByEstado: (estado) => `${API_URL}/api/articles/my/${estado}`,
  
  // Categorías
  categories: `${API_URL}/api/categorias`,
  
  // Notificaciones
  notifications: `${API_URL}/api/notificaciones`,
  userNotifications: (userId) => `${API_URL}/api/notificaciones/user/${userId}`,
  markNotificationRead: `${API_URL}/api/notificaciones/marcar-leida`,
  createNotification: `${API_URL}/api/notificaciones/crear`,
  
  // Roles
  roles: `${API_URL}/api/roles`,
  
  // Logs
  logs: `${API_URL}/api/logs`,
  
  // Avatar
  uploadAvatar: `${API_URL}/api/upload-avatar`,
  
  // Admin
  onlineUsers: `${API_URL}/api/admin/online-users`,
  heartbeat: `${API_URL}/api/admin/heartbeat`,
};

export { API_URL };