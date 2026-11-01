/**
 * Structured Console Logger
 */
export const logger = {
  info(message, meta = '') {
    console.log(`\x1b[36m[INFO]\x1b[0m \x1b[90m${new Date().toISOString()}\x1b[0m: ${message}`, meta ? JSON.stringify(meta) : '');
  },
  success(message, meta = '') {
    console.log(`\x1b[32m[SUCCESS]\x1b[0m \x1b[90m${new Date().toISOString()}\x1b[0m: ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn(message, meta = '') {
    console.warn(`\x1b[33m[WARN]\x1b[0m \x1b[90m${new Date().toISOString()}\x1b[0m: ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error(message, error = null) {
    console.error(`\x1b[31m[ERROR]\x1b[0m \x1b[90m${new Date().toISOString()}\x1b[0m: ${message}`, error || '');
  },
};

