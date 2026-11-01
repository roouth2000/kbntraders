import { customerService } from '../services/customerService.js';
import { ApiResponse } from '../utils/response.js';

export const customerController = {
  async getCustomers(req, res, next) {
    try {
      const customers = await customerService.getCustomers(req.query);
      return ApiResponse.success(res, customers);
    } catch (err) {
      next(err);
    }
  },

  async getCustomer(req, res, next) {
    try {
      const customer = await customerService.getCustomerByIdOrSlug(req.params.id);
      return ApiResponse.success(res, customer);
    } catch (err) {
      return ApiResponse.notFound(res, err.message);
    }
  },

  async createCustomer(req, res, next) {
    try {
      const newCustomer = await customerService.createCustomer(req.body);
      return ApiResponse.created(res, newCustomer, 'Customer created successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateCustomer(req, res, next) {
    try {
      const updated = await customerService.updateCustomer(req.params.id, req.body);
      return ApiResponse.success(res, updated, 'Customer updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteCustomer(req, res, next) {
    try {
      const result = await customerService.deleteCustomer(req.params.id);
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },
};

