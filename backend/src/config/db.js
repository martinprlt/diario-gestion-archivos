// backend/src/config/db.js - VERSIÓN CORREGIDA CON SSL FLEXIBLE
import pg from 'pg';

const { Pool } = pg;

// Configuración para Railway y desarrollo local
const getPoolConfig = () => {
  // ✅ Detectar si estamos en producción (Railway)
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
  
  console.log(`🌍 Entorno: ${isProduction ? 'PRODUCCIÓN (Railway)' : 'DESARROLLO (Local)'}`);
  
  // PRIORIDAD 1: DATABASE_PUBLIC_URL (conexión externa a Railway)
  if (process.env.DATABASE_PUBLIC_URL) {
    console.log('🔗 Usando DATABASE_PUBLIC_URL (conexión externa)');
    return {
      connectionString: process.env.DATABASE_PUBLIC_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false // ⬅️ SSL solo en producción
    };
  }
  
  // PRIORIDAD 2: Variables individuales externas
  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
    console.log('🔗 Usando variables individuales externas');
    return {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: isProduction ? { rejectUnauthorized: false } : false // ⬅️ SSL solo en producción
    };
  }
  
  // PRIORIDAD 3: DATABASE_URL (conexión interna - Railway)
  if (process.env.DATABASE_URL) {
    console.log('🔗 Usando DATABASE_URL (conexión interna)');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    };
  }
  
  // DESARROLLO LOCAL (sin SSL)
  console.log('🔧 Usando configuración local (sin SSL)');
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres', 
    password: process.env.DB_PASSWORD || 'asd123',
    database: process.env.DB_NAME || 'IndependienteDB',
    ssl: false // ⬅️ Sin SSL para desarrollo local
  };
};

export const pool = new Pool(getPoolConfig());

export async function testDB() {
  try {
    const client = await pool.connect();
    console.log('🎉 ¡CONEXIÓN EXITOSA A POSTGRESQL!');
    
    // Test adicional para verificar datos
    const result = await client.query('SELECT current_database(), version()');
    console.log('📊 Base de datos:', result.rows[0].current_database);
    console.log('🐘 Versión PostgreSQL:', result.rows[0].version.split(' ')[1]);
    
    client.release();
    return true;
  } catch (err) {
    console.error('💥 ERROR de conexión a base de datos:');
    console.error('📝 Mensaje:', err.message);
    console.error('🔧 Código error:', err.code);
    console.log('⚙️  Configuración intentada:', JSON.stringify(getPoolConfig(), null, 2));
    
    // Sugerencias basadas en el error
    if (err.message.includes('SSL')) {
      console.log('💡 Sugerencia: Si estás en desarrollo local, asegúrate de NO tener SSL habilitado');
      console.log('💡 Si estás en Railway, verifica que DATABASE_PUBLIC_URL esté configurado');
    }
    if (err.code === 'ECONNREFUSED') {
      console.log('💡 Sugerencia: Verifica que PostgreSQL esté corriendo y el puerto sea correcto');
    }
    if (err.message.includes('authentication')) {
      console.log('💡 Sugerencia: Verifica usuario y contraseña en las variables de entorno');
    }
    
    return false;
  }
}