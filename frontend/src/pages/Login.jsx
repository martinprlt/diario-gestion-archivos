// src/pages/Login.jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import LoginForm from '../components/LoginForm';
import '../assets/styles/login.css';
import { apiEndpoints, apiFetch } from '../config/api.js';

function Login() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (credentials) => {
    try {
      const response = await apiFetch(apiEndpoints.login, {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);

        const rol = data.user.categoria;

        switch (rol) {
          case 'Periodista':
            navigate('/notas');
            break;
          case 'Fotografo':
            navigate('/galeria');
            break;
          case 'Editor':
            navigate('/editor');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {error && <div className="error-message">{error}</div>}
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
}

export default Login;
