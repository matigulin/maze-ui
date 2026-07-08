import type { Sequelize } from 'sequelize';
import { initCatalogModels } from './catalog.js';
import { initContentModels } from './content.js';
import { initOrderModels } from './order.js';
import { initReferenceModels } from './reference.js';
import { initUserModels } from './user.js';

export function initModels(sequelize: Sequelize) {
  initReferenceModels(sequelize);
  initCatalogModels(sequelize);
  initContentModels(sequelize);
  initUserModels(sequelize);
  initOrderModels(sequelize);
}

export * from './catalog.js';
export * from './content.js';
export * from './order.js';
export * from './reference.js';
export * from './user.js';
