import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../assets/styles/articulos-aprobado.css';

const ArticulosAprobados = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  // ✅ URL base desde environment variables
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchArticulosAprobados = async () => {
      try {
        console.log('🔍 Haciendo request a:', `${API_BASE_URL}/api/articles/editor/approved`);
        
        const response = await axios.get(`${API_BASE_URL}/api/articles/editor/approved`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('✅ Respuesta de la API:', response.data); 
        
        if (Array.isArray(response.data)) {
          setArticulos(response.data);
        } else {
          console.error("❌ La respuesta de la API no es un array:", response.data);
          setError("Se recibió un formato de datos inesperado del servidor.");
        }
      } catch (err) {
        console.error('💥 Error completo:', err);
        console.error('💥 Response data:', err.response?.data);
        setError('No se pudieron cargar los artículos aprobados. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchArticulosAprobados();
    }
  }, [token, API_BASE_URL]);

  const handleDownload = async (id, nombreOriginal) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/articles/download/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreOriginal);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      alert('No se pudo descargar el archivo.');
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
                <td>{`${articulo.periodista_nombre} ${articulo.periodista_apellido} (${articulo.periodista_usuario})`}</td>
                <td>{new Date(articulo.fecha_publicacion).toLocaleDateString()}</td>
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
};

export default ArticulosAprobados;