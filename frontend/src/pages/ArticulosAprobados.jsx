// src/pages/ArticulosAprobados.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config/api.js';
import '../assets/styles/articulos-aprobado.css';

const ArticulosAprobados = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchArticulosAprobados = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/articles/editor/approved`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setArticulos(response.data);
        } else {
          setError("Se recibió un formato de datos inesperado del servidor.");
        }
      } catch (err) {
        setError(
          'No se pudieron cargar los artículos aprobados. ' +
          (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticulosAprobados();
  }, [token]);

  const handleDownload = async (id, nombreOriginal) => {
    try {
      const response = await axios.get(`${API_URL}/api/articles/download/${id}`, {
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
    } catch {
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
