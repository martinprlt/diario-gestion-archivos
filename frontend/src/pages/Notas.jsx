import { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import { useCategorias } from '../context/CategoriasContext.jsx';
import '../assets/styles/notas.css';
import { apiEndpoints, apiFetch } from '../config/api';

function Notas() {
  const [notas, setNotas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const { token } = useContext(AuthContext);
  const { categorias } = useCategorias();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchArticulos();
      fetchNotificaciones();
    }
  }, [token]);

  // Cargar artículos (borradores y rechazados)
  const fetchArticulos = async () => {
    try {
      const response = await apiFetch(apiEndpoints.myArticles);
      if (!response.ok) throw new Error('Error al cargar artículos');

      const data = await response.json();
      const filtrados = data.filter(
        (a) => a.estado === 'borrador' || a.estado === 'rechazado'
      );
      setNotas(filtrados);
    } catch (err) {
      console.error('❌ Error cargando artículos:', err);
      setError('No se pudieron cargar los artículos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar notificaciones del usuario
  const fetchNotificaciones = async () => {
    try {
      const response = await apiFetch(`${apiEndpoints.articles}/user/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data);
      }
    } catch (err) {
      console.error('❌ Error al cargar notificaciones:', err);
    }
  };

  // Helpers
  const getNombreCategoria = (categoriaId) => {
    if (!categoriaId) return 'Sin categoría';
    const cat = categorias.find((c) => c.id_categoria === categoriaId);
    return cat ? cat.nombre : 'Sin categoría';
  };

  const getComentarioRechazo = (articuloId, titulo) => {
    const notif = notificaciones.find((n) => {
      if (!n.mensaje) return false;
      const tieneId = n.mensaje.includes(String(articuloId));
      const tieneTitulo = n.mensaje.includes(titulo || '');
      const esRechazo =
        n.mensaje.toLowerCase().includes('rechazado') ||
        (n.titulo || '').toLowerCase().includes('rechazado');
      return (tieneId || tieneTitulo) && esRechazo;
    });
    return notif ? notif.mensaje : null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-AR');
    } catch {
      return 'N/A';
    }
  };

  // Acciones
const handleDownload = async (id, nota) => {
  try {
    const response = await apiFetch(apiEndpoints.downloadArticle(id));
    
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    
    // ✅ EXTRAER el JSON de la respuesta
    const data = await response.json();
    
    console.log('🔍 Respuesta downloadArticle:', data);
    
    if (data.success && data.downloadUrl) {
      // ✅ Forzar descarga
      const downloadUrl = data.downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      console.log('🔗 Abriendo URL de descarga:', downloadUrl);
      window.open(downloadUrl, '_blank');
    } else {
      throw new Error(data.message || 'Error al descargar');
    }
  } catch (err) {
    console.error('❌ Error al descargar:', err);
    alert(`❌ ${err.message}`);
  }
};

  const handleSendToReview = async (id, titulo) => {
    try {
      const response = await apiFetch(`${apiEndpoints.articles}/${id}/send-to-review`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setNotas((prev) => prev.filter((item) => item.id_articulo !== id));
      alert(`✅ "${titulo}" enviado a revisión exitosamente`);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
      console.error('Error al enviar a revisión:', err);
    }
  };

  const handleDelete = async (id, titulo = 'este artículo') => {
    if (!window.confirm(`¿Eliminar "${titulo}" permanentemente?`)) return;
    try {
      const response = await apiFetch(`${apiEndpoints.articles}/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setNotas((prev) => prev.filter((item) => item.id_articulo !== id));
      alert(`✅ "${titulo}" fue eliminado correctamente`);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
      console.error('Error al eliminar:', err);
    }
  };

 const handleView = async (id, nota) => {
  try {
    const response = await apiFetch(apiEndpoints.viewArticle(id));
    
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    
    // ✅ EXTRAER el JSON de la respuesta
    const data = await response.json();
    
    console.log('🔍 Respuesta viewArticle:', data);
    
    if (data.success && data.viewUrl) {
      // ✅ ABRIR la URL de Cloudinary
      console.log('🔗 Abriendo URL:', data.viewUrl);
      window.open(data.viewUrl, '_blank');
    } else {
      throw new Error(data.message || 'Error al visualizar');
    }
  } catch (err) {
    console.error('❌ Error al visualizar:', err);
    alert(`❌ ${err.message}`);
  }
};

  const handleModificar = (nota) => {
    navigate('/periodista-upload', {
      state: { articulo: nota, modo: 'modificacion' },
    });
  };

  // Estado visual
  const getEstadoUI = (estado = '') => {
    const e = estado.toLowerCase();
    if (e.includes('rechaz')) return { cls: 'estado--bad', icon: '⛔' };
    if (e.includes('aprob') || e.includes('public')) return { cls: 'estado--ok', icon: '✅' };
    if (e.includes('borrad')) return { cls: 'estado--rev', icon: '📝' };
    return { cls: 'estado--rev', icon: '⏳' };
  };

  // Filtro de búsqueda
  const notasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return notas;
    return notas.filter((n) => {
      const t = (n.titulo || '').toLowerCase();
      const c = getNombreCategoria(n.categoria_id).toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }, [busqueda, notas, categorias]);

  // Render
  if (loading) return <div className="loading">Cargando artículos…</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="notas-page">
      <h1 className="notas-title">Mis artículos</h1>
      <div className="notas-card">
        {/* Toolbar */}
        <div className="notas-toolbar">
          <input
            className="input"
            placeholder="Buscar por título o categoría…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <div className="toolbar-buttons">
            <button className="btn btn--primary" onClick={() => navigate('/periodista-upload')}>
              + Nuevo artículo
            </button>
            <button className="btn btn--outline" onClick={() => navigate('/ArticulosEnRevision')}>
              Ver artículos en revisión
            </button>
          </div>
        </div>

        {/* Lista (mobile) */}
        <div className="notas-list">
          {notasFiltradas.length === 0 ? (
            <div className="empty-state">No hay artículos para mostrar.</div>
          ) : (
            notasFiltradas.map((nota) => {
              const comentario = getComentarioRechazo(nota.id_articulo, nota.titulo);
              const { cls: estadoCls, icon: estadoIcon } = getEstadoUI(nota.estado);

              return (
                <div key={nota.id_articulo} className="nota-card">
                  <div className="nota-header">
                    <div className="nota-titulo">{nota.titulo}</div>
                    <div className="nota-meta">
                      <div className="nota-meta-item">
                        <span className="chip chip--cat">
                          {getNombreCategoria(nota.categoria_id)}
                        </span>
                      </div>
                      <div className="nota-meta-item">
                        <span className={`nota-estado ${estadoCls}`}>
                          <i>{estadoIcon}</i> {nota.estado || 'Borrador'}
                        </span>
                      </div>
                      <div className="nota-meta-item">📅 {formatDate(nota.fecha_creacion)}</div>
                    </div>
                  </div>

                  {nota.estado === 'rechazado' && comentario && (
                    <div className="motivo">{comentario}</div>
                  )}

                  <div className="nota-actions">
                    <div className="action-buttons">
                      <button
                        className="btn-action btn--light"
                        onClick={() => handleDownload(nota.id_articulo, nota)}
                      >
                        📥 Descargar
                      </button>
                      <button
                        className="btn-action btn--light"
                        onClick={() => handleView(nota.id_articulo, nota)}
                      >
                        👁️ Leer
                      </button>

                      {nota.estado === 'borrador' && (
                        <button
                          className="btn-action btn--info"
                          onClick={() => handleSendToReview(nota.id_articulo, nota.titulo)}
                        >
                          📤 Enviar
                        </button>
                      )}

                      {nota.estado === 'rechazado' && (
                        <>
                          <button
                            className="btn-action btn--info"
                            onClick={() => handleSendToReview(nota.id_articulo, nota.titulo)}
                          >
                            🔄 Reenviar
                          </button>
                          <button
                            className="btn-action btn--warn"
                            onClick={() => handleModificar(nota)}
                          >
                            ✏️ Modificar
                          </button>
                        </>
                      )}

                      <button
                        className="btn-action btn--danger"
                        onClick={() => handleDelete(nota.id_articulo, nota.titulo)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tabla (desktop) */}
        {/* ... el bloque de la tabla queda igual que antes ... */}
      </div>
    </div>
  );
}

export default Notas;
