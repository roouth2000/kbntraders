import { paymentService } from '../services/paymentService.js';
import { ApiResponse } from '../utils/response.js';

export const paymentController = {
  async getPayments(req, res, next) {
    try {
      const payments = await paymentService.getPayments(req.query);
      return ApiResponse.success(res, payments);
    } catch (err) {
      next(err);
    }
  },

  async getPayment(req, res, next) {
    try {
      const payment = await paymentService.getPaymentByIdOrSlug(req.params.id);
      return ApiResponse.success(res, payment);
    } catch (err) {
      return ApiResponse.notFound(res, err.message);
    }
  },

  async createPayment(req, res, next) {
    try {
      const newPayment = await paymentService.createPayment(req.body);
      return ApiResponse.created(res, newPayment, 'Payment recorded successfully');
    } catch (err) {
      next(err);
    }
  },
};

