// src/pages/ArticulosAprobados.jsx - CORREGIDO
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiEndpoints, apiFetch } from '../config/api.js';
import '../assets/styles/articulos-aprobado.css';

const ArticulosAprobados = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchArticulosAprobados = async () => {
      try {
        // ✅ USAR EL ENDPOINT CORRECTO para editores
        const response = await apiFetch(apiEndpoints.articlesApproved);
        
        if (!response.ok) {
          throw new Error('Error al cargar artículos aprobados');
        }

        const data = await response.json();
        
        if (Array.isArray(data)) {
          setArticulos(data);
        } else {
          setError("Se recibió un formato de datos inesperado del servidor.");
        }
      } catch (err) {
        setError(
          'No se pudieron cargar los artículos aprobados. ' +
          (err.message || 'Error desconocido')
        );
        console.error('❌ Error detalles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticulosAprobados();
  }, [token]);

  const handleDownload = async (id, nombreOriginal) => {
    try {
      const response = await apiFetch(apiEndpoints.downloadArticle(id));
      const data = await response.json();
      
      if (data.success && data.downloadUrl) {
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

  if (loading) return <p>Cargando artículos aprobados...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="revisiones-container">
      <h1 className="titulo-seccion">Artículos Aprobados</h1>
      {articulos.length === 0 ? (
        <p>No hay artículos aprobados en este momento.</p>
      ) : (
        <table className="articulos-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Fecha de Publicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articulos.map((articulo) => (
              <tr key={articulo.id_articulo}>
                <td>{articulo.titulo}</td>
                <td>{`${articulo.periodista_nombre} ${articulo.periodista_apellido}`}</td>
                <td>{articulo.fecha_publicacion ? new Date(articulo.fecha_publicacion).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <button
                    className="btn-download"
                    onClick={() => handleDownload(articulo.id_articulo, articulo.nombre_original)}
                  >
                    Descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};a

export default ArticulosAprobados;