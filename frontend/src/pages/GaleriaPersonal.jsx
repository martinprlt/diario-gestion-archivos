import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useCategorias } from "../context/CategoriasContext.jsx";
import "../assets/styles/galeriaPersonal.css";

function GaleriaPersonal() {
  const [fotos, setFotos] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [selectedFoto, setSelectedFoto] = useState(null);
  const { token } = useContext(AuthContext);
  const { categorias } = useCategorias();

  useEffect(() => {
    const fetchFotos = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/fotos/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar tus fotos personales");
        const data = await res.json();
        setFotos(data || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar tus fotos personales");
      }
    };
    fetchFotos();
  }, [token]);

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
            <div
              key={foto.id_foto}
              className="masonry-item-personal"
              onClick={() => abrirLightbox(foto)}
            >
              <div className="imagen-wrapper">
                <img
                  src={
                    foto.url && foto.url.startsWith("http")
                      ? foto.url
                      : "https://placehold.co/600x400?text=Sin+imagen"
                  }
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
                <p className="autor-personal">
                  📷 {foto.fotografo_nombre || "Autor desconocido"}
                </p>
                <p className="fecha-personal">
                  📅{" "}
                  {foto.fecha_publicacion
                    ? new Date(foto.fecha_publicacion).toLocaleDateString(
                        "es-AR"
                      )
                    : "Fecha desconocida"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="sin-fotos-personal">No tenés fotos personales 😕</p>
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
              src={
                selectedFoto.url && selectedFoto.url.startsWith("http")
                  ? selectedFoto.url
                  : "https://placehold.co/800x600?text=Sin+imagen"
              }
              alt={selectedFoto.titulo || "Foto"}
              className="lightbox-img-personal"
            />
            <p className="lightbox-text-personal">
              <strong>{selectedFoto.titulo}</strong> —{" "}
              {selectedFoto.fotografo_nombre || "Autor desconocido"}
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
