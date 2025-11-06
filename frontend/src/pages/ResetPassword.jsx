// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../assets/styles/login.css'; // Reutiliza o crea un CSS

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extraer el token de la URL
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Token de recuperación no encontrado en la URL.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('No hay un token de recuperación válido.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 6) { // Ejemplo de validación mínima
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setTimeout(() => {
          navigate('/login'); // Redirigir al login después de un éxito
        }, 3000); // 3 segundos antes de redirigir
      } else {
        setError(data.message || 'Error al restablecer la contraseña.');
      }
    } catch (err) {
      console.error('Error al enviar solicitud de restablecimiento:', err);
      setError('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Establecer nueva contraseña</h2>
          {token ? (
            <>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit">Restablecer contraseña</button>
            </>
          ) : (
            <p>Cargando...</p> // O un spinner, si el token aún no se ha procesado
          )}
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;