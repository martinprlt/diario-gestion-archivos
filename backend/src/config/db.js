// config/db.js - VERSIÓN CORREGIDA PARA RAILWAY
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Para Railway usa DATABASE_URL, para desarrollo local usa variables separadas
const poolConfig = process.env.NODE_ENV === 'production' 
  ? {
      connectionString: process.env.DATABASE_URL, // ← CAMBIA AQUÍ
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres', 
      password: process.env.DB_PASSWORD || 'tu_password_local',
      database: process.env.DB_NAME || 'tu_bd_local',
    };

export const pool = new Pool(poolConfig);

export async function testDB() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log('📍 Entorno:', process.env.NODE_ENV);
    console.log('🔗 Usando:', process.env.NODE_ENV === 'production' ? 'DATABASE_URL' : 'Variables locales');
    client.release();
  } catch (err) {
    console.error('❌ Error conectando a la BD:', err.message);
    console.log('🔍 DATABASE_URL disponible:', !!process.env.DATABASE_URL);
    process.exit(1);
  }
}