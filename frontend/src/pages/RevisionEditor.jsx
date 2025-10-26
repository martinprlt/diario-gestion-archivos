import { useEffect, useState, useContext, useCallback } from 'react'; // 👈 AGREGAR useCallback
import { AuthContext } from '../context/AuthContext';
import { useCategorias } from '../context/CategoriasContext.jsx';
import '../assets/styles/notas.css';

function RevisionEditor() {
  const [articulos, setArticulos] = useState([]);
  const [articulosFiltrados, setArticulosFiltrados] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { token } = useContext(AuthContext);
  const { categorias } = useCategorias();

  useEffect(() => {
    fetchArticulosEnRevision();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 FUNCIÓN PARA APLICAR FILTROS CON useCallback
  const aplicarFiltros = useCallback(() => {
    let filtrados = [...articulos];

    // Filtrar por categoría
    if (categoriaFiltro) {
      filtrados = filtrados.filter(art => 
        art.categoria_id.toString() === categoriaFiltro
      );
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtrados = filtrados.filter(art =>
        art.titulo.toLowerCase().includes(term) ||
        (art.periodista_nombre && art.periodista_nombre.toLowerCase().includes(term)) ||
        (art.periodista_apellido && art.periodista_apellido.toLowerCase().includes(term)) ||
        (art.categoria_nombre && art.categoria_nombre.toLowerCase().includes(term))
      );
    }

    setArticulosFiltrados(filtrados);
  }, [articulos, categoriaFiltro, searchTerm]); // 👈 DEPENDENCIAS CORRECTAS

  // 🔹 Aplicar filtros cuando cambien las dependencias
  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]); // 👈 SOLO aplicarFiltros (que ya incluye todas las dependencias)

  const fetchArticulosEnRevision = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/articles/editor/review', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Error al cargar artículos en revisión');
      }

      const data = await res.json();
      setArticulos(data);
    } catch (err) {
      console.error('Error al cargar artículos:', err);
      setError('No se pudieron cargar los artículos en revisión');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 LIMPIAR FILTROS
  const limpiarFiltros = () => {
    setCategoriaFiltro('');
    setSearchTerm('');
  };

  const handleComentarioChange = (id, texto) => {
    setComentarios({ ...comentarios, [id]: texto });
  };

  const manejarDecision = async (articuloId, decision) => {
    try {
      const comentario = comentarios[articuloId] || '';
      const endpoint = decision === 'approve' 
        ? `http://localhost:5000/api/articles/${articuloId}/approve`
        : `http://localhost:5000/api/articles/${articuloId}/reject`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comentario }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la decisión');
      }

      alert(data.message || `Artículo ${decision === 'approve' ? 'aprobado' : 'rechazado'} correctamente`);
      setComentarios((prev) => ({ ...prev, [articuloId]: '' }));
      fetchArticulosEnRevision();
    } catch (error) {
      console.error('Error al procesar decisión:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const verArchivo = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/articles/view/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al visualizar el archivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const fileType = blob.type;

      if (fileType === 'application/pdf') {
        window.open(url, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `articulo_${id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 100);

    } catch (error) {
      console.error('Error al ver archivo:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const descargarArchivo = async (id, nombreOriginal) => {
    try {
      const response = await fetch(`http://localhost:5000/api/articles/download/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreOriginal || `articulo_${id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar el archivo');
    }
  };

  if (loading) return <div className="loading">Cargando artículos en revisión...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="contenedor-notas">
      <h2>Artículos en Revisión</h2>
      
      {/* 🔹 FILTROS PARA EDITORES */}
      <div className="filtros-editor">
        <div className="filtro-group">
          <label htmlFor="categoria-filtro">Filtrar por categoría:</label>
          <select
            id="categoria-filtro"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label htmlFor="busqueda-editor">Buscar:</label>
          <input
            type="text"
            id="busqueda-editor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, periodista o categoría..."
          />
        </div>

        {(categoriaFiltro || searchTerm) && (
          <button className="limpiar-filtros-btn" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* 🔹 INFORMACIÓN DE RESULTADOS */}
      <div className="resultados-info">
        <p>
          Mostrando <strong>{articulosFiltrados.length}</strong> de <strong>{articulos.length}</strong> artículos en revisión
          {categoriaFiltro && ` en ${categorias.find(c => c.id_categoria.toString() === categoriaFiltro)?.nombre}`}
          {searchTerm && ` que coinciden con "${searchTerm}"`}
        </p>
      </div>
      
      {articulosFiltrados.length === 0 ? (
        <div className="no-articulos">
          <p>
            {articulos.length === 0 
              ? "No hay artículos en revisión en este momento." 
              : "No se encontraron artículos con los filtros aplicados."
            }
          </p>
          {(categoriaFiltro || searchTerm) && (
            <button onClick={limpiarFiltros} className="btn-primary">
              Mostrar todos los artículos
            </button>
          )}
        </div>
      ) : (
        <table className="tabla-notas">
          <thead>
            <tr>
              <th>Título</th>
              <th>Periodista</th>
              <th>Categoría</th>
              <th>Fecha de envío</th>
              <th>Comentario del editor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articulosFiltrados.map((art) => (
              <tr key={art.id_articulo}>
                <td>
                  <strong>{art.titulo}</strong>
                </td>
                <td>{art.periodista_nombre} {art.periodista_apellido}</td>
                <td>
                  <span className="categoria-badge">
                    {art.categoria_nombre}
                  </span>
                </td>
                <td>{new Date(art.fecha_modificacion).toLocaleDateString('es-AR')}</td>
                <td>
                  <textarea 
                    value={comentarios[art.id_articulo] || ''} 
                    onChange={(e) => handleComentarioChange(art.id_articulo, e.target.value)} 
                    placeholder="Escribe tu comentario aquí..." 
                    rows="3"
                  />
                  <div className="decision-buttons">
                    <button 
                      className="accion-btn btn-aprobar"
                      onClick={() => manejarDecision(art.id_articulo, 'approve')}
                    >
                      ✓ Aprobar
                    </button>
                    <button 
                      className="accion-btn btn-rechazar"
                      onClick={() => manejarDecision(art.id_articulo, 'reject')}
                    >
                      ✗ Rechazar
                    </button>
                  </div>
                </td>
                <td>
                  <div className="archivo-buttons">
                    <button 
                      className="accion-btn btn-ver"
                      onClick={() => verArchivo(art.id_articulo)}
                    >
                      👁 Ver
                    </button>
                    <button 
                      className="accion-btn btn-descargar"
                      onClick={() => descargarArchivo(art.id_articulo, art.nombre_original)}
                    >
                      📥 Descargar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RevisionEditor;