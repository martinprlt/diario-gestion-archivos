# Sistema de Gestión de Archivos - Diario El Independiente

WebApp de gestión de archivos diseñada para resolver las deficiencias actuales en el manejo de documentos del Diario El Independiente. El sistema permite a los usuarios gestionar roles, subir artículos, administrar notificaciones y mucho más, optimizando el flujo de trabajo editorial.

## Características Principales

*   **Gestión de Usuarios y Roles:** Sistema completo para administrar los permisos de los diferentes miembros del equipo.
*   **Flujo de Trabajo Editorial:** Proceso claro para la subida, revisión y aprobación de artículos.
*   **Subida y Gestión de Archivos:** Permite a los periodistas y fotógrafos subir sus artículos y material gráfico de forma segura.
*   **Galería Multimedia:** Galerías personales y globales para la gestión de imágenes.
*   **Sistema de Notificaciones:** Facilita la comunicación interna entre los miembros del equipo.
*   **Chat en Tiempo Real:** Herramienta de comunicación instantánea para una colaboración más fluida.
*   **Organización por Categorías:** Clasificación de artículos para una mejor organización y búsqueda.

## Funcionalidades por Rol de Usuario

El sistema está diseñado con roles específicos para organizar el flujo de trabajo editorial:

### Administrador
*   **Gestión Total de Usuarios:** Crear, editar, eliminar y asignar roles a los usuarios.
*   **Gestión de Contenido:** Administrar categorías y supervisar todos los artículos y archivos del sistema.
*   **Panel de Control:** Acceso a un dashboard para la administración general del sitio.

### Editor
*   **Revisión de Artículos:** Evaluar los artículos enviados por los periodistas.
*   **Aprobación y Rechazo:** Aprobar, rechazar o solicitar modificaciones en los artículos.
*   **Supervisión:** Visualizar el estado de todos los artículos en el sistema.

### Periodista
*   **Subida de Artículos:** Enviar nuevos artículos para su revisión.
*   **Seguimiento:** Consultar el estado de sus envíos (pendiente, en revisión, aprobado).
*   **Notificaciones:** Recibir alertas sobre el progreso de sus artículos.

### Fotógrafo
*   **Gestión de Imágenes:** Subir y administrar archivos multimedia.
*   **Galería Personal:** Mantener una galería propia de imágenes.
*   **Galería Global:** Acceder a un banco de imágenes compartido por todos los fotógrafos.

## Estructura del Proyecto

### Backend (Node.js + Express)
*   **`src/config`**: Conexión a la base de datos (MongoDB), configuración de subida de archivos (Multer) y envío de correos (Nodemailer).
*   **`src/controllers`**: Lógica que maneja las peticiones HTTP para cada recurso (usuarios, artículos, etc.).
*   **`src/models`**: Esquemas de datos (Mongoose) que definen la estructura de la información.
*   **`src/routes`**: Definición de los endpoints de la API.
*   **`src/middlewares`**: Funciones para autenticación (JWT), manejo de errores y otras tareas intermedias.
*   **`src/chat`**: Lógica para el chat en tiempo real con Socket.io.

### Frontend (React + Vite)
*   **`src/components`**: Componentes de React reutilizables (Navbar, formularios, etc.).
*   **`src/pages`**: Componentes que representan las páginas completas de la aplicación (Login, Dashboard, etc.).
*   **`src/context`**: Manejo del estado global de la aplicación con la Context API de React (autenticación, chat, etc.).
*   **`src/routes`**: Configuración de las rutas de la aplicación, incluyendo rutas protegidas.
*   **`src/assets`**: Archivos estáticos como imágenes y hojas de estilo CSS.

## Patrones de Diseño Utilizados

Este proyecto aplica varios patrones de diseño y arquitectónicos para asegurar un código mantenible, escalable y bien organizado.

### Backend
*   **Modelo-Vista-Controlador (MVC):** La arquitectura del backend está estructurada siguiendo el patrón MVC.
    *   **Modelos:** Definen la estructura de los datos y la lógica de negocio (`/src/models`).
    *   **Vistas:** Representadas por las respuestas JSON que la API envía al cliente.
    *   **Controladores:** Manejan las solicitudes HTTP, interactúan con los modelos y envían las respuestas (`/src/controllers`).

### Frontend
*   **Arquitectura Basada en Componentes:** La interfaz de usuario está construida con React, utilizando componentes reutilizables y autocontenidos.
*   **Patrón Proveedor (Provider Pattern):** Se utiliza la Context API de React para proveer un estado global a los componentes que lo necesitan (`/src/context`), evitando el "prop drilling".
*   **Patrón Observador (Observer Pattern):** Los componentes se "suscriben" a los cambios en los contextos de React. Cuando el estado cambia en un proveedor, los componentes suscritos se actualizan y renderizan automáticamente.

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
