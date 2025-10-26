import React, { useState, useEffect, useContext, useCallback } from "react";
import "../assets/styles/galeria.css";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const ModalFoto = ({ foto, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <img
          src={`http://localhost:5000/${foto.ruta_archivo.replace(/\\/g, "/")}`}
          alt={foto.titulo}
          className="modal-image"
        />
        <div className="modal-info">
          <h3>{foto.titulo}</h3>
          <p>{foto.descripcion}</p>
          <span className="modal-fecha">
            Subida el: {new Date(foto.fecha_creacion).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const FotoItem = ({ foto, onToggle, onDownload, onView }) => {
  const [imageStatus, setImageStatus] = useState("loading");

  return (
    <div className="tarjeta-foto">
      <div className="imagen-container" onClick={() => onView(foto)}>
        {imageStatus === "loading" && (
          <div className="skeleton-loader">
            <div className="spinner"></div>
          </div>
        )}

        <img
          src={`http://localhost:5000/${foto.ruta_archivo.replace(/\\/g, "/")}`}
          alt={foto.titulo}
          className={`foto-imagen ${imageStatus === "loaded" ? "loaded" : ""}`}
          onLoad={() => setImageStatus("loaded")}
          onError={() => setImageStatus("error")}
        />

        {imageStatus === "error" && (
          <div className="error-placeholder">
            <span>❌ Error al cargar</span>
          </div>
        )}

        <div className="overlay">
          <span className="view-text">👁️ Ver</span>
        </div>
      </div>

      <div className="tarjeta-info">
        <h3 className="foto-titulo">{foto.titulo}</h3>
        <p className="foto-descripcion">{foto.descripcion}</p>

        <div className="botones-accion">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(foto.id_foto, foto.es_global);
            }}
            className={`btn-visibilidad ${
              foto.es_global ? "global" : "personal"
            }`}
          >
            {foto.es_global ? "🌍 Global" : "👤 Personal"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(foto.id_foto, foto.nombre_original);
            }}
            className="btn-descargar"
          >
            ⬇️ Descargar
          </button>
        </div>
      </div>
    </div>
  );
};

const GaleriaPersonal = () => {
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const { token } = useContext(AuthContext);

  const cargarFotos = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/fotos/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFotos(response.data);
    } catch (error) {
      console.error("Error al cargar fotos:", error);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarFotos();
  }, [cargarFotos]);

  const toggleVisibilidad = async (fotoId, esGlobalActual) => {
    try {
      await axios.put(
        `http://localhost:5000/api/fotos/${fotoId}/toggle-visibility`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFotos(
        fotos.map((foto) =>
          foto.id_foto === fotoId
            ? { ...foto, es_global: !esGlobalActual }
            : foto
        )
      );
    } catch (error) {
      console.error("Error al cambiar visibilidad:", error);
    }
  };

  const handleDescargar = async (fotoId, nombreOriginal) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/fotos/download/${fotoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreOriginal || `foto_${fotoId}.jpg`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      console.error("Error al descargar:", error);
      alert("Error al descargar la foto");
    }
  };

  const abrirModal = (foto) => {
    setFotoSeleccionada(foto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setFotoSeleccionada(null);
  };

  if (cargando) {
    return (
      <div className="galeria-container">
        <h1>Mi Galería</h1>
        <div className="cargando-container">
          <div className="spinner grande"></div>
          <p>Cargando tus fotos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="galeria-container">
      <h1>Mi Galería</h1>

      {fotos.length === 0 ? (
        <div className="no-fotos">
          <p>No tienes fotos subidas todavía.</p>
          <button onClick={() => (window.location.href = "/fotografo-upload")}>
            📸 Subir mi primera foto
          </button>
        </div>
      ) : (
        <div className="galeria-grid">
          {fotos.map((foto) => (
            <FotoItem
              key={foto.id_foto}
              foto={foto}
              onToggle={toggleVisibilidad}
              onDownload={handleDescargar}
              onView={abrirModal}
            />
          ))}
        </div>
      )}

      <ModalFoto
        foto={fotoSeleccionada}
        isOpen={modalAbierto}
        onClose={cerrarModal}
      />
    </div>
  );
};

export default GaleriaPersonal;
