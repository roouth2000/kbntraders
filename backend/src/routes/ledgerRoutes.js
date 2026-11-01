import { Router } from 'express';
import { ledgerController } from '../controllers/ledgerController.js';

const router = Router();

router.get('/customer/:customerId', ledgerController.getCustomerLedger);
router.get('/summary', ledgerController.getLedgerSummary);

export default router;

