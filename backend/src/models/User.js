import { DataTypes } from 'sequelize';

export function defineUserModel(sequelize) {
  if (!sequelize) return null;

  return sequelize.define('User', {
    id: {
      type: DataTypes.STRING(64),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'user', 'viewer'),
      defaultValue: 'user',
    },
    company_name: {
      type: DataTypes.STRING(191),
      defaultValue: 'KBN Traders Fruit Commission Agents',
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: '₹',
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reset_token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'users',
    indexes: [
      { unique: true, fields: ['email'] },
    ],
  });
}

