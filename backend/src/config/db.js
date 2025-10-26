import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const poolConfig = process.env.DATABASE_URL
  ? {
      // Producción: Usar DATABASE_URL completa (Railway)
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

export const pool = new Pool(poolConfig);

// Manejo de errores del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

export async function testDB() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log('🕐 Timestamp de la BD:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Error conectando a la BD:', err.message);
    console.error(' Stack:', err.stack);
    throw err; 
  }
}