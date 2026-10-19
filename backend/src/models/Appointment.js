const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Por favor ingresa el nombre del cliente'],
    trim: true,
  },
  clientEmail: {
    type: String,
    required: [true, 'Por favor ingresa el email del cliente'],
    lowercase: true,
    trim: true,
  },
  clientPhone: {
    type: String,
    required: [true, 'Por favor ingresa el teléfono del cliente'],
    trim: true,
  },
  service: {
    type: String,
    required: [true, 'Por favor selecciona un servicio'],
  },
  date: {
    type: Date,
    required: [true, 'Por favor selecciona una fecha'],
  },
  time: {
    type: String,
    required: [true, 'Por favor selecciona una hora'],
  },
  status: {
    type: String,
    enum: ['pendiente', 'confirmada', 'completada', 'cancelada'],
    default: 'pendiente',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Actualizar updatedAt antes de guardar (usando sync approach)
appointmentSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
