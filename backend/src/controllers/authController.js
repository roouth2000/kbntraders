import { authService } from '../services/authService.js';
import { ApiResponse } from '../utils/response.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie, verifyRefreshToken } from '../utils/jwt.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password, companyName, role } = req.body;
      if (!name || !email || !password) {
        return ApiResponse.badRequest(res, 'Name, email, and password are required');
      }

      const result = await authService.register({ name, email, password, companyName, role });
      setRefreshTokenCookie(res, result.refreshToken);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return ApiResponse.badRequest(res, 'Email and password are required');
      }

      const result = await authService.login({ email, password });
      setRefreshTokenCookie(res, result.refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      return ApiResponse.unauthorized(res, err.message);
    }
  },

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return ApiResponse.success(res, user);
    } catch (err) {
      next(err);
    }
  },

  async refreshToken(req, res) {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return ApiResponse.unauthorized(res, 'Refresh token missing');
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      clearRefreshTokenCookie(res);
      return ApiResponse.unauthorized(res, 'Refresh token invalid or expired');
    }

    try {
      const result = await authService.refreshToken(decoded);
      setRefreshTokenCookie(res, result.refreshToken);

      return res.status(200).json({
        success: true,
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      clearRefreshTokenCookie(res);
      return ApiResponse.unauthorized(res, err.message);
    }
  },

  async logout(_req, res) {
    clearRefreshTokenCookie(res);
    return ApiResponse.success(res, null, 'Logged out successfully');
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return ApiResponse.badRequest(res, 'Email address is required');
      }
      const result = await authService.forgotPassword(email);
      return ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { email, token, newPassword } = req.body;
      if (!email || !token || !newPassword) {
        return ApiResponse.badRequest(res, 'Email, token, and new password are required');
      }
      const result = await authService.resetPassword({ email, token, newPassword });
      return ApiResponse.success(res, null, result.message);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const updated = await authService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, updated, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return ApiResponse.badRequest(res, 'Current password and new password are required');
      }
      const result = await authService.changePassword(req.user.id, { currentPassword, newPassword });
      return ApiResponse.success(res, null, result.message);
    } catch (err) {
      next(err);
    }
  },

  async getUsers(_req, res, next) {
    try {
      const users = await authService.getUsers();
      return ApiResponse.success(res, users);
    } catch (err) {
      next(err);
    }
  },
};

