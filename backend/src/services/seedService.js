import bcrypt from 'bcryptjs';
import { slugify } from '../utils/slug.js';

export const inMemoryStore = {
  users: [],
  customers: [],
  varieties: [],
  invoices: [],
  payments: [],
  ledgerEntries: [],
};

export async function initializeSeedData() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Initial Users
  inMemoryStore.users = [
    {
      id: 'usr-admin-01',
      name: 'Vincent Rompies (Admin)',
      email: 'vintwork@gmail.com',
      password_hash: hashedPassword,
      role: 'admin',
      company_name: 'KBN Traders Fruit Commission Agents',
      currency: '₹',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr-demo-02',
      name: 'Mandi Cashier User',
      email: 'user@kbntraders.com',
      password_hash: hashedPassword,
      role: 'user',
      company_name: 'KBN Traders Fruit Commission Agents',
      currency: '₹',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  // 2. Initial Produce Varieties with Professional Slugs
  const rawVarieties = [
    {
      id: 'var-01',
      code: 'APP-KASH-A1',
      name: 'Royal Delicious A1',
      fruit: 'Apple',
      origin: 'Kashmir',
      size_count: '100 Count (A1)',
      default_unit: 'Box',
      default_rate_kg: 110.00,
      default_rate_box: 1850.00,
    },
    {
      id: 'var-02',
      code: 'APP-SHIM-SPL',
      name: 'Shimla Golden SPL',
      fruit: 'Apple',
      origin: 'Himachal',
      size_count: '120 Count (SPL)',
      default_unit: 'Box',
      default_rate_kg: 95.00,
      default_rate_box: 1620.00,
    },
    {
      id: 'var-03',
      code: 'ORG-NAGP-A2',
      name: 'Nagpur Sweet Orange',
      fruit: 'Orange',
      origin: 'Nagpur',
      size_count: 'Medium (A2)',
      default_unit: 'Kg',
      default_rate_kg: 65.00,
      default_rate_box: 950.00,
    },
    {
      id: 'var-04',
      code: 'POM-KAND-A1',
      name: 'Bhagwa Red Ruby',
      fruit: 'Pomegranate',
      origin: 'Solapur',
      size_count: 'Large Grade A',
      default_unit: 'Kg',
      default_rate_kg: 145.00,
      default_rate_box: 2100.00,
    },
  ];

  inMemoryStore.varieties = rawVarieties.map((v) => ({
    ...v,
    slug: slugify(`${v.fruit}-${v.name}-${v.size_count}`),
    is_active: true,
    created_at: new Date().toISOString(),
  }));

  // 3. Initial Customers with Professional Slugs
  const rawCustomers = [
    {
      id: 'cust-101',
      name: 'Tariq Fruit Merchants Delhi',
      phone: '+91 98765 43210',
      email: 'tariq.fruits@gmail.com',
      address: 'Shop 42, Azadpur Mandi, Delhi - 110033',
      opening_balance: 15000.00,
      current_balance: 62500.00,
      total_billed: 185000.00,
      total_paid: 137500.00,
    },
    {
      id: 'cust-102',
      name: 'Al-Madina Traders Bengaluru',
      phone: '+91 98450 11223',
      email: 'almadina.bengaluru@gmail.com',
      address: 'APMC Yard, Yeshwanthpur, Bengaluru - 560022',
      opening_balance: 0.00,
      current_balance: 34200.00,
      total_billed: 124200.00,
      total_paid: 90000.00,
    },
    {
      id: 'cust-103',
      name: 'Green Orchard Retailers Mumbai',
      phone: '+91 91234 56789',
      email: 'greenorchard.mumbai@gmail.com',
      address: 'Gala 18, Vashi Turbhe Market, Navi Mumbai - 400705',
      opening_balance: 5000.00,
      current_balance: 18400.00,
      total_billed: 95400.00,
      total_paid: 82000.00,
    },
    {
      id: 'cust-104',
      name: 'Golden Valley Exports Chennai',
      phone: '+91 94440 98765',
      email: 'goldenvalley.fruits@gmail.com',
      address: 'Koyambedu Wholesale Market, Chennai - 600092',
      opening_balance: 0.00,
      current_balance: 0.00,
      total_billed: 76000.00,
      total_paid: 76000.00,
    },
  ];

  inMemoryStore.customers = rawCustomers.map((c) => ({
    ...c,
    slug: slugify(c.name),
    status: 'active',
    notes: 'Verified Mandi buyer with good payment track record.',
    created_at: new Date().toISOString(),
  }));

  // 4. Sample Invoices with Slugs
  const sampleInvoices = [
    {
      id: 'inv-2026-001',
      invoice_number: 'INV-2026-001',
      customer_id: 'cust-101',
      customer_name: 'Tariq Fruit Merchants Delhi',
      date: '2026-10-28',
      items: [
        {
          varietyId: 'var-01',
          varietyName: 'Royal Delicious A1 (Apple)',
          boxes: 30,
          weight: 600,
          unit: 'Box',
          rate: 1850,
          total: 55500,
        },
        {
          varietyId: 'var-02',
          varietyName: 'Shimla Golden SPL (Apple)',
          boxes: 20,
          weight: 400,
          unit: 'Box',
          rate: 1620,
          total: 32400,
        },
      ],
      subtotal: 87900.00,
      labor_charges: 650.00,
      commission_rate: 4.00,
      commission_amount: 3516.00,
      market_cess: 439.50,
      total: 92505.50,
      paid_amount: 40000.00,
      balance_due: 52505.50,
      status: 'Partial',
      notes: 'Delivered via Truck DL-01-AB-4022',
      created_at: '2026-10-28T10:30:00.000Z',
    },
    {
      id: 'inv-2026-002',
      invoice_number: 'INV-2026-002',
      customer_id: 'cust-102',
      customer_name: 'Al-Madina Traders Bengaluru',
      date: '2026-10-29',
      items: [
        {
          varietyId: 'var-03',
          varietyName: 'Nagpur Sweet Orange',
          boxes: 40,
          weight: 800,
          unit: 'Kg',
          rate: 65,
          total: 52000,
        },
      ],
      subtotal: 52000.00,
      labor_charges: 400.00,
      commission_rate: 4.00,
      commission_amount: 2080.00,
      market_cess: 260.00,
      total: 54740.00,
      paid_amount: 20540.00,
      balance_due: 34200.00,
      status: 'Partial',
      notes: 'Direct consignment from Nagpur grower',
      created_at: '2026-10-29T11:45:00.000Z',
    },
  ];

  inMemoryStore.invoices = sampleInvoices.map((inv) => ({
    ...inv,
    slug: slugify(inv.invoice_number),
  }));

  // 5. Sample Payments
  const samplePayments = [
    {
      id: 'pay-2026-001',
      payment_number: 'PAY-2026-001',
      customer_id: 'cust-101',
      customer_name: 'Tariq Fruit Merchants Delhi',
      invoice_id: 'inv-2026-001',
      amount: 40000.00,
      payment_mode: 'UPI',
      transaction_ref: 'UPI-9823487192',
      payment_date: '2026-10-29',
      notes: 'Received via HDFC QR',
      created_at: '2026-10-29T14:20:00.000Z',
    },
    {
      id: 'pay-2026-002',
      payment_number: 'PAY-2026-002',
      customer_id: 'cust-102',
      customer_name: 'Al-Madina Traders Bengaluru',
      invoice_id: 'inv-2026-002',
      amount: 20540.00,
      payment_mode: 'Bank Transfer',
      transaction_ref: 'NEFT-AXIS-901823',
      payment_date: '2026-10-30',
      notes: 'Direct RTGS settlement',
      created_at: '2026-10-30T16:00:00.000Z',
    },
  ];

  inMemoryStore.payments = samplePayments.map((p) => ({
    ...p,
    slug: slugify(p.payment_number),
  }));

  // 6. Sample Ledger Entries
  inMemoryStore.ledgerEntries = [
    {
      id: 'ledg-001',
      customer_id: 'cust-101',
      customer_name: 'Tariq Fruit Merchants Delhi',
      date: '2026-10-01',
      description: 'Opening Balance (Forward from Last Season)',
      ref_type: 'opening_balance',
      ref_id: null,
      debit: 15000.00,
      credit: 0.00,
      balance: 15000.00,
      created_at: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'ledg-002',
      customer_id: 'cust-101',
      customer_name: 'Tariq Fruit Merchants Delhi',
      date: '2026-10-28',
      description: 'Invoice #INV-2026-001 - Produce Bill',
      ref_type: 'invoice',
      ref_id: 'inv-2026-001',
      debit: 92505.50,
      credit: 0.00,
      balance: 107505.50,
      created_at: '2026-10-28T10:30:00.000Z',
    },
    {
      id: 'ledg-003',
      customer_id: 'cust-101',
      customer_name: 'Tariq Fruit Merchants Delhi',
      date: '2026-10-29',
      description: 'Payment Voucher #PAY-2026-001 via UPI',
      ref_type: 'payment',
      ref_id: 'pay-2026-001',
      debit: 0.00,
      credit: 40000.00,
      balance: 67505.50,
      created_at: '2026-10-29T14:20:00.000Z',
    },
  ];
}

