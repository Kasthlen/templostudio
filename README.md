# TemploStudio

Sitio web de barbería y peluquería integral con sistema de agendamiento de citas.

## Estructura del Proyecto

- **Frontend**: Sitio web estático integrado en `backend/public/index.html`
- **Backend**: API Node.js + Express + MongoDB (`backend/`)

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js (v14 o superior)
- MongoDB Atlas cluster configurado o MongoDB local
- Cuenta de Gmail para notificaciones (opcional)

### Instalación

1. Navegar al directorio backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar `.env` con tus configuraciones:
   - `MONGODB_URI`: Tu cadena de conexión de MongoDB Atlas
   - `EMAIL_USER`: Tu email de Gmail
   - `EMAIL_PASSWORD`: Tu contraseña de aplicación de Gmail
   - `ADMIN_EMAIL`: Email del administrador
   - `ADMIN_PASSWORD`: Contraseña del administrador

### Ejecutar en desarrollo

```bash
npm start
```

El servidor estará disponible en: **http://localhost:3333**

- **Frontend**: http://localhost:3333
- **Dashboard**: http://localhost:3333/dashboard.html
- **API**: http://localhost:3333/api

### MongoDB Atlas

1. Crea un cluster en [MongoDB Atlas](https://cloud.mongodb.com/)
2. Configura la whitelist de IPs (Network Access):
   - Agrega tu IP actual o usa `0.0.0.0/0` para permitir todas las IPs (solo para desarrollo)
3. Crea un usuario de base de datos en Database Access
4. Obtén la cadena de conexión en Connect → Connect your application
5. Copia la URI en tu archivo `.env`

Formato de URI (mongodb+srv):
```
mongodb+srv://usuario:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Dashboard Admin

Credenciales por defecto (configurables en `.env`):
- Email: admin@templostudio.com
- Password: la definida en `ADMIN_PASSWORD` (mínimo 12 caracteres)

⚠️ **IMPORTANTE**: Cambia estas credenciales en producción

### Características

- ✅ Sistema de agendamiento de citas en línea
- ✅ Autenticación JWT para administradores
- ✅ Dashboard para gestión de citas
- ✅ Notificaciones por email automáticas
- ✅ API RESTful
- ✅ Frontend y backend integrados en un solo servidor

### Deployment

- **Backend**: Render (configuración en `backend/render.yaml`)
- **Frontend**: Vercel (opcional, también puede servirse desde Express)

Ver instrucciones detalladas en `backend/DEPLOYMENT.md`
