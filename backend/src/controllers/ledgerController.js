import { ledgerService } from '../services/ledgerService.js';
import { ApiResponse } from '../utils/response.js';

export const ledgerController = {
  async getCustomerLedger(req, res, next) {
    try {
      const statement = await ledgerService.getCustomerStatement(req.params.customerId, req.query);
      return ApiResponse.success(res, statement);
    } catch (err) {
      return ApiResponse.notFound(res, err.message);
    }
  },

  async getLedgerSummary(_req, res, next) {
    try {
      const summary = await ledgerService.getLedgerSummary();
      return ApiResponse.success(res, summary);
    } catch (err) {
      next(err);
    }
  },
};

