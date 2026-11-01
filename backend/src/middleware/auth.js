import { verifyAccessToken } from '../utils/jwt.js';
import { ApiResponse } from '../utils/response.js';
import { roleService } from '../services/roleService.js';

/**
 * Authentication Middleware: Protects endpoints via JWT Bearer Token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return ApiResponse.unauthorized(res, 'Access denied. Bearer token is missing.');
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return ApiResponse.unauthorized(res, 'Access denied. Token is invalid or expired.');
  }

  req.user = decoded;
  next();
}

/**
 * Role-Based Access Control Guard
 * @param  {...string} allowedRoles
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, `Forbidden: Requires one of [${allowedRoles.join(', ')}] role.`);
    }

    next();
  };
}

/**
 * Permission-Based Access Control Guard
 * Checks whether user's role has the requested permission
 * @param  {...string} requiredPermissions
 */
export function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const userRole = req.user.role || 'viewer';

    // Check if user's role has at least one of the required permissions (or all if specified)
    const hasAny = requiredPermissions.some((perm) => roleService.hasPermission(userRole, perm));
    if (!hasAny) {
      return ApiResponse.forbidden(
        res,
        `Forbidden: Missing required permission [${requiredPermissions.join(', ')}] for role '${userRole}'.`
      );
    }

    next();
  };
}
