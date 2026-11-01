import { invoiceService } from '../services/invoiceService.js';
import { ApiResponse } from '../utils/response.js';

export const invoiceController = {
  async getInvoices(req, res, next) {
    try {
      const invoices = await invoiceService.getInvoices(req.query);
      return ApiResponse.success(res, invoices);
    } catch (err) {
      next(err);
    }
  },

  async getInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceByIdOrSlug(req.params.id);
      return ApiResponse.success(res, invoice);
    } catch (err) {
      return ApiResponse.notFound(res, err.message);
    }
  },

  async createInvoice(req, res, next) {
    try {
      const newInvoice = await invoiceService.createInvoice(req.body);
      return ApiResponse.created(res, newInvoice, 'Produce invoice generated successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateInvoiceStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!status) {
        return ApiResponse.badRequest(res, 'Invoice status is required');
      }
      const updated = await invoiceService.updateInvoiceStatus(req.params.id, status);
      return ApiResponse.success(res, updated, 'Invoice status updated successfully');
    } catch (err) {
      next(err);
    }
  },
};

