import { useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../assets/styles/navbar.css';

export default function UserDrawer({ isOpen, onClose }) {
  const { usuario, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="dropdown-menu" ref={dropdownRef}>
      {/* Encabezado con info del usuario */}
      <div className="dropdown-header">
        <p className="dropdown-name">{usuario.nombre} {usuario.apellido}</p>
        <p className="dropdown-email">{usuario.email}</p>
      </div>

      {/* Opciones */}
      <div className="dropdown-options">
        <Link to="/configuracion" onClick={onClose} className="dropdown-item">
          <span>⚙️</span> Preferencias
        </Link>
        <button onClick={() => { logout(); onClose(); }} className="dropdown-item">
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </div>
  );
}