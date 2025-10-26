//src/routes/ProtectedRoutes.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';  // ✅ Correcto

export default function ProtectedRoute({ allow }) {
  const { usuario } = useContext(AuthContext);
  if (!usuario)         return <Navigate to="/login" replace />;
  if (!allow.map(r => r.toLowerCase()).includes(usuario.categoria.toLowerCase()))
  return <Navigate to="/no-autorizado" replace />;

  return <Outlet />;
}
