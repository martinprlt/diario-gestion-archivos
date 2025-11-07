// 📁 frontend/src/pages/GaleriaPersonal.jsx - CORREGIDA

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useCategorias } from "../context/CategoriasContext.jsx";
import { apiEndpoints, apiFetch } from "../config/api.js";
import "../assets/styles/galeriaPersonal.css";

function GaleriaPersonal() {
  const [fotos, setFotos] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFoto, setSelectedFoto] = useState(null);
  const { token } = useContext(AuthContext);
  const { categorias } = useCategorias();

  const placeholder = "https://placehold.co/600x400?text=Sin+imagen";

  // Cargar fotos personales
  useEffect(() => {
    const fetchFotos = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`${apiEndpoints.photos}/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error("Error al cargar tus fotos");
        
        const data = await res.json();
        setFotos(data || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar tus fotos personales");
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchFotos();
  }, [token]);

  // Eliminar foto
  const handleDelete = async (fotoId) => {
    if (!window.confirm("¿Estás seguro de que querés eliminar esta foto?")) {
      return;
    }

    try {
      const res = await apiFetch(`${apiEndpoints.photos}/${fotoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudo eliminar la foto");
      
      setFotos(fotos.filter((foto) => foto.id_foto !== fotoId));
      alert("✅ Foto eliminada correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ Error al eliminar la foto");
    }
  };

  // Cambiar visibilidad
  const handleToggleVisibilidad = async (fotoId) => {
    try {
      const res = await apiFetch(`${apiEndpoints.photos}/${fotoId}/toggle-visibility`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cambiar visibilidad");

      const data = await res.json();

      setFotos((prevFotos) =>
        prevFotos.map((foto) =>
          foto.id_foto === fotoId 
            ? { ...foto, es_global: data.es_global } 
            : foto
        )
      );

      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo cambiar la visibilidad");
    }
  };

  // Filtrar fotos
  const fotosFiltradas = fotos.filter((foto) => {
    const coincideCategoria =
      !categoriaFiltro || foto.categoria_id?.toString() === categoriaFiltro;
    
    const coincideBusqueda =
      !searchTerm ||
      foto.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      foto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return coincideCategoria && coincideBusqueda;
  });

  const abrirLightbox = (foto) => setSelectedFoto(foto);
  const cerrarLightbox = () => setSelectedFoto(null);
  const volverArriba = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (loading) return <div className="sin-fotos-personal">Cargando tus fotos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="galeria-personal-container">
      <h2 className="titulo-galeria-personal">Mi Galería Personal</h2>

      {/* FILTROS */}
      <div className="filtros-galeria-personal">
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
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* GRID DE FOTOS */}
      <div className="masonry-grid-personal">
        {fotosFiltradas.length > 0 ? (
          fotosFiltradas.map((foto) => (
            <div key={foto.id_foto} className="masonry-item-personal">
              <div
                className="imagen-wrapper"
                onClick={() => abrirLightbox(foto)}
              >
                <button
                  className="delete-btn-personal eliminar"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(foto.id_foto);
                  }}
                  title="Eliminar foto"
                >
                  🗑️
                </button>

                <button
                  className="toggle-btn-personal"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibilidad(foto.id_foto);
                  }}
                  title={
                    foto.es_global
                      ? "Visible globalmente - Click para hacer privada"
                      : "Privada - Click para compartir globalmente"
                  }
                >
                  {foto.es_global ? "🌍" : "🔒"}
                </button>

                <img
                  src={foto.url?.startsWith("http") ? foto.url : placeholder}
                  onError={(e) => { e.currentTarget.src = placeholder; }}
                  alt={foto.titulo || "Foto sin título"}
                  className="imagen-galeria-personal"
                />
                
                {foto.categoria_nombre && (
                  <span className="badge-categoria-personal">
                    {foto.categoria_nombre}
                  </span>
                )}
              </div>

              <div className="info-foto-personal">
                <h3>{foto.titulo || "Sin título"}</h3>
                <p className="descripcion-personal">
                  {foto.descripcion || "Sin descripción"}
                </p>
                <p className="fecha-personal">
                  📅{" "}
                  {foto.fecha
                    ? new Date(foto.fecha).toLocaleDateString("es-AR")
                    : "Fecha desconocida"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="sin-fotos-personal">
            {searchTerm || categoriaFiltro
              ? "No se encontraron fotos con esos filtros"
              : "Aún no tenés fotos subidas. ¡Subí tu primera foto!"}
          </p>
        )}
      </div>

      {/* LIGHTBOX */}
      {selectedFoto && (
        <div className="lightbox-personal" onClick={cerrarLightbox}>
          <div
            className="lightbox-content-personal"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedFoto.url?.startsWith("http") ? selectedFoto.url : placeholder}
              onError={(e) => { e.currentTarget.src = placeholder; }}
              alt={selectedFoto.titulo || "Foto"}
              className="lightbox-img-personal"
            />
            <p className="lightbox-text-personal">
              <strong>{selectedFoto.titulo}</strong>
            </p>
            <button className="cerrar-btn-personal" onClick={cerrarLightbox}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* BOTÓN VOLVER ARRIBA */}
      <button className="volver-arriba-personal" onClick={volverArriba}>
        ↑
      </button>
    </div>
  );
}

export default GaleriaPersonal;