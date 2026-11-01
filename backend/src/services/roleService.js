import bcrypt from 'bcryptjs';
import {
  USER_ROLES,
  PERMISSIONS,
  PERMISSION_MODULES,
  DEFAULT_ROLE_PERMISSIONS,
} from '../constants/index.js';
import { inMemoryStore } from './seedService.js';
import { slugify } from '../utils/slug.js';

// In-memory role permission registry (cloned from defaults)
const rolePermissionsMatrix = {
  [USER_ROLES.ADMIN]: [...DEFAULT_ROLE_PERMISSIONS.admin],
  [USER_ROLES.MANAGER]: [...DEFAULT_ROLE_PERMISSIONS.manager],
  [USER_ROLES.CASHIER]: [...DEFAULT_ROLE_PERMISSIONS.cashier],
  [USER_ROLES.USER]: [...DEFAULT_ROLE_PERMISSIONS.user],
  [USER_ROLES.VIEWER]: [...DEFAULT_ROLE_PERMISSIONS.viewer],
};

// Metadata for standard roles
const roleMetadata = [
  {
    key: USER_ROLES.ADMIN,
    name: 'Super Administrator',
    badge: 'Full Access',
    color: 'emerald',
    description: 'Complete unrestricted access across fruit auctions, ledger reconciliations, rate adjustments, and staff access control.',
    isSystem: true,
  },
  {
    key: USER_ROLES.MANAGER,
    name: 'Mandi Operations Manager',
    badge: 'Operations Lead',
    color: 'teal',
    description: 'Manages wholesale billing, produce pricing, customer registries, payment entries, and generates audit reports.',
    isSystem: false,
  },
  {
    key: USER_ROLES.CASHIER,
    name: 'Cashier & Counter Billing',
    badge: 'Billing Counter',
    color: 'sky',
    description: 'Creates produce invoices at the mandi scale, logs cash/UPI payments, and looks up customer dues.',
    isSystem: false,
  },
  {
    key: USER_ROLES.USER,
    name: 'Standard Staff Member',
    badge: 'Staff',
    color: 'slate',
    description: 'Basic access to create invoices and check buyer accounts with limited rate modification permissions.',
    isSystem: false,
  },
  {
    key: USER_ROLES.VIEWER,
    name: 'Financial Auditor / Viewer',
    badge: 'Read Only',
    color: 'amber',
    description: 'Read-only access for external auditors, accountants, and partners to review financial statements without editing rights.',
    isSystem: false,
  },
];

export const roleService = {
  /**
   * Get all available system permissions grouped by domain module
   */
  getPermissionCatalog() {
    return {
      modules: PERMISSION_MODULES,
      allPermissions: Object.values(PERMISSIONS),
    };
  },

  /**
   * Get all roles with their assigned permissions and user count
   */
  getRoles() {
    return roleMetadata.map((role) => {
      const assignedPerms = rolePermissionsMatrix[role.key] || [];
      const userCount = inMemoryStore.users.filter((u) => u.role === role.key).length;
      return {
        ...role,
        permissions: assignedPerms,
        userCount,
        totalPermissionsCount: Object.values(PERMISSIONS).length,
      };
    });
  },

  /**
   * Get single role details
   */
  getRoleByKey(roleKey) {
    const meta = roleMetadata.find((r) => r.key === roleKey);
    if (!meta) {
      throw new Error(`Role '${roleKey}' not recognized`);
    }
    const permissions = rolePermissionsMatrix[roleKey] || [];
    const users = inMemoryStore.users
      .filter((u) => u.role === roleKey)
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        isActive: u.is_active,
        avatar: u.avatar,
      }));

    return {
      ...meta,
      permissions,
      users,
    };
  },

  /**
   * Update permissions matrix for a specific role
   */
  updateRolePermissions(roleKey, newPermissions) {
    if (roleKey === USER_ROLES.ADMIN) {
      // Super Admin retains all permissions for system security
      rolePermissionsMatrix[roleKey] = Object.values(PERMISSIONS);
      return {
        roleKey,
        permissions: rolePermissionsMatrix[roleKey],
        message: 'Administrator maintains full permissions.',
      };
    }

    if (!rolePermissionsMatrix[roleKey]) {
      throw new Error(`Role '${roleKey}' not found`);
    }

    const validKeys = new Set(Object.values(PERMISSIONS));
    const sanitized = newPermissions.filter((p) => validKeys.has(p));

    rolePermissionsMatrix[roleKey] = Array.from(new Set(sanitized));

    return {
      roleKey,
      permissions: rolePermissionsMatrix[roleKey],
      message: `Permissions updated successfully for ${roleKey}.`,
    };
  },

  /**
   * Reset role permissions back to default factory baseline
   */
  resetRoleToDefault(roleKey) {
    if (DEFAULT_ROLE_PERMISSIONS[roleKey]) {
      rolePermissionsMatrix[roleKey] = [...DEFAULT_ROLE_PERMISSIONS[roleKey]];
    }
    return {
      roleKey,
      permissions: rolePermissionsMatrix[roleKey] || [],
      message: `Role ${roleKey} permissions reset to factory defaults.`,
    };
  },

  /**
   * Check if a specific role possesses a permission
   */
  hasPermission(roleKey, permissionKey) {
    if (roleKey === USER_ROLES.ADMIN) return true;
    const perms = rolePermissionsMatrix[roleKey] || [];
    return perms.includes(permissionKey);
  },

  /**
   * Get all team members / users with their assigned roles and status
   */
  getUsers() {
    return inMemoryStore.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      companyName: u.company_name,
      currency: u.currency,
      avatar: u.avatar,
      isActive: u.is_active !== false,
      createdAt: u.created_at,
      permissions: rolePermissionsMatrix[u.role] || [],
    }));
  },

  /**
   * Change user role
   */
  updateUserRole(userId, newRole) {
    const user = inMemoryStore.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const validRoles = Object.values(USER_ROLES);
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    user.role = newRole;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.is_active !== false,
      message: `Role updated to ${newRole} for ${user.name}`,
    };
  },

  /**
   * Toggle user active/suspended status
   */
  toggleUserStatus(userId, isActive) {
    const user = inMemoryStore.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.is_active = Boolean(isActive);

    return {
      id: user.id,
      name: user.name,
      isActive: user.is_active,
      message: `User account ${user.is_active ? 'activated' : 'suspended'}`,
    };
  },

  /**
   * Add a new team member / user
   */
  async createTeamMember({ name, email, password, role = 'cashier' }) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = inMemoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('An account already exists with this email address');
    }

    const hashedPassword = await bcrypt.hash(password || 'Password123!', 10);
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: hashedPassword,
      role,
      company_name: 'KBN Traders Fruit Commission Agents',
      currency: '₹',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (inMemoryStore.users.length * 100)}?w=150&auto=format&fit=crop&q=80`,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    inMemoryStore.users.push(newUser);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: true,
      message: `Team member ${newUser.name} created successfully`,
    };
  },
};

