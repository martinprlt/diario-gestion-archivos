// SOLUCIÓN MÍNIMA - Solo cambia ProtectedRoute
import { Navigate, Outlet } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';  

export default function ProtectedRoute({ allow }) {
  const { user, token } = useContext(AuthContext);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // ✅ Esperar un poco antes de decidir redirigir
    const timer = setTimeout(() => {
      // Solo redirigir si definitivamente no hay token NI user
      if (!token && !user) {
        setShouldRedirect(true);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [user, token]);

  // ⚠️ Mostrar loading mientras decide
  if (!user && !token && !shouldRedirect) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Cargando...
      </div>
    );
  }

  // ❌ Redirigir solo después de confirmar
  if (shouldRedirect) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Verificar roles si hay user
  if (allow && user) {
    const userRole = user.categoria?.toLowerCase();
    const allowedRoles = allow.map(r => r.toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  return <Outlet />;
}