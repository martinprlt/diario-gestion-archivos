import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Mensajes from './pages/Mensajes';
import FotografoUpload from './pages/FotografoUpload';
import PeriodistaUpload from './pages/PeriodistaUpload';
import Presentacion from './pages/Presentacion';
import Login from './pages/Login';
import Recuperar from './pages/Recuperar';
import ResetPassword from './pages/ResetPassword';
import Notas from './pages/Notas';
import Galeria from './pages/GaleriaPersonal.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GaleriaGlobal from './pages/GaleriaGlobal.jsx';
import GestionRoles from './pages/GestionRoles';
import GestionCategorias from './pages/GestionCategorias';
import NotificacionesInternas from './pages/NotificacionesInternas';
import GestionUsuario from './pages/GestionUsuario';
import ArticulosEnRevision from './pages/ArticulosEnRevision.jsx';
import ArticulosAprobados from './pages/ArticulosAprobados.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ConfiguracionUsuario from './pages/ConfiguracionUsuario';
import RevisionEditor from './pages/RevisionEditor';
import AdminLogs from './pages/AdminLogs.jsx';
import { AuthProvider } from './context/AuthProvider.jsx';
import { DashboardAdmin } from './pages/DashboardAdmin.jsx';
import ChatPage from './pages/ChatPage.jsx'; // Importar ChatPage
import { useHeartbeat } from './hooks/useHeartbeat'; // ⬅️ IMPORTAR
import { useContext } from 'react'; // ⬅️ IMPORTAR
import { AuthContext } from './context/AuthContext'; 

// ✅ Componente que activa el heartbeat para TODOS
function GlobalHeartbeat() {
  useHeartbeat(); // Este hook se ejecuta en TODA la app
  return null; // No renderiza nada
}

// ✅ Wrapper para activar heartbeat solo si hay usuario
function AppContent() {
  const { user } = useContext(AuthContext);
  
  return (
    <>
      <Navbar />
      {/* ✅ Si hay usuario logueado, activar heartbeat global */}
      {user && <GlobalHeartbeat />}
      
      <Routes>
        <Route path="/" element={<Presentacion />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/configuracion" element={<ConfiguracionUsuario />} />
        <Route path="/dashboard" element={<Dashboard />} />


        <Route element={<ProtectedRoute allow={['periodista']} />}>
          <Route path="/periodista-upload" element={<PeriodistaUpload />} />
        </Route>

        <Route element={<ProtectedRoute allow={['periodista']} />}>
          <Route path="/ArticulosEnRevision" element={<ArticulosEnRevision/>} />
        </Route>

        <Route path="/galeria-global" element={<GaleriaGlobal />} />

        <Route element={<ProtectedRoute allow={['periodista']} />}>
          <Route path="/notas" element={<Notas />} />
        </Route>

        <Route element={<ProtectedRoute allow={['fotografo']} />}>
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/FotografoUpload" element={<FotografoUpload />} />
        </Route>

        <Route element={<ProtectedRoute allow={['periodista', 'fotografo', 'editor']} />}>
          <Route path="/mensajes" element={<Mensajes />} />
        </Route>

        <Route element={<ProtectedRoute allow={['administrador']} />}>
          <Route path="/gestion-roles" element={<GestionRoles />} />
        </Route>

        <Route element={<ProtectedRoute allow={['administrador']} />}>
          <Route path="/admin/logs" element={<AdminLogs />} />
          </Route>

        <Route element={<ProtectedRoute allow={['administrador']} />}>
          <Route path="/gestion-categorias" element={<GestionCategorias />} />
        </Route>

        <Route element={<ProtectedRoute allow={['administrador']} />}>
          <Route path="/notificaciones-internas" element={<NotificacionesInternas />} />
        </Route>

        <Route element={<ProtectedRoute allow={['administrador']} />}>
          <Route path="/gestion-usuario" element={<GestionUsuario />} />
        </Route>

        <Route element={<ProtectedRoute allow={['editor']} />}>
          <Route path="/revisiones" element={<RevisionEditor />} />
          <Route path="/articulos-aprobados" element={<ArticulosAprobados />} />
        </Route>

        <Route element={<ProtectedRoute allow={['administrador']} />}>
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        </Route>

        {/* Ruta para el Chat */}
        <Route element={<ProtectedRoute allow={['periodista', 'fotografo', 'editor', 'administrador']} />}>
          <Route path="/chat" element={<ChatPage userId={user?.id_usuario} />} />
        </Route>

        <Route path="/no-autorizado" element={<h2>No autorizado</h2>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
