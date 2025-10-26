import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../assets/styles/gestionCategorias.css";

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
      const res = await fetch("http://localhost:5000/api/categorias", {
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
      const res = await fetch("http://localhost:5000/api/categorias", {
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
      const res = await fetch(`http://localhost:5000/api/categorias/${id}`, {
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

  if (loading) return <div className="loading">Cargando categorías…</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="gc-container">
      <h1 className="gc-title">Gestión de Categorías</h1>

      <div className="gc-panel">
        <div className="gc-chip">
          <span className="dot" /> Total de categorías:
          <strong>{categorias.length}</strong>
        </div>
        <div className="gc-chip ghost">
          <span className="dot" /> Los cambios se reflejan en toda la app
        </div>
      </div>

      {/* FORMULARIO: botón en su propia columna */}
      <form className="gc-form" onSubmit={agregar}>
        <div className="gc-field">
          <label>Nombre de la categoría</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej.: Política"
          />
        </div>

        <div className="gc-field">
          <label>Descripción</label>
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción corta (opcional)"
          />
        </div>

        <div className="gc-actions">
          <button type="submit" className="btn btn-verde">
            + Agregar categoría
          </button>
        </div>
      </form>

      {/* TABLA */}
      <div className="gc-card">
        {categorias.length === 0 ? (
          <div className="empty-state">No hay categorías todavía.</div>
        ) : (
          <table className="gc-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>#</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th className="th-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c, i) => (
                <tr key={c.id_categoria}>
                  <td>{i + 1}</td>
                  <td className="cell-strong">{c.nombre}</td>
                  <td>{c.descripcion || "—"}</td>
                  <td className="td-acciones">
                    <button
                      type="button"
                      className="btn btn-rojo"
                      onClick={() => eliminar(c.id_categoria, c.nombre)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
