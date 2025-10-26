// src/pages/Recuperar.jsx
import React, { useState } from 'react';
import Header from '../components/Header'; // Si quieres mantener el Header aquí
import '../assets/styles/login.css'; // Puedes reutilizar el CSS o crear uno específico


function Recuperar() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
      } else {
        setError(data.message || 'Error al solicitar recuperación.');
      }
    } catch (err) {
      console.error('Error al enviar solicitud de recuperación:', err);
      setError('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
    }
  };

  return (
    <div className="login-page"> {/* Reutilizo la clase para centrar/estilizar */}
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Recuperar contraseña</h2>
          <p>Ingresa tu dirección de correo electrónico asociada a tu cuenta.</p>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar enlace de recuperación</button>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Recuperar;