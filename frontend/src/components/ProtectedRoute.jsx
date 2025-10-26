// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js'; // ✅ Correcto

export default function ProtectedRoute({ allow = [] }) {
  const { usuario } = useContext(AuthContext);

  if (!usuario) {
    // No está logueado, redirige a login
    return <Navigate to="/login" replace />;
  }

  if (allow.length > 0 && !allow.includes(usuario.categoria)) {
    // Usuario no tiene permisos
    return <Navigate to="/no-autorizado" replace />;
  }

  // Usuario autorizado, renderiza las rutas hijas
  return <Outlet />;
}
