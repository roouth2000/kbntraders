import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { inMemoryStore } from './seedService.js';
import { generateTokens } from '../utils/jwt.js';

export const authService = {
  async register({ name, email, password, companyName, role = 'user' }) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = inMemoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('User already exists with this email address');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: hashedPassword,
      role,
      company_name: companyName || 'KBN Traders Fruit Commission Agents',
      currency: '₹',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    inMemoryStore.users.push(newUser);

    const tokens = generateTokens(newUser);
    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.company_name,
        currency: newUser.currency,
        avatar: newUser.avatar,
      },
      ...tokens,
    };
  },

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const tokens = generateTokens(user);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.company_name,
        currency: user.currency,
        avatar: user.avatar,
      },
      ...tokens,
    };
  },

  async getCurrentUser(userId) {
    const user = inMemoryStore.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.company_name,
      currency: user.currency,
      avatar: user.avatar,
    };
  },

  async refreshToken(decodedToken) {
    const user = inMemoryStore.users.find((u) => u.id === decodedToken.id);
    if (!user) {
      throw new Error('User no longer exists');
    }

    const tokens = generateTokens(user);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.company_name,
        currency: user.currency,
        avatar: user.avatar,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  },

  async forgotPassword(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return { message: 'If an account exists with that email, a reset link has been dispatched.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.reset_token = resetToken;
    user.reset_token_expires_at = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    return {
      message: 'Password reset link dispatched.',
      token: resetToken, // For local testing convenience
    };
  },

  async resetPassword({ email, token, newPassword }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user || user.reset_token !== token) {
      throw new Error('Invalid or expired password reset token');
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.reset_token = null;
    user.reset_token_expires_at = null;

    return { message: 'Password reset successful. You may now log in.' };
  },

  async updateProfile(userId, { name, companyName, currency, avatar }) {
    const user = inMemoryStore.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (name) user.name = name.trim();
    if (companyName) user.company_name = companyName.trim();
    if (currency) user.currency = currency.trim();
    if (avatar) user.avatar = avatar;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.company_name,
      currency: user.currency,
      avatar: user.avatar,
    };
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = inMemoryStore.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new Error('Current password does not match');
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    return { message: 'Password updated successfully' };
  },

  async getUsers() {
    return inMemoryStore.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      companyName: u.company_name,
      avatar: u.avatar,
    }));
  },
};

