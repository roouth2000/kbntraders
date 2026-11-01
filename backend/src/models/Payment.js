import { DataTypes } from 'sequelize';
import { slugify } from '../utils/slug.js';

export function definePaymentModel(sequelize) {
  if (!sequelize) return null;

  return sequelize.define('Payment', {
    id: {
      type: DataTypes.STRING(64),
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      comment: 'REST-friendly payment voucher slug',
    },
    payment_number: {
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
    invoice_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    payment_mode: {
      type: DataTypes.ENUM('Cash', 'UPI', 'Bank Transfer', 'Cheque'),
      defaultValue: 'Cash',
    },
    transaction_ref: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'payments',
    indexes: [
      { unique: true, fields: ['slug'] },
      { unique: true, fields: ['payment_number'] },
      { fields: ['customer_id'] },
      { fields: ['payment_date'] },
      { fields: ['payment_mode'] },
    ],
    hooks: {
      beforeValidate: (p) => {
        if (!p.slug && p.payment_number) {
          p.slug = slugify(p.payment_number);
        }
      },
    },
  });
}

