import { reportService } from '../services/reportService.js';
import { ApiResponse } from '../utils/response.js';

export const reportController = {
  async getDashboardReports(_req, res, next) {
    try {
      const reports = await reportService.getDashboardReports();
      return ApiResponse.success(res, reports);
    } catch (err) {
      next(err);
    }
  },

  async getVarietySalesReport(req, res, next) {
    try {
      const breakdown = await reportService.getVarietySalesReport(req.query);
      return ApiResponse.success(res, breakdown);
    } catch (err) {
      next(err);
    }
  },
};

