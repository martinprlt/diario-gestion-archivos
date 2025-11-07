import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch, apiEndpoints } from "../config/api"; 
import "../assets/styles/UsuarioForm.css";

export default function UsuarioForm({ usuario, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    apellido: "",
    usuario: "",
    email: "",
    telefono: "",
    rol: "",
    contraseña: "",
  });
  const [rolesDisponibles, setRolesDisponibles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // ✅ Usar apiFetch y apiEndpoints
        const response = await apiFetch(apiEndpoints.roles);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        setRolesDisponibles(Array.isArray(data) ? data : []);
      } catch {
        setRolesDisponibles([]);
      }
    };

    fetchRoles(); // ✅ apiFetch maneja el token internamente

    if (usuario) {
      setFormData({
        id: usuario.id || usuario.id_usuario || "",
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        usuario: usuario.usuario || "",
        email: usuario.email || "",
        telefono: usuario.telefono || "",
        rol: usuario.rol || usuario.rol_nombre || "",
        contraseña: "",
      });
    } else {
      setFormData({
        id: "",
        nombre: "",
        apellido: "",
        usuario: "",
        email: "",
        telefono: "",
        rol: "",
        contraseña: "",
      });
    }
  }, [usuario]); // ✅ Eliminar dependencia de token

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(formData);
  };

  return (
    <div className="usuario-modal">
      <form className="usuario-form" onSubmit={handleSubmit}>
        <h2>{formData.id ? "Editar Usuario" : "Nuevo Usuario"}</h2>

        <div className="usuario-grid">
          <div className="usuario-form-group">
            <label>Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>

          <div className="usuario-form-group">
            <label>Apellido</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
          </div>

          <div className="usuario-form-group">
            <label>Usuario</label>
            <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} required disabled={!!formData.id} />
          </div>

          {!formData.id && (
            <div className="usuario-form-group">
              <label>Contraseña</label>
              <input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} required />
            </div>
          )}

          <div className="usuario-form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="usuario-form-group">
            <label>Teléfono</label>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
          </div>

          <div className="usuario-form-group">
            <label>Rol</label>
            <select name="rol" value={formData.rol} onChange={handleChange} required>
              <option value="">Seleccione un rol</option>
              {rolesDisponibles.map((rol) => (
                <option key={rol.id_rol} value={rol.nombre}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="usuario-form-actions">
          <button type="button" className="btn-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}