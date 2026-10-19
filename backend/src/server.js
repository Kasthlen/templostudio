const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const initAdmin = require('./utils/initAdmin');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB().then(() => {
  // Inicializar usuario admin
  initAdmin();
});

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
