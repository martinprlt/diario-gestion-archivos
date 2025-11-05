import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Tag, Plus, Trash2, List } from 'lucide-react';
import "../assets/styles/gestionCategorias.css";
import { API_BASE_URL } from '../config/api.js'

export default function GestionCategorias() {
  const { token } = useContext(AuthContext);

  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/api/categorias`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar categorías");
      setCategorias(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) cargar();
  }, [token]);

  const agregar = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return alert("Ingresá un nombre");
    try {
      const res = await fetch(`${API_BASE_URL}/api/categorias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: nombre.trim(), descripcion }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al crear la categoría");
      }
      setNombre("");
      setDescripcion("");
      await cargar();
    } catch (e) {
      alert("❌ " + e.message);
    }
  };

  const eliminar = async (id, nombreCat) => {
    const ok = confirm(`¿Eliminar la categoría "${nombreCat}"?`);
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/categorias/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "No se pudo eliminar");
      }
      await cargar();
    } catch (e) {
      alert("❌ " + e.message);
    }
  };

  if (loading) return (
    <div className="gestion-categorias-container">
      <div className="loading-container">
        <div className="spin">⟳</div>
        <p>Cargando categorías…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="gestion-categorias-container">
      <div className="error-message">{error}</div>
    </div>
  );

  return (
    <div className="gestion-categorias-container">
      <div className="gestion-categorias-content">
        
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Gestión de Categorías</h1>
            <p>Administra las categorías disponibles para artículos y contenido</p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3 className="stat-title">Total Categorías</h3>
              <Tag className="stat-icon" size={24} />
            </div>
            <p className="stat-value">{categorias.length}</p>
            <p className="stat-description">categorías activas</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3 className="stat-title">Categorías con Descripción</h3>
              <List className="stat-icon" size={24} />
            </div>
            <p className="stat-value">
              {categorias.filter(c => c.descripcion && c.descripcion.trim()).length}
            </p>
            <p className="stat-description">con descripción</p>
          </div>
        </div>

        {/* Panel de Información */}
        <div className="info-panel">
          <div className="info-item">
            <div className="info-dot"></div>
            <span>Total de categorías: <strong>{categorias.length}</strong></span>
          </div>
          <div className="info-item ghost">
            <div className="info-dot"></div>
            <span>Los cambios se reflejan en toda la aplicación</span>
          </div>
        </div>

        {/* Formulario - ESTRUCTURA SIMPLIFICADA */}
        <div className="form-section">
          <div className="section-header">
            <Plus size={20} />
            <h2>Agregar Nueva Categoría</h2>
          </div>
          
          <form onSubmit={agregar} className="form-main">
            <div className="form-fields">
              <div className="field-group">
                <label>Nombre de la categoría</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej.: Política, Deportes, Tecnología..."
                  className="form-input"
                />
              </div>

              <div className="field-group">
                <label>Descripción</label>
                <input
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción corta (opcional)"
                  className="form-input"
                />
              </div>

              <div className="form-action">
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  Agregar categoría
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Lista de Categorías */}
        <div className="table-section">
          <div className="section-header">
            <List size={20} />
            <h2>Categorías Existentes</h2>
          </div>
          
          {categorias.length === 0 ? (
            <div className="no-results">
              <Tag size={48} className="no-results-icon" />
              <p>No hay categorías registradas</p>
              <p>Comienza agregando tu primera categoría</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((categoria, index) => (
                    <tr key={categoria.id_categoria}>
                      <td className="index-cell">{index + 1}</td>
                      <td className="name-cell">{categoria.nombre}</td>
                      <td className="desc-cell">
                        {categoria.descripcion || <span className="no-desc">—</span>}
                      </td>
                      <td className="action-cell">
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => eliminar(categoria.id_categoria, categoria.nombre)}
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}