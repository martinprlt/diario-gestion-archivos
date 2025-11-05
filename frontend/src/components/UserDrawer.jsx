import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../assets/styles/navbar.css';

export default function UserDrawer({ isOpen, onClose }) {
  const { user, logout } = useContext(AuthContext);

  if (!isOpen) return null;

  return (
    <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
      <div className="dropdown-header">
        <p className="dropdown-name">{user?.nombre} {user?.apellido}</p>
        <p className="dropdown-email">{user?.email}</p>
      </div>

      <div className="dropdown-options">
        <Link to="/configuracion" onClick={onClose} className="dropdown-item">
          ⚙️ Preferencias
        </Link>
        <button
          onClick={() => { logout(); onClose(); }}
          className="dropdown-item"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  );
}
