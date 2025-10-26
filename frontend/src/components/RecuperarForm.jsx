// src/components/RecuperarForm.jsx
import { useState } from 'react';
import '../assets/styles/recuperar.css';

function RecuperarForm() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Llamada al backend (ajustá el endpoint según tu API)
      const response = await fetch('http://localhost:3000/api/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEnviado(true);
        setError('');
      } else {
        const res = await response.json();
        setError(res.message || 'Ocurrió un error');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión al servidor.');
    }
  };

  return (
    <form className="recuperar-form" onSubmit={handleSubmit}>
      <h2>Recuperar contraseña</h2>

      {!enviado ? (
        <>
          <p>Ingresá tu correo electrónico y recibirás un enlace para restablecer tu contraseña.</p>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar instrucciones</button>
          {error && <p className="error">{error}</p>}
        </>
      ) : (
        <p className="confirmacion">📩 Si existe una cuenta con ese correo, te llegará un enlace de recuperación.</p>
      )}
    </form>
  );
}

export default RecuperarForm;
