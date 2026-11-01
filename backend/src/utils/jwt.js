import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Generate Dual JWT Tokens (Access Token + Refresh Token)
 * @param {object} payload - User identification payload
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export function generateTokens(payload) {
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role || 'user',
    name: payload.name,
    companyName: payload.companyName,
  };

  const accessToken = jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
}

/**
 * Verify Access Token
 * @param {string} token
 * @returns {object|null} Decoded payload or null
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (_err) {
    return null;
  }
}

/**
 * Verify Refresh Token
 * @param {string} token
 * @returns {object|null} Decoded payload or null
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (_err) {
    return null;
  }
}

/**
 * Attach refresh token cookie to response
 * @param {object} res - Express response
 * @param {string} refreshToken
 */
export function setRefreshTokenCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  });
}

/**
 * Clear refresh token cookie from response
 * @param {object} res - Express response
 */
export function clearRefreshTokenCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  });
}

