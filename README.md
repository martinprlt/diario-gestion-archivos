# Sistema de Gestión de Archivos - Diario El Independiente

WebApp de gestión de archivos diseñada para resolver las deficiencias actuales en el manejo de documentos del Diario El Independiente. El sistema permite a los usuarios gestionar roles, subir artículos, administrar notificaciones y mucho más, optimizando el flujo de trabajo editorial.

## Características Principales

*   **Gestión de Usuarios y Roles:** Sistema completo para administrar los permisos de los diferentes miembros del equipo (periodistas, editores, fotógrafos, etc.).
*   **Subida y Gestión de Archivos:** Permite a los periodistas y fotógrafos subir sus artículos y material gráfico de forma segura.
*   **Sistema de Notificaciones:** Facilita la comunicación interna entre los miembros del equipo.
*   **Organización por Categorías:** Clasificación de artículos para una mejor organización y búsqueda.

## Cómo Probar el Sistema

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### 1. Prerrequisitos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior) y npm.

### 2. Clonar el Repositorio

```bash
git clone https://github.com/LucasIsac/Sistema-de-Gestion-Independiente.git
cd Sistema-de-Gestion-Independiente
```

### 3. Configurar el Backend

a. **Instalar dependencias:**

```bash
cd backend
npm install
```

b. **Configurar variables de entorno:**

Crea una copia del archivo `.env.example` y renómbrala a `.env`. Luego, rellena las variables necesarias, como las credenciales de la base de datos.

```bash
cp .env.example .env
```

### 4. Configurar el Frontend

a. **Instalar dependencias:**

```bash
cd ../frontend
npm install
```

### 5. Ejecutar la Aplicación

Para probar el sistema, necesitas tener dos terminales abiertas: una para el backend y otra para el frontend.

a. **Iniciar el servidor del Backend:**

```bash
# Desde la carpeta 'backend'
npm run dev
```
El servidor del backend se ejecutará en `http://localhost:5000` (o el puerto que hayas configurado en tu `.env`).

b. **Iniciar la aplicación del Frontend:**

```bash
# Desde la carpeta 'frontend'
npm run dev
```
La aplicación de React se abrirá automáticamente en tu navegador, generalmente en `http://localhost:5173`.

---

## Flujo de Trabajo con Git

#### 1. Antes de empezar:
```bash
git pull origin main  # Sincroniza cambios nuevos
```

#### 2. Crear una rama para tu tarea:
```bash
git checkout -b feature/nombre-del-cambio  # Ej: feature/login-ui
```
> En "feature/nombre-del-cambio" va el nombre de la rama que crean para trabajar.

#### 3. Subir tus cambios:
```bash
git add .
git commit -m "feat: añadir login con JWT"
git push origin feature/nombre-del-cambio
```
> Recuerda usar el nombre de tu rama.

---

### 🚨 Reglas del Equipo
*   **Nunca** subas archivos `.env` a GitHub.
*   Prueba tus cambios localmente antes de subirlos.
*   Comunica cambios grandes en el grupo de WhatsApp.
