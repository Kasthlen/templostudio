const User = require('../models/User');

const initAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (!adminExists) {
      const admin = await User.create({
        name: 'Admin TemploStudio',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        phone: '+57 300 000 0000',
      });

      console.log('Usuario admin creado exitosamente:');
      console.log(`Email: ${admin.email}`);
      console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
      console.log('⚠️  Cambia la contraseña en producción');
    } else {
      console.log('Usuario admin ya existe');
    }
  } catch (error) {
    console.error('Error creando usuario admin:', error.message);
  }
};

module.exports = initAdmin;
