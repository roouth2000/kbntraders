import { sequelize } from '../config/database.js';
import { defineUserModel } from './User.js';
import { defineCustomerModel } from './Customer.js';
import { defineVarietyModel } from './Variety.js';
import { defineInvoiceModel } from './Invoice.js';
import { definePaymentModel } from './Payment.js';
import { defineLedgerEntryModel } from './LedgerEntry.js';
import { logger } from '../utils/logger.js';

let User = null;
let Customer = null;
let Variety = null;
let Invoice = null;
let Payment = null;
let LedgerEntry = null;

if (sequelize) {
  User = defineUserModel(sequelize);
  Customer = defineCustomerModel(sequelize);
  Variety = defineVarietyModel(sequelize);
  Invoice = defineInvoiceModel(sequelize);
  Payment = definePaymentModel(sequelize);
  LedgerEntry = defineLedgerEntryModel(sequelize);

  // Define Associations
  if (Customer && Invoice) {
    Customer.hasMany(Invoice, { foreignKey: 'customer_id', as: 'invoices' });
    Invoice.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  }

  if (Customer && Payment) {
    Customer.hasMany(Payment, { foreignKey: 'customer_id', as: 'payments' });
    Payment.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  }

  if (Customer && LedgerEntry) {
    Customer.hasMany(LedgerEntry, { foreignKey: 'customer_id', as: 'ledgerEntries' });
    LedgerEntry.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  }
}

export {
  User,
  Customer,
  Variety,
  Invoice,
  Payment,
  LedgerEntry,
};

/**
 * Synchronize database schemas and indexes
 */
export async function syncDatabase(force = false) {
  if (!sequelize) return false;
  try {
    await sequelize.sync({ alter: !force, force });
    logger.success('Sequelize models synchronized successfully.');
    return true;
  } catch (err) {
    logger.warn('Sequelize sync warning:', err.message);
    return false;
  }
}

