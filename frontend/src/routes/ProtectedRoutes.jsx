//src/routes/ProtectedRoutes.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';  

export default function ProtectedRoute({ allow }) {
  const { user } = useContext(AuthContext);
  if (!user)         return <Navigate to="/login" replace />;
  if (!allow.map(r => r.toLowerCase()).includes(user.categoria.toLowerCase()))
  return <Navigate to="/no-autorizado" replace />;

  return <Outlet />;
}
