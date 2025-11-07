// src/config/api.js - VERSIÓN CORREGIDA
// ✅ CORREGIR: Remover slash duplicado
const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://diario-gestion-archivos-production-5c69.up.railway.app';
const API_URL = RAW_API_URL.replace(/\/$/, ''); // Remover slash final si existe

console.log('🔧 API URL configurada:', API_URL); // Para debug

// Función para hacer fetch con autenticación
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
    console.log('🌐 Haciendo request a:', url); // Debug
    const response = await fetch(url, fetchOptions);
    return response;
  } catch (error) {
    console.error('❌ Error en API fetch:', error);
    throw error;
  }
};

// ✅ ENDPOINTS CORREGIDOS
export const apiEndpoints = {
  // Autenticación
  login: `${API_URL}/api/auth/login`,
  register: `${API_URL}/api/auth/register`,
  profile: `${API_URL}/api/auth/profile`,
  
  // Usuarios
  users: `${API_URL}/api/users`,
  userById: (id) => `${API_URL}/api/users/${id}`,
  
  // Fotos
  uploadFoto: `${API_URL}/api/fotos/upload`,
  myFotos: `${API_URL}/api/fotos/my`,
  fotosGlobales: `${API_URL}/api/fotos/global`,
  fotoById: (id) => `${API_URL}/api/fotos/${id}`,
  toggleFotoVisibility: (id) => `${API_URL}/api/fotos/${id}/toggle-visibility`,
  deleteFoto: (id) => `${API_URL}/api/fotos/${id}`,
  downloadFoto: (id) => `${API_URL}/api/fotos/download/${id}`,
  viewFoto: (id) => `${API_URL}/api/fotos/view/${id}`,
  fotosFiltradas: `${API_URL}/api/fotos/filtered`,
  
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
  categorias: `${API_URL}/api/categorias`,
  
  // Notificaciones
  notificaciones: `${API_URL}/api/notificaciones`,
};

export { API_URL };