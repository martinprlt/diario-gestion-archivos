import { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useHeartbeat = () => {
  const { usuario, token, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!usuario || !token) {
      return;
    }

    console.log('💓 Heartbeat iniciado para:', usuario.nombre);

    const sendHeartbeat = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/heartbeat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
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

    sendHeartbeat();
    const intervalId = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(intervalId);
  }, [usuario, token, logout]);
};