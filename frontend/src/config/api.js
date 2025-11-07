// 📁 frontend/src/config/api.js - VERSIÓN COMPLETAMENTE CORREGIDA
const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://diario-gestion-archivos-production-5c69.up.railway.app';
const API_URL = RAW_API_URL.replace(/\/$/, '');

console.log('🔧 API URL configurada:', API_URL);

// ✅ FUNCIÓN apiFetch MEJORADA
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  // Crear opciones base
  const fetchOptions = {
    ...options,
    headers: {
      // ✅ NO forzar Content-Type - se establecerá automáticamente
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // ✅ SOLO agregar Content-Type si NO es FormData y NO se especificó otro
  if (!(options.body instanceof FormData) && !options.headers?.['Content-Type']) {
    fetchOptions.headers['Content-Type'] = 'application/json';
  }

  try {
    console.log('🌐 Haciendo request a:', url);
    console.log('📝 Método:', options.method || 'GET');
    console.log('🔑 Token presente:', !!token);
    
    const response = await fetch(url, fetchOptions);
    
    console.log('📨 Respuesta recibida - Status:', response.status, response.statusText);
    
    // ✅ MANEJO MEJORADO DE ERRORES
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      // Intentar leer el cuerpo como texto para debug
      try {
        const text = await response.text();
        console.error('📄 Respuesta del servidor (texto):', text.substring(0, 500));
        
        // Verificar si es HTML (error de servidor)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          errorMessage = `El servidor devolvió una página HTML (posible error 404/500). Verifica que la ruta ${url} exista.`;
        } else if (text) {
          // Intentar parsear como JSON si parece JSON
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            // Si no es JSON, usar el texto como mensaje
            errorMessage = text || errorMessage;
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

// ✅ FUNCIÓN ESPECÍFICA PARA SUBIR ARCHIVOS
export const apiUpload = async (url, formData, options = {}) => {
  const token = localStorage.getItem('token');
  
  const uploadOptions = {
    method: 'POST',
    body: formData,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // ✅ NO incluir Content-Type - FormData lo establece automáticamente
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log('📤 Iniciando upload a:', url);
    console.log('📁 Archivos en FormData:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: ${value.name} (${value.type}, ${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    const response = await fetch(url, uploadOptions);
    
    console.log('📨 Respuesta upload - Status:', response.status);
    
    if (!response.ok) {
      let errorMessage = `Error ${response.status} al subir archivo`;
      
      try {
        const text = await response.text();
        console.error('📄 Respuesta del servidor:', text.substring(0, 500));
        
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          errorMessage = `El servidor devolvió una página HTML. Verifica: 
          1. Que la ruta ${url} exista
          2. Que el backend esté funcionando
          3. Que no haya errores de CORS`;
        } else if (text) {
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = text || errorMessage;
          }
        }
      } catch (textError) {
        console.error('❌ Error leyendo respuesta upload:', textError);
      }
      
      throw new Error(errorMessage);
    }
    
    // Verificar que la respuesta sea JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.warn('⚠️ Respuesta no es JSON:', text.substring(0, 200));
      throw new Error('El servidor respondió con un formato inesperado');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error en apiUpload:', error);
    throw error;
  }
};

// ✅ ENDPOINTS (tu versión está bien)
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

export { API_URL };