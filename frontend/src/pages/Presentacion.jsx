import '../assets/styles/presentacion.css';
import logo from '../assets/imagenes/logo.png';
import Navbar from '../components/Navbar';

function Presentacion() {
  return (
    <>
      <div className="presentacion-container">
        <div className="contenido">
          <img src={logo} alt="Logo Diario" className="logo-presentacion" />
          <h1>Sistema de Gestión de Archivos</h1>
          <p>
            El Sistema de Gestión de Archivos del Diario El Independiente centraliza
            el trabajo de periodistas, fotógrafos y editores en una plataforma única,
            facilitando la organización y colaboración diaria.
          </p>
          <p>
            Permite subir, editar y revisar contenidos con control de versiones,
            garantizando seguridad y trazabilidad en cada etapa del proceso editorial.
          </p>
          <p>
            Con roles y permisos definidos, se optimizan los flujos de trabajo, reduciendo
            tiempos y errores para entregar noticias de calidad a los lectores.
          </p>
        </div>
      </div>
    </>
  );
}

export default Presentacion;
