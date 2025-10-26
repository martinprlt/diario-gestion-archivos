// Configuración de API según entorno
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5000',
  },
  production: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  }
};

// Detectar entorno (Vite usa import.meta.env.MODE)
const environment = import.meta.env.MODE || 'development';

export const API_BASE_URL = API_CONFIG[environment].baseURL;

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', environment);

// Helper para hacer llamadas
export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error en API:', error);
    throw error;
  }
}

// Helper para subir archivos
export async function uploadFile(endpoint, formData, token) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData, // No poner Content-Type, el navegador lo hace automático
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Upload failed: ${response.status}` }));
    throw new Error(error.message);
  }

  return await response.json();
}