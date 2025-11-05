// src/pages/Dashboard.jsx
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../assets/styles/dashboard.css';

function Dashboard() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  // Contenido específico por rol
  const dashboardContent = {
    periodista: {
      title: "Panel del Periodista",
      subtitle: "Bienvenido al centro de creación de contenido",
      features: [
        {
          icon: "📝",
          title: "Crear Artículos",
          description: "Redacta y sube nuevos artículos en formatos Word o PDF",
          action: () => navigate('/periodista-upload'),
          buttonText: "Crear Artículo"
        },
        {
          icon: "📊",
          title: "Mis Artículos",
          description: "Gestiona y da seguimiento a todos tus artículos",
          action: () => navigate('/notas'),
          buttonText: "Ver Mis Artículos"
        },
        {
          icon: "⏳", 
          title: "En Revisión",
          description: "Artículos enviados para aprobación editorial",
          action: () => navigate('/ArticulosEnRevision'),
          buttonText: "Ver En Revisión"
        },
        {
          icon: "💬",
          title: "Chat Editorial",
          description: "Comunícate con editores y colegas",
          action: () => navigate('/chat'),
          buttonText: "Abrir Chat"
        }
      ],
      stats: [
        { label: "Artículos Creados", value: "15" },
        { label: "En Revisión", value: "3" },
        { label: "Aprobados", value: "12" }
      ]
    },

    fotografo: {
      title: "Panel del Fotógrafo",
      subtitle: "Gestiona y comparte tu trabajo fotográfico",
      features: [
        {
          icon: "📸",
          title: "Subir Fotos",
          description: "Comparte tus imágenes con el equipo editorial",
          action: () => navigate('/FotografoUpload'),
          buttonText: "Subir Foto"
        },
        {
          icon: "🖼️",
          title: "Mi Galería",
          description: "Organiza y gestiona tu colección personal",
          action: () => navigate('/galeria'),
          buttonText: "Ver Mi Galería"
        },
        {
          icon: "🌍",
          title: "Galería Global", 
          description: "Explora el trabajo de todo el equipo",
          action: () => navigate('/galeria-global'),
          buttonText: "Explorar Galería"
        },
        {
          icon: "💬",
          title: "Chat del Equipo",
          description: "Coordina con periodistas y editores",
          action: () => navigate('/chat'),
          buttonText: "Unirse al Chat"
        }
      ],
      stats: [
        { label: "Fotos Subidas", value: "47" },
        { label: "En Uso", value: "23" },
        { label: "Favoritas", value: "15" }
      ]
    },

    editor: {
      title: "Panel del Editor",
      subtitle: "Control de calidad y gestión editorial",
      features: [
        {
          icon: "📋",
          title: "Revisar Artículos",
          description: "Artículos pendientes de tu revisión",
          action: () => navigate('/revisiones'),
          buttonText: "Revisar Ahora"
        },
        {
          icon: "✅",
          title: "Artículos Aprobados",
          description: "Historial de contenido aprobado",
          action: () => navigate('/articulos-aprobados'),
          buttonText: "Ver Aprobados"
        },
        {
          icon: "💬",
          title: "Chat Editorial",
          description: "Comunícate con periodistas y fotógrafos", 
          action: () => navigate('/chat'),
          buttonText: "Abrir Chat"
        },
        {
          icon: "🌍",
          title: "Galería de Recursos",
          description: "Imágenes disponibles para publicaciones",
          action: () => navigate('/galeria-global'),
          buttonText: "Ver Galería"
        }
      ],
      stats: [
        { label: "Pendientes", value: "8" },
        { label: "Revisados Hoy", value: "12" },
        { label: "Aprobados", value: "156" }
      ]
    },

    administrador: {
      title: "Panel de Administración",
      subtitle: "Gestión completa del sistema editorial",
      features: [
        {
          icon: "👥",
          title: "Gestión de Usuarios",
          description: "Administra roles y permisos del equipo",
          action: () => navigate('/gestion-usuario'),
          buttonText: "Gestionar Usuarios"
        },
        {
          icon: "📊",
          title: "Dashboard General",
          description: "Métricas y estadísticas del sistema",
          action: () => navigate('/admin/dashboard'),
          buttonText: "Ver Dashboard"
        },
        {
          icon: "📝",
          title: "Logs del Sistema",
          description: "Actividad y auditoría completa",
          action: () => navigate('/admin/logs'),
          buttonText: "Ver Logs"
        },
        {
          icon: "🗂️",
          title: "Gestión de Categorías",
          description: "Organiza categorías de contenido",
          action: () => navigate('/gestion-categorias'),
          buttonText: "Gestionar Categorías"
        }
      ],
      stats: [
        { label: "Usuarios Activos", value: "24" },
        { label: "Artículos Hoy", value: "15" },
        { label: "Fotos Subidas", value: "8" }
      ]
    }
  };

  const content = dashboardContent[usuario?.categoria] || dashboardContent.periodista;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>¡Hola, {usuario?.nombre}!</h1>
          <h2>{content.title}</h2>
          <p>{content.subtitle}</p>
        </div>
        <div className="user-badge">
          <div className="avatar-circle">
            {usuario?.nombre?.charAt(0)}{usuario?.apellido?.charAt(0)}
          </div>
          <div className="user-info">
            <strong>{usuario?.nombre} {usuario?.apellido}</strong>
            <span>{usuario?.categoria}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        {content.stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <h3>Acciones Rápidas</h3>
        <div className="actions-grid">
          {content.features.map((feature, index) => (
            <div key={index} className="action-card">
              <div className="action-icon">{feature.icon}</div>
              <div className="action-content">
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
                <button 
                  className="action-button"
                  onClick={feature.action}
                >
                  {feature.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h3>Actividad Reciente</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">📝</span>
            <div className="activity-text">
              <p>Último acceso al sistema</p>
              <small>Hace unos momentos</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">✅</span>
            <div className="activity-text">
              <p>Sistema actualizado correctamente</p>
              <small>Todo funciona perfectamente</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;