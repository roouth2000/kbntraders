import { inMemoryStore } from './seedService.js';
import { generateUniqueSlug } from '../utils/slug.js';

export const paymentService = {
  async getPayments({ customer_id, payment_mode, startDate, endDate, search } = {}) {
    let list = [...inMemoryStore.payments];

    if (customer_id) {
      list = list.filter((p) => p.customer_id === customer_id);
    }

    if (payment_mode && payment_mode !== 'All') {
      list = list.filter((p) => p.payment_mode.toLowerCase() === payment_mode.toLowerCase());
    }

    if (startDate) {
      list = list.filter((p) => p.payment_date >= startDate);
    }

    if (endDate) {
      list = list.filter((p) => p.payment_date <= endDate);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.payment_number.toLowerCase().includes(q) ||
          p.customer_name.toLowerCase().includes(q) ||
          (p.transaction_ref && p.transaction_ref.toLowerCase().includes(q)) ||
          (p.slug && p.slug.includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.created_at || b.payment_date).getTime() - new Date(a.created_at || a.payment_date).getTime());
  },

  async getPaymentByIdOrSlug(identifier) {
    const payment = inMemoryStore.payments.find(
      (p) => p.id === identifier || p.slug === identifier || p.payment_number === identifier
    );
    if (!payment) {
      throw new Error(`Payment voucher '${identifier}' not found`);
    }
    return payment;
  },

  async createPayment(data) {
    const {
      customerId,
      customer_id,
      customerName,
      customer_name,
      invoiceId,
      invoice_id,
      amount,
      paymentMode = 'Cash',
      payment_mode,
      transactionRef,
      transaction_ref,
      paymentDate,
      payment_date,
      notes,
    } = data;

    const finalCustomerId = customerId || customer_id;
    if (!finalCustomerId) {
      throw new Error('Customer ID is required to record a payment');
    }

    const customer = inMemoryStore.customers.find((c) => c.id === finalCustomerId);
    const finalCustomerName = customerName || customer_name || (customer ? customer.name : 'Unknown Customer');

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Valid payment amount greater than zero is required');
    }

    const finalPaymentNumber = `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const uniqueSlug = await generateUniqueSlug(finalPaymentNumber, async (candidate) => {
      return inMemoryStore.payments.some((p) => p.slug === candidate);
    });

    const newPayment = {
      id: `pay-${Date.now()}`,
      slug: uniqueSlug,
      payment_number: finalPaymentNumber,
      customer_id: finalCustomerId,
      customer_name: finalCustomerName,
      invoice_id: invoiceId || invoice_id || null,
      amount: parsedAmount,
      payment_mode: payment_mode || paymentMode || 'Cash',
      transaction_ref: transactionRef || transaction_ref || null,
      payment_date: paymentDate || payment_date || new Date().toISOString().split('T')[0],
      notes: notes || null,
      created_at: new Date().toISOString(),
    };

    inMemoryStore.payments.unshift(newPayment);

    // Update Customer balances
    if (customer) {
      customer.total_paid = (Number(customer.total_paid) || 0) + parsedAmount;
      customer.current_balance = (Number(customer.current_balance) || 0) - parsedAmount;
    }

    // If an invoice is referenced, update invoice paid amount & status
    const targetInvoiceId = invoiceId || invoice_id;
    if (targetInvoiceId) {
      const invoice = inMemoryStore.invoices.find((i) => i.id === targetInvoiceId);
      if (invoice) {
        invoice.paid_amount = (Number(invoice.paid_amount) || 0) + parsedAmount;
        invoice.balance_due = Math.max(0, (Number(invoice.total) || 0) - invoice.paid_amount);
        if (invoice.paid_amount >= invoice.total) {
          invoice.status = 'Paid';
        } else if (invoice.paid_amount > 0) {
          invoice.status = 'Partial';
        }
      }
    }

    // Record Credit entry in Customer Ledger
    const currentCustomerBalance = customer ? customer.current_balance : 0;
    inMemoryStore.ledgerEntries.push({
      id: `ledg-${Date.now()}`,
      customer_id: finalCustomerId,
      customer_name: finalCustomerName,
      date: newPayment.payment_date,
      description: `Payment Voucher #${newPayment.payment_number} via ${newPayment.payment_mode}`,
      ref_type: 'payment',
      ref_id: newPayment.id,
      debit: 0,
      credit: parsedAmount,
      balance: currentCustomerBalance,
      created_at: new Date().toISOString(),
    });

    return newPayment;
  },
};

