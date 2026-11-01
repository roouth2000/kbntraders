import { Router } from 'express';
import { roleController } from '../controllers/roleController.js';

const router = Router();

// Permission catalog
router.get('/permissions', roleController.getPermissionCatalog);

// Team members / users management
router.get('/users', roleController.getUsers);
router.post('/users', roleController.createTeamMember);
router.put('/users/:userId/role', roleController.updateUserRole);
router.patch('/users/:userId/status', roleController.toggleUserStatus);

// Role matrix
router.get('/', roleController.getRoles);
router.get('/:roleKey', roleController.getRole);
router.put('/:roleKey/permissions', roleController.updateRolePermissions);
router.post('/:roleKey/reset', roleController.resetRolePermissions);

export default router;

