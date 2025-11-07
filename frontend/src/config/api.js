// frontend/src/config/api.js - VERSIÓN COMPLETA CORREGIDA
const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://diario-gestion-archivos-production-5c69.up.railway.app';
const API_URL = RAW_API_URL.replace(/\/$/, '');

console.log('🔧 API URL configurada:', API_URL);

// ========================================
// FUNCIÓN PARA REQUESTS JSON (CON TOKEN)
// ========================================
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const fetchOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log('🌐 Request JSON a:', url);
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      console.error(`❌ Error ${response.status}: ${response.statusText}`);
      const text = await response.text();
      console.error('📄 Respuesta del servidor:', text.substring(0, 200));
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error en apiFetch:', error);
    throw error;
  }
};

// ========================================
// ✅ FUNCIÓN PARA UPLOADS DE ARCHIVOS (FORMDATA)
// ========================================
export const apiUpload = async (url, formData) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  try {
    console.log('📤 Subiendo archivo a:', url);
    console.log('📦 FormData keys:', [...formData.keys()]);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // ⚠️ CRÍTICO: NO incluir 'Content-Type'
        // El navegador lo establece automáticamente con boundary para FormData
      },
      body: formData
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en upload:', errorText);
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }

    console.log('✅ Upload exitoso');
    return response;
    
  } catch (error) {
    console.error('💥 Error en apiUpload:', error);
    throw error;
  }
};

// ========================================
// ENDPOINTS DE LA API
// ========================================
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
  
  // Artículos
  uploadArticle: `${API_URL}/api/articles/upload`, // ✅ UPLOAD
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
  userNotifications: (userId) => `${API_URL}/api/notificaciones/${userId}`,
  markNotificationRead: `${API_URL}/api/notificaciones/marcar-leida`,
  createNotification: `${API_URL}/api/notificaciones/crear`,
  
  // Roles
  roles: `${API_URL}/api/roles`,
  
  // Logs (Admin)
  logs: `${API_URL}/api/logs`,
  
  // Avatar
  uploadAvatar: `${API_URL}/api/upload-avatar`,
  
  // Admin y Chat
  onlineUsers: `${API_URL}/api/admin/online-users`,
  heartbeat: `${API_URL}/api/admin/heartbeat`,
};

// ========================================
// 🔍 VERIFICACIÓN DE EXPORTS
// ========================================
console.log('✅ api.js cargado con exports:', {
  apiFetch: typeof apiFetch,
  apiUpload: typeof apiUpload,
  apiEndpoints: typeof apiEndpoints,
  API_URL: API_URL
});

export { API_URL };