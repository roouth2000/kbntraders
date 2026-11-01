import { inMemoryStore } from './seedService.js';
import { slugify, generateUniqueSlug } from '../utils/slug.js';

export const varietyService = {
  async getVarieties() {
    return inMemoryStore.varieties;
  },

  async getVarietyByIdOrSlug(identifier) {
    const variety = inMemoryStore.varieties.find(
      (v) => v.id === identifier || v.slug === identifier || v.code === identifier
    );
    if (!variety) {
      throw new Error(`Variety '${identifier}' not found`);
    }
    return variety;
  },

  async createVariety(data) {
    const {
      fruit = 'Apple',
      name,
      code,
      origin = 'Kashmir',
      size_count = 'Medium',
      default_unit = 'Box',
      default_rate_kg = 0,
      default_rate_box = 0,
    } = data;

    if (!name) {
      throw new Error('Variety name is required');
    }

    const assignedCode = code ? code.trim().toUpperCase() : `VAR-${Date.now().toString().slice(-4)}`;

    const rawSlug = `${fruit}-${name}-${size_count}`;
    const uniqueSlug = await generateUniqueSlug(rawSlug, async (candidate) => {
      return inMemoryStore.varieties.some((v) => v.slug === candidate);
    });

    const newVariety = {
      id: `var-${Date.now()}`,
      slug: uniqueSlug,
      code: assignedCode,
      name: name.trim(),
      fruit: fruit.trim(),
      origin: origin.trim(),
      size_count: size_count.trim(),
      default_unit: default_unit === 'Kg' ? 'Kg' : 'Box',
      default_rate_kg: Number(default_rate_kg) || 0,
      default_rate_box: Number(default_rate_box) || 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    inMemoryStore.varieties.push(newVariety);
    return newVariety;
  },

  async updateVariety(identifier, updates) {
    const variety = await this.getVarietyByIdOrSlug(identifier);

    if (updates.name !== undefined) variety.name = updates.name.trim();
    if (updates.fruit !== undefined) variety.fruit = updates.fruit.trim();
    if (updates.origin !== undefined) variety.origin = updates.origin.trim();
    if (updates.size_count !== undefined) variety.size_count = updates.size_count.trim();
    if (updates.default_unit !== undefined) variety.default_unit = updates.default_unit;
    if (updates.default_rate_kg !== undefined) variety.default_rate_kg = Number(updates.default_rate_kg);
    if (updates.default_rate_box !== undefined) variety.default_rate_box = Number(updates.default_rate_box);
    if (updates.is_active !== undefined) variety.is_active = Boolean(updates.is_active);

    variety.slug = slugify(`${variety.fruit}-${variety.name}-${variety.size_count}`);
    return variety;
  },

  async deleteVariety(identifier) {
    const variety = await this.getVarietyByIdOrSlug(identifier);
    inMemoryStore.varieties = inMemoryStore.varieties.filter((v) => v.id !== variety.id);
    return { id: variety.id, message: 'Variety removed successfully' };
  },
};

