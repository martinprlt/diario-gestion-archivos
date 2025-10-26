import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useCategorias } from "../context/CategoriasContext.jsx";
import "../assets/styles/global.css";

function GaleriaGlobal() {
  const [fotos, setFotos] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFoto, setSelectedFoto] = useState(null);
  const { token } = useContext(AuthContext);
  const { categorias } = useCategorias();

  const placeholder = "https://placehold.co/800x600?text=Sin+imagen";

  const normalizar = (s = "") =>
    s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();

  useEffect(() => {
    const ac = new AbortController();

    const fetchFotos = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:5000/api/fotos/global", {
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });

        if (!res.ok) throw new Error("Error al cargar las fotos");
        const data = await res.json();
        setFotos(data || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("No se pudieron cargar las fotos");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchFotos();
    return () => ac.abort();
  }, [token]);

  const term = normalizar(searchTerm);

  const fotosFiltradas = fotos.filter((foto) => {
    const coincideCategoria =
      !categoriaFiltro || foto.categoria_id?.toString() === categoriaFiltro;

    const titulo = normalizar(foto.titulo);
    const desc = normalizar(foto.descripcion);
    const coincideBusqueda = !term || titulo.includes(term) || desc.includes(term);

    return coincideCategoria && coincideBusqueda;
  });

  const abrirLightbox = (foto) => setSelectedFoto(foto);
  const cerrarLightbox = () => setSelectedFoto(null);
  const volverArriba = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (loading) return <div className="sin-fotos">Cargando fotos…</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="galeria-container">
      <h2 className="titulo-galeria">Galería Global de Fotos</h2>

      <div className="filtros-galeria">
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

      {/* MASONRY GRID */}
      <div className="masonry-grid">
        {fotosFiltradas.length > 0 ? (
          fotosFiltradas.map((foto) => {
            const fechaStr = foto.fecha || foto.fecha_publicacion;
            return (
              <div
                key={foto.id_foto}
                className="masonry-item"
                role="button"
                tabIndex={0}
                onClick={() => abrirLightbox(foto)}
                onKeyDown={(e) => (e.key === "Enter" ? abrirLightbox(foto) : null)}
              >
                <div className="imagen-wrapper">
                  <img
                    src={foto.url?.startsWith("http") ? foto.url : placeholder}
                    onError={(e) => {
                      e.currentTarget.src = placeholder;
                    }}
                    alt={foto.titulo || "Foto sin título"}
                    className="imagen-galeria"
                  />
                  {foto.categoria_nombre && (
                    <span className="badge-categoria">{foto.categoria_nombre}</span>
                  )}
                </div>

                <div className="info-foto">
                  <h3>{foto.titulo || "Sin título"}</h3>
                  <p className="descripcion">{foto.descripcion || "Sin descripción"}</p>
                  <p className="autor">
                    📷 {foto.fotografo_nombre || "Autor desconocido"}
                  </p>
                  <p className="fecha">
                    📅{" "}
                    {fechaStr
                      ? new Date(fechaStr).toLocaleDateString("es-AR")
                      : "Fecha desconocida"}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="sin-fotos">No hay fotos disponibles 😕</p>
        )}
      </div>

      {/* LIGHTBOX */}
      {selectedFoto && (
        <div className="lightbox" onClick={cerrarLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={
                selectedFoto.url?.startsWith("http") ? selectedFoto.url : placeholder
              }
              onError={(e) => {
                e.currentTarget.src = placeholder;
              }}
              alt={selectedFoto.titulo || "Foto"}
              className="lightbox-img"
            />
            <p className="lightbox-text">
              <strong>{selectedFoto.titulo || "Sin título"}</strong> —{" "}
              {selectedFoto.fotografo_nombre || "Autor desconocido"}
            </p>
            <button className="cerrar-btn" onClick={cerrarLightbox}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* BOTÓN VOLVER ARRIBA */}
      <button className="volver-arriba" onClick={volverArriba}>
        ↑
      </button>
    </div>
  );
}

export default GaleriaGlobal;
