// components/Header.jsx
import '../assets/styles/header.css';
import logo from '../assets/imagenes/logo.png';

function Header() {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="Logo Empresa" className="logo" />
      </div>
    </header>
  );
}

export default Header;