// 📁 frontend/src/pages/FotografoUpload.jsx - VERSIÓN FINAL

import React, { useRef, useState, useEffect, useContext } from 'react';
import { useCategorias } from '../context/CategoriasContext.jsx';
import { AuthContext } from '../context/AuthContext.js';
import { apiEndpoints } from '../config/api.js';
import '../assets/styles/fotografo-upload.css';

export default function FotografoUpload() {
  const { categorias, loading, error } = useCategorias();
  const { token } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [archivoSubido, setArchivoSubido] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorUpload, setErrorUpload] = useState('');
  const inputFileRef = useRef();
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  useEffect(() => {
    if (categorias.length > 0 && !category) {
      setCategory(categorias[0].id_categoria.toString());
    }
  }, [categorias, category]);

  const handleUploadClick = () => inputFileRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoSeleccionado(file);
      setPreview(URL.createObjectURL(file));
      setFileName(title.trim() !== '' ? title.trim() : file.name);
      setMostrarConfirmacion(true);
    }
  };

  const confirmarSubida = async () => {
    if (!archivoSeleccionado || !title.trim()) {
      setErrorUpload('Título y archivo son obligatorios');
      return;
    }

    if (!category) {
      setErrorUpload('Debes seleccionar una categoría');
      return;
    }

    setCargando(true);
    setErrorUpload('');

    try {
      const formData = new FormData();
      formData.append('archivo', archivoSeleccionado);
      formData.append('titulo', title);
      formData.append('descripcion', description);
      formData.append('categoria_id', category);
      formData.append('es_global', 'true');

      const response = await fetch(`${apiEndpoints.photos}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      if (data.success) {
        setArchivoSubido(true);
        setMostrarConfirmacion(false);
        setFileName(title);
        alert('✅ Foto subida correctamente');
      } else {
        throw new Error(data.message || 'Error desconocido');
      }

    } catch (err) {
      console.error('Error:', err);
      setErrorUpload(err.message);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  const cancelarSubida = () => {
    setPreview(null);
    setFileName('');
    setArchivoSubido(false);
    setMostrarConfirmacion(false);
    setTitle('');
    setDescription('');
    setCategory(categorias[0]?.id_categoria.toString() || '');
    setArchivoSeleccionado(null);
    setErrorUpload('');
  };

  const editarEntrega = () => {
    setArchivoSubido(false);
    setMostrarConfirmacion(false);
    inputFileRef.current.click();
  };

  const handleTitleChange = (e) => {
    const nuevoTitulo = e.target.value;
    setTitle(nuevoTitulo);
    if (!archivoSubido) setFileName(nuevoTitulo);
  };

  const handleDescriptionChange = (e) => setDescription(e.target.value);

  return (
    <div className="fotografo-upload-container">
      <div className="upload-header">FOTÓGRAFO</div>
      <div className="upload-wrapper">
        <aside className="sidebar"></aside>
        <main className="upload-main">
          <div className="upload-form">
            <div className="left-section">
              <label htmlFor="title">Título *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                placeholder="Ingresar título"
                disabled={archivoSubido || cargando}
              />
              
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Descripción de la foto (opcional)"
                disabled={archivoSubido || cargando}
                rows="3"
              />
              
              <label htmlFor="category">Categoría *</label>
              {loading ? (
                <div className="loading-categorias">🔄 Cargando categorías...</div>
              ) : error ? (
                <div className="error-categorias">❌ Error cargando categorías</div>
              ) : (
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={archivoSubido || cargando}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              )}

              <button
                className="upload-button"
                onClick={handleUploadClick}
                disabled={cargando}
              >
                {cargando ? 'Subiendo...' : 'Subir archivo'}
              </button>

              <input
                type="file"
                accept="image/*"
                ref={inputFileRef}
                onChange={handleFileChange}
                hidden
                disabled={cargando}
              />

              {errorUpload && <div className="error-message">❌ {errorUpload}</div>}

              {mostrarConfirmacion && (
                <div className="confirm-box">
                  <p>¿Está seguro de subir este archivo?</p>
                  <div className="confirm-buttons">
                    <button
                      className="yes-btn"
                      onClick={confirmarSubida}
                      disabled={cargando}
                    >
                      {cargando ? 'Subiendo...' : 'Sí'}
                    </button>
                    <button
                      className="no-btn"
                      onClick={cancelarSubida}
                      disabled={cargando}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}

              {archivoSubido && (
                <div className="upload-box moodle-box">
                  <div className="moodle-buttons">
                    <button className="edit-btn" onClick={editarEntrega}>
                      EDITAR ENTREGA
                    </button>
                    <button className="delete-btn" onClick={cancelarSubida}>
                      BORRAR ENTREGA
                    </button>
                  </div>
                  <table className="status-table">
                    <tbody>
                      <tr>
                        <td><strong>Estado de la entrega</strong></td>
                        <td className="success">Enviado</td>
                      </tr>
                      <tr>
                        <td><strong>Última modificación</strong></td>
                        <td>{new Date().toLocaleString('es-AR')}</td>
                      </tr>
                      <tr>
                        <td><strong>Categoría</strong></td>
                        <td>
                          {categorias.find(
                            (cat) => cat.id_categoria.toString() === category
                          )?.nombre || 'No especificada'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Archivos enviados</strong></td>
                        <td>
                          <a href={preview} target="_blank" rel="noreferrer">
                            {fileName}
                          </a>
                          <br />
                          <span className="fecha-envio">
                            {new Date().toLocaleString('es-AR')}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="right-section">
              <h2>Vista previa</h2>
              <div className="preview-box">
                {preview ? (
                  <img src={preview} alt="Vista previa" />
                ) : (
                  <span className="preview-placeholder">
                    No hay archivo cargado
                  </span>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}