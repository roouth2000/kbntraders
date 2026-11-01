import { inMemoryStore } from './seedService.js';
import { slugify, generateUniqueSlug } from '../utils/slug.js';

export const customerService = {
  async getCustomers({ search } = {}) {
    let list = [...inMemoryStore.customers];

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.slug && c.slug.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    return list;
  },

  async getCustomerByIdOrSlug(identifier) {
    const customer = inMemoryStore.customers.find(
      (c) => c.id === identifier || c.slug === identifier
    );
    if (!customer) {
      throw new Error(`Customer '${identifier}' not found`);
    }
    return customer;
  },

  async createCustomer(data) {
    const { name, phone, email, address, opening_balance = 0, notes } = data;

    if (!name || !phone) {
      throw new Error('Customer name and phone number are required');
    }

    // Generate unique slug
    const uniqueSlug = await generateUniqueSlug(name, async (candidate) => {
      return inMemoryStore.customers.some((c) => c.slug === candidate);
    });

    const parsedOpening = Number(opening_balance) || 0;

    const newCustomer = {
      id: `cust-${Date.now()}`,
      slug: uniqueSlug,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      address: address ? address.trim() : null,
      opening_balance: parsedOpening,
      current_balance: parsedOpening,
      total_billed: 0,
      total_paid: 0,
      status: 'active',
      notes: notes ? notes.trim() : null,
      created_at: new Date().toISOString(),
    };

    inMemoryStore.customers.push(newCustomer);

    // If opening balance > 0, record initial ledger entry
    if (parsedOpening > 0) {
      inMemoryStore.ledgerEntries.push({
        id: `ledg-${Date.now()}`,
        customer_id: newCustomer.id,
        customer_name: newCustomer.name,
        date: new Date().toISOString().split('T')[0],
        description: 'Opening Balance (Initial Setup)',
        ref_type: 'opening_balance',
        ref_id: null,
        debit: parsedOpening,
        credit: 0,
        balance: parsedOpening,
        created_at: new Date().toISOString(),
      });
    }

    return newCustomer;
  },

  async updateCustomer(identifier, updates) {
    const customer = await this.getCustomerByIdOrSlug(identifier);

    if (updates.name && updates.name.trim() !== customer.name) {
      customer.name = updates.name.trim();
      customer.slug = slugify(customer.name);
    }

    if (updates.phone !== undefined) customer.phone = updates.phone.trim();
    if (updates.email !== undefined) customer.email = updates.email ? updates.email.trim() : null;
    if (updates.address !== undefined) customer.address = updates.address ? updates.address.trim() : null;
    if (updates.notes !== undefined) customer.notes = updates.notes;
    if (updates.status !== undefined) customer.status = updates.status;

    return customer;
  },

  async deleteCustomer(identifier) {
    const customer = await this.getCustomerByIdOrSlug(identifier);
    inMemoryStore.customers = inMemoryStore.customers.filter((c) => c.id !== customer.id);
    return { id: customer.id, message: 'Customer removed successfully' };
  },
};

