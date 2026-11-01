import { roleService } from '../services/roleService.js';
import { ApiResponse } from '../utils/response.js';

export const roleController = {
  async getPermissionCatalog(_req, res, next) {
    try {
      const catalog = roleService.getPermissionCatalog();
      return ApiResponse.success(res, catalog);
    } catch (err) {
      next(err);
    }
  },

  async getRoles(_req, res, next) {
    try {
      const roles = roleService.getRoles();
      return ApiResponse.success(res, roles);
    } catch (err) {
      next(err);
    }
  },

  async getRole(req, res, next) {
    try {
      const role = roleService.getRoleByKey(req.params.roleKey);
      return ApiResponse.success(res, role);
    } catch (err) {
      return ApiResponse.notFound(res, err.message);
    }
  },

  async updateRolePermissions(req, res, next) {
    try {
      const { permissions } = req.body;
      if (!Array.isArray(permissions)) {
        return ApiResponse.badRequest(res, 'Permissions must be provided as an array of strings');
      }

      const result = roleService.updateRolePermissions(req.params.roleKey, permissions);
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },

  async resetRolePermissions(req, res, next) {
    try {
      const result = roleService.resetRoleToDefault(req.params.roleKey);
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },

  async getUsers(_req, res, next) {
    try {
      const users = roleService.getUsers();
      return ApiResponse.success(res, users);
    } catch (err) {
      next(err);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      if (!role) {
        return ApiResponse.badRequest(res, 'New role is required');
      }

      const result = roleService.updateUserRole(req.params.userId, role);
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },

  async toggleUserStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      if (isActive === undefined) {
        return ApiResponse.badRequest(res, 'isActive boolean parameter is required');
      }

      const result = roleService.toggleUserStatus(req.params.userId, isActive);
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },

  async createTeamMember(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email) {
        return ApiResponse.badRequest(res, 'Name and email are required');
      }

      const result = await roleService.createTeamMember({ name, email, password, role });
      return ApiResponse.created(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },
};

