const nodemailer = require('nodemailer');

// Render (plan gratuito) bloquea los puertos SMTP salientes 25, 465 y 587
// desde septiembre de 2025, por eso en producción se envía por HTTPS (443).
// Proveedor elegido según las variables de entorno disponibles:
//   1. EMAIL_WEBHOOK_URL -> Google Apps Script (envía desde la cuenta Gmail)
//   2. BREVO_API_KEY     -> API HTTP de Brevo
//   3. EMAIL_HOST/USER   -> SMTP con nodemailer (desarrollo local / plan pago)

const getProvider = () => {
  if (process.env.EMAIL_WEBHOOK_URL) return 'apps-script';
  if (process.env.BREVO_API_KEY) return 'brevo';
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) return 'smtp';
  return null;
};

// Separa "Nombre <correo@x.com>" en sus partes
const parseFrom = () => {
  const raw = process.env.EMAIL_FROM || process.env.EMAIL_USER || '';
  const match = raw.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1].trim() || 'TemploStudio', email: match[2].trim() };
  return { name: 'TemploStudio', email: raw.trim() };
};

const postJSON = async (url, body, headers = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`);
  }
  return text;
};

// Limpia espacios, saltos de línea y comillas que se cuelan al pegar
// valores en el dashboard de Render.
const cleanEnv = (value = '') => value.trim().replace(/^(['"])(.*)\1$/, '$2').trim();

const sendWithAppsScript = async ({ email, subject, html, replyTo }) => {
  const text = await postJSON(cleanEnv(process.env.EMAIL_WEBHOOK_URL), {
    secret: cleanEnv(process.env.EMAIL_WEBHOOK_SECRET),
    to: email,
    subject,
    html,
    replyTo,
    name: parseFrom().name,
  });
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // Si no es JSON, normalmente es la página de login de Google:
    // el script no se publicó con acceso "Cualquier usuario".
    throw new Error(`Respuesta inesperada de Apps Script (revisa que el acceso sea "Cualquier usuario"): ${text.slice(0, 200)}`);
  }
  if (!data.success) {
    // Pista para depurar sin exponer el secreto: su longitud tras limpiarlo
    const hint = /secreto/i.test(data.error)
      ? ` (EMAIL_WEBHOOK_SECRET tiene ${cleanEnv(process.env.EMAIL_WEBHOOK_SECRET).length} caracteres; debe ser idéntico a SECRET en Code.gs)`
      : '';
    throw new Error(`Apps Script: ${data.error}${hint}`);
  }
  return { messageId: 'apps-script' };
};

const sendWithBrevo = async ({ email, subject, html, replyTo }) => {
  const text = await postJSON(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: parseFrom(),
      to: [{ email }],
      subject,
      htmlContent: html,
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    },
    { 'api-key': process.env.BREVO_API_KEY, accept: 'application/json' }
  );
  return { messageId: JSON.parse(text).messageId };
};

const sendWithSMTP = async ({ email, subject, html, replyTo }) => {
  const port = Number(process.env.EMAIL_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 15000,
  });
  const { name, email: fromEmail } = parseFrom();
  return transporter.sendMail({
    from: `${name} <${fromEmail}>`,
    to: email,
    subject,
    html,
    replyTo,
  });
};

const sendEmail = async (options) => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('No hay proveedor de email configurado (EMAIL_WEBHOOK_URL, BREVO_API_KEY o EMAIL_HOST)');
  }

  console.log(`Enviando email vía ${provider} a: ${options.email}`);
  try {
    let info;
    if (provider === 'apps-script') info = await sendWithAppsScript(options);
    else if (provider === 'brevo') info = await sendWithBrevo(options);
    else info = await sendWithSMTP(options);
    console.log(`Email enviado exitosamente vía ${provider}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error enviando email vía ${provider}:`, error.message);
    if (provider === 'smtp' && ['ETIMEDOUT', 'ESOCKET', 'ECONNECTION'].includes(error.code)) {
      console.error('El puerto SMTP parece bloqueado (Render free lo bloquea). Configura EMAIL_WEBHOOK_URL o BREVO_API_KEY.');
    }
    throw error;
  }
};

sendEmail.getProvider = getProvider;

module.exports = sendEmail;
