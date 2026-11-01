import { DataTypes } from 'sequelize';

export function defineLedgerEntryModel(sequelize) {
  if (!sequelize) return null;

  return sequelize.define('LedgerEntry', {
    id: {
      type: DataTypes.STRING(64),
      primaryKey: true,
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
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ref_type: {
      type: DataTypes.ENUM('invoice', 'payment', 'opening_balance', 'adjustment'),
      allowNull: false,
    },
    ref_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    debit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Billed amount (Customer owes)',
    },
    credit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Paid amount (Customer cleared)',
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      comment: 'Running balance after this entry',
    },
  }, {
    tableName: 'ledger_entries',
    indexes: [
      { fields: ['customer_id', 'date'] },
      { fields: ['ref_type', 'ref_id'] },
    ],
  });
}

