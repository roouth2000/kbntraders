import { inMemoryStore } from './seedService.js';

export const reportService = {
  async getDashboardReports() {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Sales Calculations
    let dailySales = 0;
    let yesterdaySales = 0;
    let totalSales = 0;

    inMemoryStore.invoices.forEach((inv) => {
      const invTotal = Number(inv.total) || 0;
      totalSales += invTotal;
      if (inv.date === today) dailySales += invTotal;
      if (inv.date === yesterdayDate) yesterdaySales += invTotal;
    });

    // Collection Calculations
    let dailyCollections = 0;
    let totalCollections = 0;
    const collectionsByMode = {
      Cash: 0,
      UPI: 0,
      'Bank Transfer': 0,
      Cheque: 0,
    };

    inMemoryStore.payments.forEach((p) => {
      const amt = Number(p.amount) || 0;
      totalCollections += amt;
      if (p.payment_date === today) dailyCollections += amt;

      const mode = p.payment_mode || 'Cash';
      if (collectionsByMode[mode] !== undefined) {
        collectionsByMode[mode] += amt;
      } else {
        collectionsByMode[mode] = amt;
      }
    });

    // Customer Dues & Advances
    let totalCustomerDues = 0;
    let totalCustomerAdvances = 0;

    inMemoryStore.customers.forEach((c) => {
      const bal = Number(c.current_balance) || 0;
      if (bal > 0) totalCustomerDues += bal;
      else if (bal < 0) totalCustomerAdvances += Math.abs(bal);
    });

    // Variety Sales Breakdown
    const varietyMap = {};
    inMemoryStore.invoices.forEach((inv) => {
      if (Array.isArray(inv.items)) {
        inv.items.forEach((item) => {
          const varName = item.varietyName || item.variety || 'Standard Mandi Grade';
          if (!varietyMap[varName]) {
            varietyMap[varName] = {
              variety: varName,
              boxes: 0,
              weight: 0,
              amount: 0,
            };
          }
          varietyMap[varName].boxes += Number(item.boxes) || 0;
          varietyMap[varName].weight += Number(item.weight) || 0;
          varietyMap[varName].amount += Number(item.total) || 0;
        });
      }
    });

    const varietySales = Object.values(varietyMap);

    return {
      dailySales,
      yesterdaySales,
      totalSales,
      dailyCollections,
      totalCollections,
      collectionsByMode,
      totalCustomerDues,
      totalCustomerAdvances,
      varietySales,
      activeCustomerCount: inMemoryStore.customers.length,
      invoiceCount: inMemoryStore.invoices.length,
      paymentCount: inMemoryStore.payments.length,
    };
  },

  async getVarietySalesReport({ startDate, endDate } = {}) {
    let relevantInvoices = [...inMemoryStore.invoices];
    if (startDate) relevantInvoices = relevantInvoices.filter((i) => i.date >= startDate);
    if (endDate) relevantInvoices = relevantInvoices.filter((i) => i.date <= endDate);

    const varietyStats = {};
    relevantInvoices.forEach((inv) => {
      if (Array.isArray(inv.items)) {
        inv.items.forEach((item) => {
          const key = item.varietyId || item.varietyName || 'Other';
          if (!varietyStats[key]) {
            varietyStats[key] = {
              varietyId: item.varietyId,
              name: item.varietyName || key,
              totalBoxes: 0,
              totalWeight: 0,
              totalRevenue: 0,
            };
          }
          varietyStats[key].totalBoxes += Number(item.boxes) || 0;
          varietyStats[key].totalWeight += Number(item.weight) || 0;
          varietyStats[key].totalRevenue += Number(item.total) || 0;
        });
      }
    });

    return Object.values(varietyStats);
  },
};

