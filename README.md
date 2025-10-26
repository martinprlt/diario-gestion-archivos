WebApp de gestión de archivos diseñada para resolver las deficiencias actuales en el manejo de documentos del Diario El Independiente.  

Pasos para empezar a trabajar:
 1. Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/diario-gestion-archivos.git

```
```# Entra al directorio```

```bash
cd diario-gestion-archivos
```


 2. Instalar Dependencias

```bash
cd backend
npm install  # Instala express, mysql2, jwt, etc.
```
```bash
cd ../frontend
npm install  # Instala React, axios, tailwind, etc.
```


Flujo de Trabajo con Git

1. Antes de empezar:
```bash
git pull origin main  # Sincroniza cambios nuevos
```

2. Crear una rama para tu tarea:
```bash
git checkout -b feature/nombre-del-cambio  # Ej: feature/rama x 
```
> en "feature/nombre-del-cambio" va el nombre de la rama que crean para trabajar, en caso de que quieran trabajar en alguna rama en especifico solos.. sino seguimos en la main

3. Subir tus cambios:
```bash
git add .
git commit -m "feat: añadir login con JWT"
git push origin feature/nombre-del-cambio
```
> en "feature/nombre-del-cambio" recuerden que va el nombre de la rama!

🚨 Reglas del Equipo
Nunca subas archivos .env a GitHub.
Prueba tus cambios localmente antes de subirlos.
Comunica cambios grandes en el grupo de WhatsApp.
