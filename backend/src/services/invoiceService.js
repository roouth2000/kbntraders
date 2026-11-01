import { inMemoryStore } from './seedService.js';
import { slugify, generateUniqueSlug } from '../utils/slug.js';

export const invoiceService = {
  async getInvoices({ customer_id, status, startDate, endDate, search } = {}) {
    let list = [...inMemoryStore.invoices];

    if (customer_id) {
      list = list.filter((i) => i.customer_id === customer_id);
    }

    if (status && status !== 'All') {
      list = list.filter((i) => i.status.toLowerCase() === status.toLowerCase());
    }

    if (startDate) {
      list = list.filter((i) => i.date >= startDate);
    }

    if (endDate) {
      list = list.filter((i) => i.date <= endDate);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.invoice_number.toLowerCase().includes(q) ||
          i.customer_name.toLowerCase().includes(q) ||
          (i.slug && i.slug.includes(q))
      );
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
  },

  async getInvoiceByIdOrSlug(identifier) {
    const invoice = inMemoryStore.invoices.find(
      (i) => i.id === identifier || i.slug === identifier || i.invoice_number === identifier
    );
    if (!invoice) {
      throw new Error(`Invoice '${identifier}' not found`);
    }
    return invoice;
  },

  async createInvoice(data) {
    const {
      invoiceNumber,
      invoice_number,
      customerId,
      customer_id,
      customerName,
      customer_name,
      date,
      items = [],
      subtotal = 0,
      laborCharges = 0,
      labor_charges = 0,
      commissionRate = 0,
      commission_rate = 0,
      commissionAmount = 0,
      commission_amount = 0,
      marketCess = 0,
      market_cess = 0,
      total,
      paidAmount = 0,
      paid_amount = 0,
      notes,
    } = data;

    const assignedNumber = invoiceNumber || invoice_number || `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const finalCustomerId = customerId || customer_id;
    let finalCustomerName = customerName || customer_name;

    // Resolve customer if ID provided
    let customer = null;
    if (finalCustomerId) {
      customer = inMemoryStore.customers.find((c) => c.id === finalCustomerId);
      if (customer && !finalCustomerName) {
        finalCustomerName = customer.name;
      }
    }

    if (!finalCustomerName) {
      finalCustomerName = 'Walk-in Mandi Buyer';
    }

    const uniqueSlug = await generateUniqueSlug(assignedNumber, async (candidate) => {
      return inMemoryStore.invoices.some((i) => i.slug === candidate);
    });

    const parsedSubtotal = Number(subtotal) || 0;
    const parsedLabor = Number(laborCharges || labor_charges) || 0;
    const parsedCommRate = Number(commissionRate || commission_rate) || 0;
    const parsedCommAmt = Number(commissionAmount || commission_amount) || 0;
    const parsedCess = Number(marketCess || market_cess) || 0;
    const parsedTotal = Number(total) || (parsedSubtotal + parsedLabor + parsedCommAmt + parsedCess);
    const parsedPaid = Number(paidAmount || paid_amount) || 0;
    const balanceDue = Math.max(0, parsedTotal - parsedPaid);

    let status = 'Unpaid';
    if (parsedPaid >= parsedTotal) {
      status = 'Paid';
    } else if (parsedPaid > 0) {
      status = 'Partial';
    }

    const newInvoice = {
      id: `inv-${Date.now()}`,
      slug: uniqueSlug,
      invoice_number: assignedNumber,
      customer_id: finalCustomerId || `cust-walkin-${Date.now()}`,
      customer_name: finalCustomerName,
      date: date || new Date().toISOString().split('T')[0],
      items,
      subtotal: parsedSubtotal,
      labor_charges: parsedLabor,
      commission_rate: parsedCommRate,
      commission_amount: parsedCommAmt,
      market_cess: parsedCess,
      total: parsedTotal,
      paid_amount: parsedPaid,
      balance_due: balanceDue,
      status,
      notes: notes || null,
      created_at: new Date().toISOString(),
    };

    inMemoryStore.invoices.unshift(newInvoice);

    // Update customer balances if customer exists
    if (customer) {
      customer.total_billed = (Number(customer.total_billed) || 0) + parsedTotal;
      customer.total_paid = (Number(customer.total_paid) || 0) + parsedPaid;
      customer.current_balance = (Number(customer.current_balance) || 0) + balanceDue;
    }

    // Record Debit in Customer Ledger
    const prevBalance = customer ? customer.current_balance : parsedTotal;
    inMemoryStore.ledgerEntries.push({
      id: `ledg-${Date.now()}`,
      customer_id: newInvoice.customer_id,
      customer_name: newInvoice.customer_name,
      date: newInvoice.date,
      description: `Produce Invoice #${newInvoice.invoice_number}`,
      ref_type: 'invoice',
      ref_id: newInvoice.id,
      debit: parsedTotal,
      credit: 0,
      balance: prevBalance,
      created_at: new Date().toISOString(),
    });

    // If an initial payment was received with the bill, record credit ledger entry
    if (parsedPaid > 0) {
      inMemoryStore.ledgerEntries.push({
        id: `ledg-pay-${Date.now()}`,
        customer_id: newInvoice.customer_id,
        customer_name: newInvoice.customer_name,
        date: newInvoice.date,
        description: `Payment received at billing for #${newInvoice.invoice_number}`,
        ref_type: 'payment',
        ref_id: newInvoice.id,
        debit: 0,
        credit: parsedPaid,
        balance: prevBalance - parsedPaid,
        created_at: new Date().toISOString(),
      });
    }

    return newInvoice;
  },

  async updateInvoiceStatus(identifier, status) {
    const invoice = await this.getInvoiceByIdOrSlug(identifier);
    invoice.status = status;
    return invoice;
  },
};

