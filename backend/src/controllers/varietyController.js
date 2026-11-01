import { varietyService } from '../services/varietyService.js';
import { ApiResponse } from '../utils/response.js';

export const varietyController = {
  async getVarieties(_req, res, next) {
    try {
      const varieties = await varietyService.getVarieties();
      return ApiResponse.success(res, varieties);
    } catch (err) {
      next(err);
    }
  },

  async getVariety(req, res, next) {
    try {
      const variety = await varietyService.getVarietyByIdOrSlug(req.params.id);
      return ApiResponse.success(res, variety);
    } catch (err) {
      return ApiResponse.notFound(res, err.message);
    }
  },

  async createVariety(req, res, next) {
    try {
      const newVariety = await varietyService.createVariety(req.body);
      return ApiResponse.created(res, newVariety, 'Produce variety registered successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateVariety(req, res, next) {
    try {
      const updated = await varietyService.updateVariety(req.params.id, req.body);
      return ApiResponse.success(res, updated, 'Produce variety updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteVariety(req, res, next) {
    try {
      const result = await varietyService.deleteVariety(req.params.id);
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },
};

