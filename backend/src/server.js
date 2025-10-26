// src/server.js
import 'dotenv/config.js';
import app from './app.js';
import { testDB } from './config/db.js';

const PORT = process.env.PORT || 5000;
await testDB();

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});
