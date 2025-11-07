// frontend/src/hooks/useHeartbeat.js - CORREGIDO
import { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiEndpoints, apiFetch } from '../config/api'; // ✅ Usar configuración global

export const useHeartbeat = () => {
  const { user, token, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    console.log('💓 Heartbeat iniciado para:', user.nombre);

    const sendHeartbeat = async () => {
      try {
        // ✅ Usar apiEndpoints en lugar de localhost
        const response = await apiFetch(apiEndpoints.heartbeat, {
          method: 'POST'
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`💚 Heartbeat: ${data.username} (${data.totalOnline} online)`);
        } else if (response.status === 401) {
          console.warn('⚠️ Sesión expirada');
          logout();
          window.location.href = '/login?expired=true';
        }
      } catch (error) {
        console.error('❌ Error heartbeat:', error.message);
      }
    };

    // Enviar heartbeat inmediatamente
    sendHeartbeat();
    
    // Luego cada 30 segundos
    const intervalId = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(intervalId);
  }, [user, token, logout]);
};