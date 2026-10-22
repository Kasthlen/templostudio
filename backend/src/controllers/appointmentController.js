const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/email');

exports.createAppointment = async (req, res) => {
  const { clientName, clientEmail, clientPhone, service, date, time, notes } = req.body;

  const appointmentData = {
    clientName,
    clientEmail,
    clientPhone,
    service,
    date,
    time,
    notes,
  };

  try {
    const appointment = await Appointment.create(appointmentData);
    console.log('Cita creada exitosamente:', appointment._id);

    // Enviar emails en background (no esperar respuesta)
    sendEmails(appointment)
      .catch(err => console.error('Error en envío de emails (background):', err));

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error creando cita:', error);
    // Datos inválidos del formulario: responder 400 con mensajes legibles
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((e) => e.message).join('. '),
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Escapa los datos del formulario antes de insertarlos en el HTML del correo
// (evita inyección de HTML/enlaces en los emails).
const escapeHTML = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

// La fecha llega como "YYYY-MM-DD" y se guarda a medianoche UTC;
// se formatea en UTC para que no se desplace un día según la zona del servidor.
const formatDate = (date) =>
  new Date(date).toLocaleDateString('es-ES', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

async function sendEmails(appointment) {
  console.log('Iniciando envío de emails para cita:', appointment._id);

  const d = {
    name: escapeHTML(appointment.clientName),
    email: escapeHTML(appointment.clientEmail),
    phone: escapeHTML(appointment.clientPhone),
    service: escapeHTML(appointment.service),
    date: formatDate(appointment.date),
    time: escapeHTML(appointment.time),
    notes: escapeHTML(appointment.notes),
  };
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_USER;

  // Email al propietario (admin)
  const adminEmailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #8F2432;">Nueva Cita Agendada - TemploStudio</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Detalles de la Cita:</h3>
        <p><strong>Cliente:</strong> ${d.name}</p>
        <p><strong>Email:</strong> ${d.email}</p>
        <p><strong>Teléfono:</strong> ${d.phone}</p>
        <p><strong>Servicio:</strong> ${d.service}</p>
        <p><strong>Fecha:</strong> ${d.date}</p>
        <p><strong>Hora:</strong> ${d.time}</p>
        ${d.notes ? `<p><strong>Notas:</strong> ${d.notes}</p>` : ''}
      </div>
      <p style="color: #666;">Por favor gestiona esta cita desde el dashboard. Puedes responder a este correo para escribir al cliente.</p>
    </div>
  `;

  // Email de confirmación al cliente
  const clientEmailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #8F2432;">¡Cita Recibida! - TemploStudio</h2>
      <p>Gracias ${d.name}, tu cita ha sido agendada exitosamente.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Detalles de tu Cita:</h3>
        <p><strong>Servicio:</strong> ${d.service}</p>
        <p><strong>Fecha:</strong> ${d.date}</p>
        <p><strong>Hora:</strong> ${d.time}</p>
      </div>
      <p style="color: #666;">Te esperamos en TemploStudio, C. Mar Alborán, 110, Arganda del Rey, Madrid.</p>
      <p style="color: #666;">Si necesitas cancelar o modificar tu cita, responde a este correo.</p>
    </div>
  `;

  // Se envían en paralelo e independientes: si uno falla, el otro sigue.
  const results = await Promise.allSettled([
    sendEmail({
      email: adminEmail,
      subject: `Nueva cita: ${appointment.clientName} - ${d.date} ${appointment.time}`,
      html: adminEmailHTML,
      replyTo: appointment.clientEmail,
    }),
    sendEmail({
      email: appointment.clientEmail,
      subject: 'Tu cita en TemploStudio',
      html: clientEmailHTML,
      replyTo: adminEmail,
    }),
  ]);

  ['admin', 'cliente'].forEach((who, i) => {
    if (results[i].status === 'rejected') {
      console.error(`Error enviando email al ${who}:`, results[i].reason.message);
    } else {
      console.log(`Email al ${who} enviado exitosamente`);
    }
  });
}

exports.getAppointments = (req, res) => {
  Appointment.find().sort({ date: 1, time: 1 })
    .then(appointments => {
      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    }).catch(error => {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    });
};

exports.getMyAppointments = (req, res) => {
  Appointment.find({ clientEmail: req.user.email }).sort({ date: -1 })
    .then(appointments => {
      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    }).catch(error => {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    });
};

exports.getAppointment = (req, res) => {
  Appointment.findById(req.params.id)
    .then(appointment => {
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada',
        });
      }
      res.status(200).json({
        success: true,
        data: appointment,
      });
    }).catch(error => {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    });
};

exports.updateAppointment = (req, res) => {
  Appointment.findById(req.params.id)
    .then(appointment => {
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada',
        });
      }
      const { status } = req.body;
      appointment.status = status;
      return appointment.save();
    })
    .then(appointment => {
      res.status(200).json({
        success: true,
        data: appointment,
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    });
};

exports.deleteAppointment = (req, res) => {
  Appointment.findById(req.params.id)
    .then(appointment => {
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada',
        });
      }
      return appointment.deleteOne();
    })
    .then(() => {
      res.status(200).json({
        success: true,
        data: {},
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    });
};
