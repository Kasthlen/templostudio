const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    console.log('Configurando transporter con:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      passwordSet: !!process.env.EMAIL_PASSWORD,
    });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Solo para desarrollo
      }
    });

    // Verificar la conexión
    await transporter.verify();
    console.log('Servidor de email verificado correctamente');

    const message = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    console.log('Enviando email a:', options.email);
    const info = await transporter.sendMail(message);
    console.log('Email enviado exitosamente: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error enviando email:', error.message);
    console.error('Detalles del error:', error);
    throw error;
  }
};

module.exports = sendEmail;
