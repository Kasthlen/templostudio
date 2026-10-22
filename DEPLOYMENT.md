# Despliegue de TemploStudio

## Preparativos antes de desplegar

### 1. Variables de Entorno Necesarias

Antes de desplegar, necesitas configurar las siguientes variables de entorno en Render:

- **MONGODB_URI**: Tu connection string de MongoDB Atlas
- **JWT_SECRET**: Una clave secreta para JWT (usa una cadena larga y aleatoria)
- **EMAIL_USER**: Tu correo de Gmail (kasthlen97@gmail.com)
- **EMAIL_PASSWORD**: Tu contraseña de aplicación de Gmail (NO la escribas aquí: configúrala solo en el dashboard de Render)
- **EMAIL_FROM**: Remitente del email (TemploStudio <kasthlen97@gmail.com>)
- **ADMIN_EMAIL**: admin@templostudio.com
- **ADMIN_PASSWORD**: Contraseña inicial/temporal del dashboard. El cliente la cambia desde el dashboard (botón *Cambiar contraseña*) y los reinicios no la sobrescriben. Si la olvida, cambiar esta variable en Render la restablece.

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

### 4. Emails (importante)

Render en plan gratuito **bloquea los puertos SMTP (25, 465, 587)** desde septiembre de 2025,
así que Gmail por SMTP no funciona en producción. El backend envía por HTTPS usando el primer
proveedor configurado:

1. **Google Apps Script** (recomendado, gratis, envía desde la propia cuenta Gmail, ~100 correos/día):
   - Abre https://script.google.com con la cuenta Gmail del negocio → *Nuevo proyecto*.
   - Pega el contenido de `backend/apps-script/Code.gs` y cambia `SECRET` por una cadena larga aleatoria.
   - Ejecuta la función `probar` y acepta los permisos (llegará un correo de prueba).
   - *Implementar → Nueva implementación → Aplicación web*. Ejecutar como **Yo**, acceso **Cualquier usuario**.
   - En Render agrega `EMAIL_WEBHOOK_URL` (la URL que termina en `/exec`) y `EMAIL_WEBHOOK_SECRET` (el mismo `SECRET`).
2. **Brevo** (alternativa, 300 correos/día): crea cuenta, verifica el remitente de `EMAIL_FROM` y
   agrega `BREVO_API_KEY` en Render.
3. **SMTP** (`EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`): solo en local o en un plan de pago de Render.

Opcional: `ADMIN_NOTIFY_EMAIL` define quién recibe el aviso de cada nueva cita (por defecto `EMAIL_USER`).

Al arrancar, el log de Render muestra `Proveedor de email: ...` para confirmar cuál se está usando.
Las contraseñas y claves **nunca** se escriben en archivos del repositorio, solo en el dashboard de Render.

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
