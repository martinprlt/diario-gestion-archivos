// config/db.js - VERSIÓN CORREGIDA
import pg from 'pg';

const { Pool } = pg;

// Configuración para Railway - usa DATABASE_PUBLIC_URL para conexiones externas
const getPoolConfig = () => {
  // PRIORIDAD 1: DATABASE_PUBLIC_URL (conexión externa)
  if (process.env.DATABASE_PUBLIC_URL) {
    console.log('🔗 Usando DATABASE_PUBLIC_URL (conexión externa)');
    return {
      connectionString: process.env.DATABASE_PUBLIC_URL,
      ssl: { rejectUnauthorized: false }
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
      ssl: { rejectUnauthorized: false }
    };
  }
  
  // PRIORIDAD 3: DATABASE_URL (conexión interna - solo si estás en mismo servicio)
  if (process.env.DATABASE_URL) {
    console.log('🔗 Usando DATABASE_URL (conexión interna)');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  }
  
  // Desarrollo local
  console.log('🔧 Usando configuración local');
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres', 
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'IndependienteDB',
  };
};

export const pool = new Pool(getPoolConfig());

export async function testDB() {
  try {
    const client = await pool.connect();
    console.log('🎉 ¡CONEXIÓN EXITOSA A POSTGRESQL EN RAILWAY!');
    
    // Test adicional para verificar datos
    const result = await client.query('SELECT current_database(), version()');
    console.log('📊 Base de datos:', result.rows[0].current_database);
    
    client.release();
    return true;
  } catch (err) {
    console.error('💥 ERROR de conexión:', err.message);
    console.log('🔧 Configuración intentada:', getPoolConfig());
    return false;
  }
}