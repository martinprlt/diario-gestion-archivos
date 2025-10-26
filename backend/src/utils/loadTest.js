// 📁 utils/loadTest.js (Backend)
const testMultipleUsers = async (baseUrl, userCount) => {
  console.log(`🧪 Iniciando prueba con ${userCount} usuarios...`);
  
  const results = [];
  
  for (let i = 1; i <= userCount; i++) {
    try {
      // Simular login
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: `testuser${i}`,
          contraseña: 'password123'
        })
      });
      
      if (loginResponse.ok) {
        const data = await loginResponse.json();
        results.push({ user: `testuser${i}`, status: 'success', token: data.token });
      } else {
        results.push({ user: `testuser${i}`, status: 'failed' });
      }
    } catch (error) {
      results.push({ user: `testuser${i}`, status: 'error', error: error.message });
    }
  }
  
  const successCount = results.filter(r => r.status === 'success').length;
  console.log(`✅ ${successCount}/${userCount} usuarios logueados exitosamente`);
  
  return results;
};

module.exports = { testMultipleUsers };