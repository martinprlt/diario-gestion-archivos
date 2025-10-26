import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.js';
import { useHeartbeat } from '../hooks/useHeartbeat';
import '../assets/styles/DashboardAdmin.css'; // CSS mejorado

export function DashboardAdmin() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  const { usuario, token } = useContext(AuthContext);

  // ✅ Activar heartbeat automático
  useHeartbeat();

  const fetchOnlineUsers = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/admin/online-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.status} - ${errorData.message}`);
      }

      const data = await response.json();
      setOnlineUsers(data.onlineUsers || []);
      setStats({
        total: data.total || 0,
        lastUpdated: data.lastUpdated
      });
    } catch (error) {
      console.error('❌ Error fetching online users:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!usuario || !token) return;

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 5000);
    return () => clearInterval(interval);
  }, [usuario, token, fetchOnlineUsers]);

  if (!usuario) {
    return (
      <div className="p-6 text-center">
        <div className="text-blue-500">Cargando usuario...</div>
      </div>
    );
  }

  const isAdmin = usuario.categoria?.toLowerCase() === 'administrador';

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No tienes permisos para acceder a esta página.
          <br />
          <small>Tu categoría: {usuario.categoria || 'no definida'}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Dashboard Administrativo</h2>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="dashboard-card bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-600 font-semibold mb-2">Usuarios Online</h3>
          <p className="text-4xl font-bold text-green-600">{stats.total}</p>
        </div>

        <div className="dashboard-card bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-600 font-semibold mb-2">Última Actualización</h3>
          <p className="text-lg">
            {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString('es-AR') : '--:--:--'}
          </p>
        </div>

        <div className="dashboard-card bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-600 font-semibold mb-2">Estado del Sistema</h3>
          <p className="text-lg text-green-600 flex items-center">
            <span className="status-dot mr-2"></span>
            Activo
          </p>
        </div>
      </div>

      {/* Usuarios Conectados */}
      <div className="dashboard-card bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Usuarios Conectados ({stats.total})</h3>
          <button
            onClick={fetchOnlineUsers}
            className="btn-refresh px-4 py-2 rounded transition"
          >
            🔄 Actualizar
          </button>
        </div>

        <div className="p-6">
          {onlineUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No hay usuarios conectados en este momento</p>
              <p className="text-sm mt-2">Los usuarios aparecerán aquí cuando inicien sesión</p>
            </div>
          ) : (
            <div className="users-grid">
              {onlineUsers.map((user) => (
                <div key={user.userId} className="user-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold">{user.nombre} {user.apellido}</p>
                      <p className="text-sm">@{user.username}</p>
                      <p className="text-xs mt-1">{user.categoria || 'Sin categoría'}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="status-dot" title="En línea"></div>
                      <span className="text-xs text-green-600 mt-1">Online</span>
                    </div>
                  </div>

                  <div className="border-t pt-2 mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      ⏰ Última actividad: {new Date(user.lastActivity).toLocaleTimeString('es-AR')}
                    </p>
                    <p className="text-xs text-gray-500">
                      🕐 Conectado hace: {user.onlineFor} min
                    </p>
                    {user.ip && <p className="text-xs text-gray-400">📍 IP: {user.ip}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
