# Despliegue de TemploStudio

## Preparativos antes de desplegar

### 1. Variables de Entorno Necesarias

Antes de desplegar, necesitas configurar las siguientes variables de entorno en Render:

- **MONGODB_URI**: Tu connection string de MongoDB Atlas
- **JWT_SECRET**: Una clave secreta para JWT (usa una cadena larga y aleatoria)
- **EMAIL_USER**: Tu correo de Gmail (kasthlen97@gmail.com)
- **EMAIL_PASSWORD**: Tu contraseña de aplicación de Gmail (eanw ymqj ymop dhei)
- **EMAIL_FROM**: Remitente del email (TemploStudio <kasthlen97@gmail.com>)
- **ADMIN_EMAIL**: admin@templostudio.com
- **ADMIN_PASSWORD**: admin123456

### 2. Pasos para Desplegar en Render

1. **Crear cuenta en Render**: https://render.com
2. **Conectar tu repositorio de GitHub** a Render
3. **Crear un nuevo Web Service**:
   - Selecciona "Web Service"
   - Conecta tu repositorio
   - Render detectará automáticamente el archivo `render.yaml`
4. **Configurar las variables de entorno**:
   - Ve a la sección "Environment" en el dashboard de Render
   - Agrega todas las variables listadas arriba
5. **Hacer deploy**:
   - Render construirá y desplegará automáticamente
   - Tu aplicación estará disponible en: `https://templostudio.onrender.com`

### 3. MongoDB Atlas

Asegúrate de que tu cluster de MongoDB Atlas:
- Está activo (no pausado)
- Tiene whitelist de IPs configurada para permitir conexiones desde cualquier IP (0.0.0.0/0)
- El usuario de base de datos tiene los permisos necesarios

### 4. Gmail

Para que los emails funcionen:
- Verificación en dos pasos debe estar activa en tu cuenta de Gmail
- La contraseña debe ser una "Contraseña de aplicación" (no tu contraseña normal)
- La contraseña de aplicación actual es: `eanw ymqj ymop dhei`

## Estructura del Proyecto

```
templostudio/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── public/          # Archivos estáticos del frontend
│   ├── package.json
│   └── .env.example
├── render.yaml          # Configuración de Render
├── .env.example         # Ejemplo de variables de entorno
└── README.md
```

## Comandos Locales

```bash
# Instalar dependencias
cd backend
npm install

# Iniciar servidor en desarrollo
npm run dev

# Iniciar servidor en producción
npm start
```

## Notas Importantes

- El puerto configurado para producción es 10000
- El frontend se sirve desde `backend/public/` usando Express
- El sistema de autenticación usa JWT con expiración de 7 días
- Las citas se guardan en MongoDB Atlas
- Los emails se envían automáticamente al crear una cita
