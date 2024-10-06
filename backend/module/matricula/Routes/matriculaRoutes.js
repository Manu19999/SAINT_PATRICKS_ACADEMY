
import express from 'express';
import { crearMatricula, obtenerMatricula, obtenerCaja, actualizarMatricula, aplicarDescuentoAutomatico, crearDescuento, obtenerDescuentos, actualizarDescuento,
    actualizarDescuentoAutomatico, eliminarMatricula} from '../Controllers/matriculaController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para crear una matrícula
router.post('/crearmatricula', crearMatricula);

// Ruta para obtener todas las matrículas
router.get('/matriculas', obtenerMatricula);

// Ruta para obtener una matrícula por Cod_matricula
router.get('/matriculas/:Cod_matricula', obtenerMatricula);

// Ruta para actualizar una matrícula por Cod_matricula
router.put('/matriculas', actualizarMatricula); // Actualiza la matrícula

// Ruta para obtener todas las cajas
router.get('/cajas', obtenerCaja);

// Ruta para obtener una caja por Cod_caja
router.get('/cajas/:Cod_caja', obtenerCaja);

//Ruta para aplicar decuento automatico
router.post('/aplicar-descuento', aplicarDescuentoAutomatico);

// Ruta para crear un nuevo descuento
router.post('/descuentos', crearDescuento);

// Ruta para obtener descuentos
router.get('/descuentos/:id?', obtenerDescuentos);

// Ruta para actualizar un descuento
router.put('/descuentos', actualizarDescuento); // No es necesario enviar el ID en la URL

// Ruta para actualizar el descuento automático
router.put('/actualizar-descuento-automatico', actualizarDescuentoAutomatico); // Nueva ruta

// Ruta para eliminar una matrícula por Cod_matricula
router.delete('/matriculas/:Cod_matricula', eliminarMatricula); // Nueva ruta para eliminar matrícula


export default router;
