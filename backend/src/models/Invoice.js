import { DataTypes } from 'sequelize';
import { slugify } from '../utils/slug.js';

export function defineInvoiceModel(sequelize) {
  if (!sequelize) return null;

  return sequelize.define('Invoice', {
    id: {
      type: DataTypes.STRING(64),
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      comment: 'REST-friendly invoice reference slug',
    },
    invoice_number: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    customer_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    customer_name: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Line items array: variety, boxes, weight, rate, unit, total',
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
    },
    labor_charges: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
    },
    commission_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    market_cess: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
    },
    balance_due: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
    },
    status: {
      type: DataTypes.ENUM('Paid', 'Partial', 'Unpaid', 'Overdue', 'Cancelled'),
      defaultValue: 'Unpaid',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'invoices',
    indexes: [
      { unique: true, fields: ['slug'] },
      { unique: true, fields: ['invoice_number'] },
      { fields: ['customer_id'] },
      { fields: ['date'] },
      { fields: ['status'] },
    ],
    hooks: {
      beforeValidate: (inv) => {
        if (!inv.slug && inv.invoice_number) {
          inv.slug = slugify(inv.invoice_number);
        }
      },
    },
  });
}

