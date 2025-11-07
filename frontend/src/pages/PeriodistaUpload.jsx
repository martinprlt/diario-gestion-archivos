// frontend/src/pages/PeriodistaUpload.jsx - VERSIÓN LIMPIA
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.js';
import { useCategorias } from '../context/CategoriasContext.jsx';
import { apiEndpoints, apiUpload } from '../config/api.js';
import '../assets/styles/periodista-upload.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PeriodistaUpload() {
  const { token } = useContext(AuthContext);
  const { categorias, loading: categoriasLoading, error: categoriasError } = useCategorias();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModoEdicion, setIsModoEdicion] = useState(false);
  const [articuloEditando, setArticuloEditando] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.articulo) {
      const articulo = location.state.articulo;
      const esModificacion = location.state.modo === 'modificacion';
      
      setIsModoEdicion(true);
      setArticuloEditando(articulo);
      setTitle(articulo.titulo);
      setCategory(articulo.categoria_id?.toString() || '');
      
      if (esModificacion) {
        setUploadStatus({ 
          info: '⚠️ Este artículo fue rechazado. Modifícalo y envíalo nuevamente a revisión.' 
        });
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (categorias.length > 0 && !category) {
      setCategory(categorias[0].id_categoria.toString());
    }
  }, [categorias, category]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type === 'application/pdf') {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file && !isModoEdicion) {
      alert('Por favor, selecciona un archivo');
      return;
    }

    if (!title.trim()) {
      alert('Por favor, ingresa un título');
      return;
    }

    if (!category) {
      alert('Debes seleccionar una categoría');
      return;
    }

    const formData = new FormData();
    if (file) formData.append('archivo', file);
    formData.append('titulo', title.trim());
    formData.append('categoria_id', category);

    if (isModoEdicion && articuloEditando) {
      formData.append('articulo_id', articuloEditando.id_articulo);
    }

    setUploadStatus({ loading: true, message: 'Subiendo artículo...' });

    try {
      const response = await apiUpload(apiEndpoints.uploadArticle, formData);
      const data = await response.json();

      setUploadStatus({ 
        success: true,
        message: isModoEdicion 
          ? '✅ Artículo actualizado correctamente' 
          : '✅ Artículo subido correctamente' 
      });
      setIsSubmitted(true);
      
    } catch (err) {
      setUploadStatus({ 
        error: true, 
        message: err.message || 'Error al subir el artículo. Intenta nuevamente.' 
      });
    }
  };

  const handleCancel = () => {
    if (isModoEdicion) {
      navigate('/ArticulosEnRevision');
    } else {
      navigate('/notas');
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setFile(null);
    setPreview(null);
    setIsSubmitted(false);
    setUploadStatus(null);
    setIsModoEdicion(false);
    setArticuloEditando(null);
  };

  return (
    <div className="periodista-upload-container">
      <div className="upload-header">
        {isModoEdicion ? 'MODIFICAR ARTÍCULO' : 'SUBIR ARTÍCULO'}
      </div>
      
      <div className="upload-wrapper">
        <aside className="sidebar"></aside>

        <main className="upload-main">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="left-section">
              {isModoEdicion && articuloEditando && (
                <div className="info-edicion">
                  <h3>Editando artículo: {articuloEditando.titulo}</h3>
                  <p>Estado actual: {articuloEditando.estado}</p>
                  <p>Archivo actual: {articuloEditando.nombre_original}</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="title">Título del artículo *</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ingresa un título descriptivo"
                  disabled={isSubmitted}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoría *</label>
                
                {categoriasLoading ? (
                  <div className="loading-categorias">Cargando categorías...</div>
                ) : categoriasError ? (
                  <div className="error-categorias">Error cargando categorías</div>
                ) : (
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isSubmitted}
                    required
                    className={!category ? 'field-error' : ''}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                )}
                
                {!category && categorias.length > 0 && (
                  <span className="field-error-text">Debes seleccionar una categoría</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="file">
                  {isModoEdicion ? 'Nuevo archivo (opcional)' : 'Archivo *'}
                </label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    disabled={isSubmitted}
                  />
                  <label htmlFor="file" className="file-upload-label">
                    {file ? file.name : 'Seleccionar archivo'}
                  </label>
                </div>
                <p className="file-hint">
                  {isModoEdicion 
                    ? 'Selecciona un nuevo archivo para reemplazar el actual (opcional)'
                    : 'Formatos aceptados: PDF, DOC, DOCX'
                  }
                </p>
              </div>

              {uploadStatus?.info && (
                <div className="info-message">{uploadStatus.info}</div>
              )}
              {uploadStatus?.message && (
                <div className={`status-message ${uploadStatus.error ? 'error' : uploadStatus.success ? 'success' : 'info'}`}>
                  {uploadStatus.message}
                </div>
              )}

              {!isSubmitted ? (
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="upload-button" 
                    disabled={uploadStatus?.loading}
                  >
                    {uploadStatus?.loading 
                      ? 'Procesando...' 
                      : isModoEdicion ? 'Actualizar artículo' : 'Subir artículo'
                    }
                  </button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={handleCancel}
                    disabled={uploadStatus?.loading}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="upload-success">
                  <p className="success-message">{uploadStatus.message}</p>
                  <div className="success-actions">
                    <button 
                      type="button" 
                      className="new-upload-button"
                      onClick={resetForm}
                    >
                      {isModoEdicion ? 'Modificar otro' : 'Subir nuevo artículo'}
                    </button>
                    <button 
                      type="button" 
                      className="back-button"
                      onClick={handleCancel}
                    >
                      Volver a mis artículos
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="right-section">
              <h2>Vista previa</h2>
              <div className="preview-box">
                {preview ? (
                  <iframe
                    src={preview}
                    title="Vista previa del documento"
                    className="preview-iframe"
                  />
                ) : (
                  <div className="preview-placeholder">
                    {file ? (
                      <p>Vista previa no disponible para este tipo de archivo</p>
                    ) : isModoEdicion && articuloEditando ? (
                      <p>Modo edición: selecciona un nuevo archivo para ver vista previa</p>
                    ) : (
                      <>
                        <p>No hay archivo seleccionado</p>
                        <p>Selecciona un archivo PDF para ver la vista previa</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}