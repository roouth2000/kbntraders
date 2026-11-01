import { ApiResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/index.js';

export function errorHandler(err, req, res, _next) {
  logger.error(`Unhandled error on ${req.method} ${req.url}:`, err.message);

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return ApiResponse.badRequest(res, 'Validation error', messages);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return ApiResponse.error(res, 'Duplicate resource entry already exists', HTTP_STATUS.CONFLICT);
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  return ApiResponse.error(res, err.message || 'Internal Server Error', statusCode);
}

