'use strict';

const crypto = require('crypto');

/** Deterministic UUID v4-style id from a stable string key. */
function seedUuid(key) {
  const hash = crypto.createHash('sha256').update(`maze:${key}`).digest();
  const hex = hash.toString('hex').slice(0, 32);
  const variant = ((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${variant}${hex.slice(18, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}

module.exports = { seedUuid };
