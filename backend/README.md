# TemploStudio Backend

Backend para el sistema de agendamiento de citas de TemploStudio.

## Tecnologías

- Node.js + Express
- MongoDB
- JWT Authentication
- Nodemailer (Email)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Editar `.env` con tus configuraciones:
- MONGODB_URI: URL de tu base de datos MongoDB
- EMAIL_USER y EMAIL_PASSWORD: Configuración de Gmail (usa App Password)
- JWT_SECRET: Clave secreta para JWT

## Configuración de Gmail

Para enviar emails necesitas crear una App Password de Gmail:

1. Ve a tu cuenta de Google
2. Activar 2FA (autenticación de dos factores)
3. Ve a Configuración > Seguridad > App Passwords
4. Crea una nueva App Password para "Mail"
5. Usa esa contraseña en `EMAIL_PASSWORD`

## Ejecutar

Desarrollo:
```bash
npm run dev
```

Producción:
```bash
npm start
```

## API Endpoints

### Auth
- POST /api/auth/register - Registrar usuario
- POST /api/auth/login - Login
- GET /api/auth/me - Obtener perfil (requiere token)

### Appointments
- POST /api/appointments - Crear cita (público)
- GET /api/appointments - Obtener todas las citas (admin)
- GET /api/appointments/my-appointments - Obtener mis citas (usuario)
- GET /api/appointments/:id - Obtener cita por ID (admin)
- PUT /api/appointments/:id - Actualizar estado de cita (admin)
- DELETE /api/appointments/:id - Eliminar cita (admin)

## Dashboard Admin

El dashboard está disponible en: `http://localhost:5000/dashboard.html`

Credenciales por defecto:
- Email: admin@templostudio.com
- Password: la definida en `ADMIN_PASSWORD` (temporal; se cambia desde el dashboard con *Cambiar contraseña*)

⚠️ Cambia estas credenciales en producción

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── appointmentController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Appointment.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── appointments.js
│   ├── utils/
│   │   ├── email.js
│   │   └── initAdmin.js
│   └── server.js
├── public/
│   └── dashboard.html
├── .env
├── .env.example
└── package.json
```
