//src/components/LoginForm.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/login.css';

function LoginForm({ onLogin }) {
  // Cambiado 'usuario' a 'email' y 'clave' a 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Asegúrate de que las propiedades del objeto coincidan con lo que espera handleLogin
    onLogin({ email, password }); // <-- ¡CAMBIO AQUÍ!
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2>
      <input
        type="text"
        placeholder="Email" // Cambiado el placeholder para que sea más claro
        value={email} // Usar el estado 'email'
        onChange={(e) => setEmail(e.target.value)} // Actualizar el estado 'email'
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password} // Usar el estado 'password'
        onChange={(e) => setPassword(e.target.value)} // Actualizar el estado 'password'
        required
      />
      <button type="submit">Entrar</button>

      <div className="login-options">
        <Link to="/recuperar" className="link-recuperar">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </form>
  );
}

export default LoginForm;