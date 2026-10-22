const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rutas - verificar token
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado para acceder a esta ruta',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, el usuario ya no existe',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado, token inválido',
    });
  }
};

// Verificar si es admin
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El usuario ${req.user.role} no está autorizado para acceder a esta ruta`,
      });
    }
    next();
  };
};
