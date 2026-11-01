import { Router } from 'express';
import { invoiceController } from '../controllers/invoiceController.js';

const router = Router();

router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoice);
router.post('/', invoiceController.createInvoice);
router.patch('/:id/status', invoiceController.updateInvoiceStatus);

export default router;

