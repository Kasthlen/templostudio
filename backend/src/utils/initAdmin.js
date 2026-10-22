const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Crea el admin si no existe. Si ya existe, solo aplica ADMIN_PASSWORD cuando
// su valor cambió en Render desde la última vez (envPasswordHash): así el
// cliente puede cambiar su contraseña desde el dashboard sin que un reinicio
// la sobrescriba, y cambiar la variable en Render sirve para recuperarla.
const initAdmin = async () => {
  try {
    const envPassword = process.env.ADMIN_PASSWORD;
    if (!process.env.ADMIN_EMAIL || !envPassword) {
      console.warn('ADMIN_EMAIL o ADMIN_PASSWORD no configurados: no se inicializa el admin');
      return;
    }

    const envPasswordHash = await bcrypt.hash(envPassword, 10);
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL }).select('+password +envPasswordHash');

    if (!admin) {
      await User.create({
        name: 'Admin TemploStudio',
        email: process.env.ADMIN_EMAIL,
        password: envPassword,
        role: 'admin',
        phone: '+57 300 000 0000',
        envPasswordHash,
      });
      console.log(`Usuario admin creado: ${process.env.ADMIN_EMAIL}`);
      return;
    }

    const envChanged = !admin.envPasswordHash || !(await bcrypt.compare(envPassword, admin.envPasswordHash));
    if (envChanged) {
      admin.password = envPassword;
      admin.envPasswordHash = envPasswordHash;
      await admin.save();
      console.log('ADMIN_PASSWORD cambió en el entorno: contraseña del admin actualizada');
    } else {
      console.log('Usuario admin ya existe');
    }
  } catch (error) {
    console.error('Error inicializando usuario admin:', error.message);
  }
};

module.exports = initAdmin;
