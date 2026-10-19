const express = require('express');
const {
  createAppointment,
  getAppointments,
  getMyAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Rutas específicas primero
router.get('/my-appointments', protect, getMyAppointments);

// Rutas con parámetros después
router.post('/', (req, res) => {
  createAppointment(req, res);
});
router.get('/', protect, authorize('admin'), getAppointments);
router.get('/:id', protect, authorize('admin'), getAppointment);
router.put('/:id', protect, authorize('admin'), updateAppointment);
router.delete('/:id', protect, authorize('admin'), deleteAppointment);

module.exports = router;
