// src/pages/RevisionEditor.jsx - CORREGIDO
import { useEffect, useState, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useCategorias } from "../context/CategoriasContext.jsx";
import { apiEndpoints, apiFetch } from "../config/api.js";
import "../assets/styles/EditorRevision.css";

function RevisionEditor() {
  const [articulos, setArticulos] = useState([]);
  const [articulosFiltrados, setArticulosFiltrados] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { token } = useContext(AuthContext);
  const { categorias } = useCategorias();
  const carruselRef = useRef(null);

  // 🔹 Obtener artículos
  const fetchArticulosEnRevision = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(apiEndpoints.articlesForReview);

      if (!res.ok) throw new Error("Error al cargar artículos en revisión");

      const data = await res.json();
      setArticulos(data);
      setArticulosFiltrados(data);
    } catch (err) {
      setError("Error al cargar artículos en revisión: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticulosEnRevision();
  }, [fetchArticulosEnRevision]);

  // 🔹 Filtros dinámicos
  useEffect(() => {
    let filtrados = [...articulos];
    if (categoriaFiltro)
      filtrados = filtrados.filter(
        (art) => art.categoria_id && art.categoria_id.toString() === categoriaFiltro
      );

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtrados = filtrados.filter(
        (art) =>
          art.titulo?.toLowerCase().includes(term) ||
          art.periodista_nombre?.toLowerCase().includes(term) ||
          art.periodista_apellido?.toLowerCase().includes(term)
      );
    }

    setArticulosFiltrados(filtrados);
  }, [articulos, categoriaFiltro, searchTerm]);

  // 🔹 Comentarios y decisiones
  const handleComentarioChange = (id, texto) =>
    setComentarios((prev) => ({ ...prev, [id]: texto }));

  const manejarDecision = async (articuloId, decision) => {
    try {
      const comentario = comentarios[articuloId] || "";
      const endpoint = decision === "approve" 
        ? apiEndpoints.approveArticle(articuloId)
        : apiEndpoints.rejectArticle(articuloId);

      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ comentario }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al procesar decisión");

      alert(data.message || `Artículo ${decision === "approve" ? "aprobado" : "rechazado"} correctamente`);
      fetchArticulosEnRevision();
    } catch (err) {
      alert(err.message);
    }
  };

  // 🔹 Ver y descargar archivos - CORREGIDOS
  const verArchivo = async (id) => {
    try {
      const response = await apiFetch(apiEndpoints.viewArticle(id));
      const data = await response.json();
      
      if (data.success && data.viewUrl) {
        window.open(data.viewUrl, '_blank');
      } else {
        throw new Error(data.message || 'Error al visualizar');
      }
    } catch (err) {
      console.error('❌ Error al visualizar:', err);
      alert(`❌ ${err.message}`);
    }
  };

  const descargarArchivo = async (id, nombreOriginal) => {
    try {
      const response = await apiFetch(apiEndpoints.downloadArticle(id));
      const data = await response.json();
      
      if (data.success && data.downloadUrl) {
        // ✅ Forzar descarga para cualquier tipo de archivo
        const downloadUrl = data.downloadUrl.replace('/upload/', '/upload/fl_attachment/');
        window.open(downloadUrl, '_blank');
      } else {
        throw new Error(data.message || 'Error al descargar');
      }
    } catch (err) {
      console.error('❌ Error al descargar:', err);
      alert(`❌ ${err.message}`);
    }
  };

  // 🔹 Navegación del carrusel
  const scrollIzquierda = () => {
    if (carruselRef.current) {
      carruselRef.current.scrollBy({ left: -1100, behavior: "smooth" });
    }
  };

  const scrollDerecha = () => {
    if (carruselRef.current) {
      carruselRef.current.scrollBy({ left: 1100, behavior: "smooth" });
    }
  };

  if (loading) return <div className="loading">Cargando artículos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="revisiones-container">
      <div className="encabezado">
        <h2 className="titulo-seccion">Artículos en Revisión</h2>
      </div>

      <div className="filtros">
        <div className="campo">
          <label>Categoría:</label>
          <select
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

        <div className="campo">
          <label>Buscar:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título o periodista..."
          />
        </div>
      </div>

      <div className="carrusel-container">
        <button className="flecha izquierda" onClick={scrollIzquierda}>
          ‹
        </button>

        <div className="carrusel-flechas" ref={carruselRef}>
          {articulosFiltrados.map((art) => (
            <div key={art.id_articulo} className="tarjeta">
              <h3>{art.titulo}</h3>
              <p className="autor">
                🖋 {art.periodista_nombre} {art.periodista_apellido}
              </p>
              <p className="fecha">
                📅 {art.fecha_modificacion ? new Date(art.fecha_modificacion).toLocaleDateString("es-AR") : 'N/A'}
              </p>
              <textarea
                placeholder="Comentario del editor..."
                value={comentarios[art.id_articulo] || ""}
                onChange={(e) =>
                  handleComentarioChange(art.id_articulo, e.target.value)
                }
              />
              <div className="acciones">
                <button
                  className="btn aprobar"
                  onClick={() => manejarDecision(art.id_articulo, "approve")}
                >
                  ✓ Aprobar
                </button>
                <button
                  className="btn rechazar"
                  onClick={() => manejarDecision(art.id_articulo, "reject")}
                >
                  ✗ Rechazar
                </button>
              </div>
              <div className="archivos">
                <button onClick={() => verArchivo(art.id_articulo)}>
                  👁 Ver
                </button>
                <button
                  onClick={() =>
                    descargarArchivo(art.id_articulo, art.nombre_original)
                  }
                >
                  📥 Descargar
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="flecha derecha" onClick={scrollDerecha}>
          ›
        </button>
      </div>
    </div>
  );
}

export default RevisionEditor;