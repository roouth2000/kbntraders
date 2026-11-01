import { DataTypes } from 'sequelize';
import { slugify } from '../utils/slug.js';

export function defineCustomerModel(sequelize) {
  if (!sequelize) return null;

  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.STRING(64),
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      comment: 'SEO and REST-friendly unique URL identifier',
    },
    name: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    opening_balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
    },
    current_balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
    },
    total_billed: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
    },
    total_paid: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'customers',
    indexes: [
      { unique: true, fields: ['slug'] },
      { fields: ['name'] },
      { fields: ['phone'] },
    ],
    hooks: {
      beforeValidate: (customer) => {
        if (!customer.slug && customer.name) {
          customer.slug = slugify(customer.name);
        }
      },
    },
  });

  return Customer;
}

