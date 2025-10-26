#!/bin/bash
# Script de backup para Sistema de Gestión Independiente

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

echo "🔄 Iniciando backup: $DATE"

# Backup PostgreSQL
echo "📦 Respaldando base de datos..."
PGPASSWORD=asd123 pg_dump -U postgres -h localhost IndependienteDB > "$BACKUP_DIR/db_$DATE.sql"

if [ $? -eq 0 ]; then
  echo "✅ Base de datos respaldada"
  gzip "$BACKUP_DIR/db_$DATE.sql"
else
  echo "❌ Error al respaldar base de datos"
  exit 1
fi

# Backup uploads
echo "📦 Respaldando archivos subidos..."
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" ./uploads

if [ $? -eq 0 ]; then
  echo "✅ Archivos respaldados"
else