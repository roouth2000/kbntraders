import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';

const router = Router();

router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPayment);
router.post('/', paymentController.createPayment);

export default router;

