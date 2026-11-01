/**
 * Professional Slug Generator and Utility
 * Converts text into SEO-friendly, REST-compliant URL slugs with Unicode support,
 * diacritic normalization, and unique slug generation.
 */

/**
 * Generate a clean, URL-safe slug from any string
 * @param {string} text - Input text to slugify
 * @param {object} options - Configuration options
 * @param {number} [options.maxLength=80] - Maximum slug length
 * @param {boolean} [options.lowercase=true] - Transform to lowercase
 * @returns {string} URL-safe slug
 */
export function slugify(text, options = {}) {
  const { maxLength = 80, lowercase = true } = options;

  if (!text || typeof text !== 'string') {
    return '';
  }

  let slug = text
    .normalize('NFKD') // Normalize accented unicode characters (e.g., é -> e)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim();

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  slug = slug
    .replace(/[^a-z0-9\s-_]/gi, '') // Remove all non-alphanumeric except space, dash, underscore
    .replace(/[\s_]+/g, '-') // Replace whitespace and underscores with a single dash
    .replace(/-+/g, '-') // Collapse multiple consecutive dashes
    .replace(/^-+|-+$/g, ''); // Trim leading and trailing dashes

  if (maxLength && slug.length > maxLength) {
    // Truncate at word boundary if possible
    const truncated = slug.substring(0, maxLength);
    const lastDash = truncated.lastIndexOf('-');
    slug = lastDash > 10 ? truncated.substring(0, lastDash) : truncated;
  }

  return slug;
}

/**
 * Generate a unique slug ensuring no collision with existing records
 * @param {string} text - Base text
 * @param {Function} existsCheckFn - Async function returning boolean if slug exists: (slug) => Promise<boolean>
 * @param {object} [options] - Slug options
 * @returns {Promise<string>} Unique slug
 */
export async function generateUniqueSlug(text, existsCheckFn, options = {}) {
  const baseSlug = slugify(text, options) || 'item';
  let candidateSlug = baseSlug;
  let counter = 1;

  while (await existsCheckFn(candidateSlug)) {
    counter += 1;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  return candidateSlug;
}

/**
 * Validate whether a string is a valid slug format
 * @param {string} slug
 * @returns {boolean}
 */
export function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

