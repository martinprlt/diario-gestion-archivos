import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Filter, TrendingUp, User, Activity, RefreshCw, Search } from 'lucide-react';
import '../assets/styles/AdminLogs.css';
import { apiFetch, apiEndpoints } from '../config/api';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtros, setFiltros] = useState({
    accion: '',
    usuario_id: '',
    desde: '',
    hasta: '',
    pagina: 1,
    limite: 50
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await apiFetch(`${apiEndpoints.logs}?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtros]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiFetch(`${apiEndpoints.logs}/stats`);
      if (!response.ok) throw new Error('Error al cargar estadísticas');
      const data = await response.json();
      setStats(data);
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
    fetchStats();
  };

  const limpiarFiltros = () =>
    setFiltros({ accion: '', usuario_id: '', desde: '', hasta: '', pagina: 1, limite: 50 });

  const getAccionColor = (accion) => {
    const colores = {
      crear: 'bg-green',
      actualizar: 'bg-blue',
      eliminar: 'bg-red',
      aprobar: 'bg-emerald',
      rechazar: 'bg-orange',
      descargar: 'bg-purple',
      visualizar: 'bg-gray',
      enviar_revision: 'bg-yellow',
      reemplazar: 'bg-indigo'
    };
    return colores[accion] || 'bg-gray';
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-logs-container">
        <div className="loading-container">
          <RefreshCw size={32} className="spin" />
          <p>Cargando logs del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-logs-container">
      <div className="admin-logs-content">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Logs del Sistema</h1>
            <p>Monitoriza la actividad y acciones de los usuarios</p>
          </div>
          <button
            onClick={handleRefresh}
            className={`btn-refresh ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card border-blue">
              <div className="stat-header">
                <h3 className="stat-title">Total de Logs</h3>
                <Activity className="stat-icon text-blue" size={28} />
              </div>
              <p className="stat-value">{stats.totalLogs?.toLocaleString() || '0'}</p>
              <p className="stat-description">Registros totales</p>
            </div>

            <div className="stat-card border-green">
              <div className="stat-header">
                <h3 className="stat-title">Usuarios Activos</h3>
                <User className="stat-icon text-green" size={28} />
              </div>
              <p className="stat-value">
                {stats.usuariosActivos?.filter(u => u.total_acciones > 0).length || '0'}
              </p>
              <p className="stat-description">Con actividad registrada</p>
            </div>

            <div className="stat-card border-purple">
              <div className="stat-header">
                <h3 className="stat-title">Tipos de Acciones</h3>
                <TrendingUp className="stat-icon text-purple" size={28} />
              </div>
              <p className="stat-value">{stats.accionesPorTipo?.length || '0'}</p>
              <p className="stat-description">Categorías diferentes</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="filter-container">
          <div className="filter-header">
            <Filter size={20} />
            <h2>Filtros</h2>
          </div>
          <div className="filter-grid">
            <div className="filter-group">
              <label>Tipo de Acción</label>
              <select
                value={filtros.accion}
                onChange={e => setFiltros({ ...filtros, accion: e.target.value, pagina: 1 })}
              >
                <option value="">Todas las acciones</option>
                <option value="crear">Crear</option>
                <option value="actualizar">Actualizar</option>
                <option value="eliminar">Eliminar</option>
                <option value="aprobar">Aprobar</option>
                <option value="rechazar">Rechazar</option>
                <option value="descargar">Descargar</option>
                <option value="visualizar">Visualizar</option>
                <option value="enviar_revision">Enviar a Revisión</option>
                <option value="reemplazar">Reemplazar</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Desde</label>
              <input
                type="date"
                value={filtros.desde}
                onChange={e => setFiltros({ ...filtros, desde: e.target.value, pagina: 1 })}
              />
            </div>

            <div className="filter-group">
              <label>Hasta</label>
              <input
                type="date"
                value={filtros.hasta}
                onChange={e => setFiltros({ ...filtros, hasta: e.target.value, pagina: 1 })}
              />
            </div>

            <div className="filter-actions">
              <button onClick={limpiarFiltros} className="btn-clear">
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id_log}>
                  <td>
                    <div className="date-cell">
                      <div className="date-main">
                        <Calendar size={16} className="date-icon" />
                        <span className="date-relative">{formatFecha(log.fecha)}</span>
                      </div>
                      <div className="date-full">{new Date(log.fecha).toLocaleString('es-AR')}</div>
                    </div>
                  </td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{log.nombre?.[0]}{log.apellido?.[0]}</div>
                      <div className="user-info">
                        <div className="user-name">{log.nombre} {log.apellido}</div>
                        <div className="user-details">@{log.usuario} · {log.rol}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`action-badge ${getAccionColor(log.accion)}`}>
                      {log.accion.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="description-cell">{log.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="no-results">
              <Search size={48} className="no-results-icon" />
              <p>No se encontraron logs</p>
              <p>
                {filtros.accion || filtros.desde || filtros.hasta
                  ? 'Prueba ajustando los filtros'
                  : 'Aún no hay registros de actividad en el sistema'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
