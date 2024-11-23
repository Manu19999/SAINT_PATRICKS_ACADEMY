
import express from 'express';
import { obtenerSolicitudesx, insertarSolicitud, actualizarSolicitud, obtenerSolicitudPorCod, eliminarSolicitud } from '../Controllers/Solicitud_adminController.js';

const router = express.Router();

// Ruta para obtener todas las solicitudes o una solicitud por Cod_solicitud
router.get('/solicitudess', obtenerSolicitudesx);

// Ruta para obtener una solicitud específica por Cod_solicitud
router.get('/solicitudes/:Cod_solicitud', obtenerSolicitudPorCod);

// Ruta para insertar una nueva solicitud
router.post('/solicitudes', insertarSolicitud);

// Ruta para actualizar una solicitud por Cod_solicitud
router.put('/solicitudes/:Cod_solicitud', actualizarSolicitud);

router.delete('/solicitud/:Cod_solicitud', eliminarSolicitud);


export default router;
