import { useNavigate } from 'react-router-dom';
import '../assets/styles/presentacion.css';
import logo from '../assets/imagenes/logo.png';

function Presentacion() {
  const navigate = useNavigate();

  return (
    <div className="presentacion-container">
      <div className="presentacion-hero">
        <div className="hero-content">
          <img src={logo} alt="Logo Diario El Independiente" className="logo-presentacion" />
          <h1 className="hero-title">Sistema de Gestión de Archivos</h1>
          <p className="hero-subtitle">
            Centraliza y optimiza el trabajo editorial del Diario El Independiente
          </p>
          <button className="cta-button" onClick={() => navigate('/login')}>
            Acceder al Sistema
          </button>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">¿Cómo funciona?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Para Periodistas</h3>
            <p>
              Sube tus artículos en formato Word o PDF, agregalos a categorías
              y envíalos directamente a revisión editorial.
            </p>
            <ul className="feature-list">
              <li>✓ Carga de artículos en múltiples formatos</li>
              <li>✓ Organización por categorías</li>
              <li>✓ Seguimiento de estado de revisión</li>
              <li>✓ Historial de modificaciones</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Para Fotógrafos</h3>
            <p>
              Gestiona tu galería fotográfica, categoriza imágenes y 
              comparte tu trabajo con el equipo editorial.
            </p>
            <ul className="feature-list">
              <li>✓ Subida de imágenes en alta calidad</li>
              <li>✓ Galerías personales y globales</li>
              <li>✓ Descripción y metadatos</li>
              <li>✓ Vista previa integrada</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Para Editores</h3>
            <p>
              Revisa, aprueba o solicita cambios en los artículos enviados.
              Mantén el control de calidad del contenido.
            </p>
            <ul className="feature-list">
              <li>✓ Panel de artículos pendientes</li>
              <li>✓ Aprobación con comentarios</li>
              <li>✓ Notificaciones automáticas</li>
              <li>✓ Trazabilidad completa</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="benefits-section">
        <h2 className="section-title">Beneficios del Sistema</h2>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-number">01</span>
            <h4>Centralización</h4>
            <p>Todo el contenido editorial en un solo lugar, accesible 24/7</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-number">02</span>
            <h4>Colaboración</h4>
            <p>Flujo de trabajo colaborativo entre todos los roles del equipo</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-number">03</span>
            <h4>Seguridad</h4>
            <p>Control de acceso basado en roles y respaldo automático</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-number">04</span>
            <h4>Trazabilidad</h4>
            <p>Historial completo de cambios y versiones de cada documento</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>¿Listo para comenzar?</h2>
        <p>Inicia sesión y optimiza tu flujo de trabajo editorial</p>
        <button className="cta-button-secondary" onClick={() => navigate('/login')}>
          Iniciar Sesión
        </button>
      </div>

      <footer className="presentacion-footer">
        <p>© 2025 Diario El Independiente - Sistema de Gestión de Archivos</p>
      </footer>
    </div>
  );
}

export default Presentacion;