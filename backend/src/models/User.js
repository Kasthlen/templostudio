const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingresa un nombre'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Por favor ingresa un email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Por favor ingresa una contraseña'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client',
  },
  phone: {
    type: String,
    trim: true,
  },
  // Hash del último ADMIN_PASSWORD aplicado desde Render (solo admin).
  // Permite saber si la variable cambió sin pisar la contraseña elegida en el dashboard.
  envPasswordHash: {
    type: String,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encriptar contraseña antes de guardar
// (Mongoose 9: los hooks async ya no reciben next, basta con return)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
