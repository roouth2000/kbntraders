import { Router } from 'express';
import { varietyController } from '../controllers/varietyController.js';

const router = Router();

router.get('/', varietyController.getVarieties);
router.get('/:id', varietyController.getVariety);
router.post('/', varietyController.createVariety);
router.put('/:id', varietyController.updateVariety);
router.delete('/:id', varietyController.deleteVariety);

export default router;

