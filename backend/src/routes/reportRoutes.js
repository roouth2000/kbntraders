import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';

const router = Router();

router.get('/dashboard', reportController.getDashboardReports);
router.get('/variety-sales', reportController.getVarietySalesReport);

export default router;

