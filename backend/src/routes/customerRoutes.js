import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Allow reading customers with or without auth for demo convenience
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomer);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;

