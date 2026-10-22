/**
 * Relay de correo para TemploStudio (Google Apps Script).
 *
 * Render (plan gratuito) bloquea SMTP, así que el backend envía por HTTPS
 * a este script, que a su vez envía el correo desde la cuenta Gmail.
 *
 * Instalación (con la cuenta Gmail que enviará los correos):
 *   1. Ir a https://script.google.com -> "Nuevo proyecto" y pegar este archivo.
 *   2. Cambiar SECRET por una cadena larga y aleatoria (la misma que
 *      EMAIL_WEBHOOK_SECRET en Render).
 *   3. Ejecutar la función "probar" una vez y aceptar los permisos.
 *   4. Implementar -> Nueva implementación -> Tipo "Aplicación web"
 *      Ejecutar como: "Yo"   |   Quién tiene acceso: "Cualquier usuario"
 *   5. Copiar la URL (termina en /exec) en EMAIL_WEBHOOK_URL en Render.
 */
const SECRET = 'CAMBIA_ESTE_SECRETO';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.secret !== SECRET) {
      return respond({ success: false, error: 'Secreto inválido' });
    }
    if (!data.to || !data.subject || !data.html) {
      return respond({ success: false, error: 'Faltan campos (to, subject, html)' });
    }
    const options = {
      to: data.to,
      subject: data.subject,
      htmlBody: data.html,
      name: data.name || 'TemploStudio',
    };
    if (data.replyTo) options.replyTo = data.replyTo;
    MailApp.sendEmail(options);
    return respond({ success: true, remaining: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return respond({ success: false, error: String(err) });
  }
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Ejecutar manualmente una vez para autorizar permisos y verificar el envío.
function probar() {
  const yo = Session.getActiveUser().getEmail();
  MailApp.sendEmail({
    to: yo,
    subject: 'Prueba relay TemploStudio',
    htmlBody: '<p>El relay de correo funciona.</p>',
    name: 'TemploStudio',
  });
  Logger.log('Correo de prueba enviado a ' + yo + '. Cuota restante: ' + MailApp.getRemainingDailyQuota());
}
