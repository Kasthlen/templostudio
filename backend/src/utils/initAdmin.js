const User = require('../models/User');

// Crea el admin si no existe y, si ya existe, sincroniza su contraseña con
// ADMIN_PASSWORD: así basta con cambiar la variable en Render para rotarla.
const initAdmin = async () => {
  try {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.warn('ADMIN_EMAIL o ADMIN_PASSWORD no configurados: no se inicializa el admin');
      return;
    }

    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL }).select('+password');

    if (!admin) {
      await User.create({
        name: 'Admin TemploStudio',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        phone: '+57 300 000 0000',
      });
      console.log(`Usuario admin creado: ${process.env.ADMIN_EMAIL}`);
    } else if (!(await admin.matchPassword(process.env.ADMIN_PASSWORD))) {
      admin.password = process.env.ADMIN_PASSWORD;
      await admin.save();
      console.log('Contraseña del admin actualizada desde ADMIN_PASSWORD');
    } else {
      console.log('Usuario admin ya existe');
    }

    if (process.env.ADMIN_PASSWORD.length < 12) {
      console.warn('⚠️  ADMIN_PASSWORD es corta: usa al menos 12 caracteres en producción');
    }
  } catch (error) {
    console.error('Error inicializando usuario admin:', error.message);
  }
};

module.exports = initAdmin;
