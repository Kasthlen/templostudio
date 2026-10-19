const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/email');

exports.createAppointment = (req, res) => {
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

  Appointment.create(appointmentData).then(appointment => {
    // Enviar emails
    sendEmails(appointment, clientName, clientEmail, clientPhone, service, date, time, notes);

    res.status(201).json({
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

function sendEmails(appointment, clientName, clientEmail, clientPhone, service, date, time, notes) {
  // Enviar email al propietario (admin)
  const adminEmailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #8F2432;">Nueva Cita Agendada - TemploStudio</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Detalles de la Cita:</h3>
        <p><strong>Cliente:</strong> ${clientName}</p>
        <p><strong>Email:</strong> ${clientEmail}</p>
        <p><strong>Teléfono:</strong> ${clientPhone}</p>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Fecha:</strong> ${new Date(date).toLocaleDateString('es-ES')}</p>
        <p><strong>Hora:</strong> ${time}</p>
        ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ''}
      </div>
      <p style="color: #666;">Por favor gestiona esta cita desde el dashboard.</p>
    </div>
  `;

  sendEmail({
    email: process.env.EMAIL_USER,
    subject: 'Nueva Cita Agendada - TemploStudio',
    html: adminEmailHTML,
  }).catch(err => console.error('Error enviando email al admin:', err));

  // Enviar email de confirmación al cliente
  const clientEmailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #8F2432;">¡Cita Confirmada! - TemploStudio</h2>
      <p>Gracias ${clientName}, tu cita ha sido agendada exitosamente.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Detalles de tu Cita:</h3>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Fecha:</strong> ${new Date(date).toLocaleDateString('es-ES')}</p>
        <p><strong>Hora:</strong> ${time}</p>
      </div>
      <p style="color: #666;">Te esperamos en TemploStudio. Si necesitas cancelar o modificar tu cita, contáctanos.</p>
      <p style="color: #666;">Teléfono: ${clientPhone}</p>
    </div>
  `;

  sendEmail({
    email: clientEmail,
    subject: 'Cita Confirmada - TemploStudio',
    html: clientEmailHTML,
  }).catch(err => console.error('Error enviando email al cliente:', err));
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
