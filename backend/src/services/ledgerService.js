import { inMemoryStore } from './seedService.js';

export const ledgerService = {
  async getCustomerStatement(customerId, { startDate, endDate } = {}) {
    const customer = inMemoryStore.customers.find(
      (c) => c.id === customerId || c.slug === customerId
    );
    if (!customer) {
      throw new Error(`Customer '${customerId}' not found`);
    }

    let entries = inMemoryStore.ledgerEntries.filter((e) => e.customer_id === customer.id);

    if (startDate) {
      entries = entries.filter((e) => e.date >= startDate);
    }
    if (endDate) {
      entries = entries.filter((e) => e.date <= endDate);
    }

    // Sort chronologically
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balances
    let runningBalance = Number(customer.opening_balance) || 0;
    const computedRows = entries.map((entry) => {
      const debit = Number(entry.debit) || 0;
      const credit = Number(entry.credit) || 0;
      runningBalance = runningBalance + debit - credit;

      return {
        id: entry.id,
        date: entry.date,
        description: entry.description,
        refType: entry.ref_type,
        refId: entry.ref_id,
        debit,
        credit,
        balance: runningBalance,
      };
    });

    const totalDebits = computedRows.reduce((sum, r) => sum + r.debit, 0);
    const totalCredits = computedRows.reduce((sum, r) => sum + r.credit, 0);

    return {
      customer: {
        id: customer.id,
        slug: customer.slug,
        name: customer.name,
        phone: customer.phone,
        openingBalance: customer.opening_balance,
        currentBalance: customer.current_balance,
      },
      summary: {
        openingBalance: customer.opening_balance,
        totalDebits,
        totalCredits,
        closingBalance: customer.current_balance,
      },
      rows: computedRows,
    };
  },

  async getLedgerSummary() {
    let totalDues = 0;
    let totalAdvances = 0;

    inMemoryStore.customers.forEach((c) => {
      const bal = Number(c.current_balance) || 0;
      if (bal > 0) {
        totalDues += bal;
      } else if (bal < 0) {
        totalAdvances += Math.abs(bal);
      }
    });

    return {
      totalDues,
      totalAdvances,
      totalCustomers: inMemoryStore.customers.length,
      activeLedgersCount: inMemoryStore.ledgerEntries.length,
    };
  },
};

