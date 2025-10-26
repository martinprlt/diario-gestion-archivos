// 📁 src/pages/GaleriaGlobal.jsx - VERSIÓN FUSIONADA CON FILTROS Y CONTEXT
import React, { useState, useEffect } from 'react';
import { useCategorias } from '../context/CategoriasContext.jsx';
import '../assets/styles/galeria.css';

const GaleriaGlobal = () => {
  const { categorias } = useCategorias(); // 🔹 Obtener categorías desde el Context
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 🔹 Cargar fotos desde la API, opcionalmente filtradas por categoría
  const cargarFotos = async (categoriaId = '') => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/fotos/globales';
      if (categoriaId) url += `?categoria=${categoriaId}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar las fotos');

      const data = await response.json();
      setFotos(data);
      setError(null);
    } catch (err) {
      console.error('Error cargando fotos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar fotos al inicio o cuando cambia el filtro de categoría
  useEffect(() => {
    cargarFotos(categoriaFiltro);
  }, [categoriaFiltro]);

  // 🔹 Filtrar fotos por búsqueda
  const fotosFiltradas = fotos.filter(foto => 
    foto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (foto.descripcion && foto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 🔹 Limpiar filtros
  const limpiarFiltros = () => {
    setCategoriaFiltro('');
    setSearchTerm('');
  };

  return (
    <div className="galeria-container">
      <div className="galeria-header">
        <h1>Galería Global de Fotos</h1>
        <p>Explora todas las fotos publicadas por nuestros fotógrafos</p>
      </div>

      {/* 🔹 FILTROS */}
      <div className="filtros-container">
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
          <label htmlFor="busqueda">Buscar:</label>
          <input
            type="text"
            id="busqueda"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título o descripción..."
          />
        </div>

        {(categoriaFiltro || searchTerm) && (
          <button className="limpiar-filtros-btn" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* 🔹 CONTADOR DE RESULTADOS */}
      <div className="resultados-info">
        <p>
          Mostrando <strong>{fotosFiltradas.length}</strong> de <strong>{fotos.length}</strong> fotos
          {categoriaFiltro && ` en ${categorias.find(c => c.id_categoria.toString() === categoriaFiltro)?.nombre}`}
          {searchTerm && ` que coinciden con "${searchTerm}"`}
        </p>
      </div>

      {/* 🔹 GALERÍA */}
      {loading ? (
        <div className="loading">🔄 Cargando fotos...</div>
      ) : error ? (
        <div className="error">❌ Error: {error}</div>
      ) : fotosFiltradas.length === 0 ? (
        <div className="no-resultados">
          <p>No se encontraron fotos con los filtros aplicados</p>
          <button onClick={limpiarFiltros} className="btn-primary">
            Mostrar todas las fotos
          </button>
        </div>
      ) : (
        <div className="galeria-grid">
          {fotosFiltradas.map((foto) => (
            <div key={foto.id_foto} className="galeria-item">
              <img 
                src={`http://localhost:5000/${foto.ruta_archivo.replace(/\\/g, '/')}`} 
                alt={foto.titulo}
                onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
              />
              <div className="galeria-info">
                <h3>{foto.titulo}</h3>
                {foto.descripcion && <p>{foto.descripcion}</p>}
                <div className="galeria-meta">
                  {foto.categoria_nombre && (
                    <span className="categoria-badge">{foto.categoria_nombre}</span>
                  )}
                  <span className="fotografo">
                    Por: {foto.fotografo_nombre} {foto.fotografo_apellido}
                  </span>
                  <span className="fecha">{new Date(foto.fecha).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GaleriaGlobal;
