'use strict';

/** @param {import('sequelize').QueryInterface} queryInterface */
async function createEnum(queryInterface, name, values) {
  const list = values.map((v) => `'${v}'`).join(', ');
  await queryInterface.sequelize.query(
    `CREATE TYPE "${name}" AS ENUM (${list});`,
  );
}

/** @param {import('sequelize').QueryInterface} queryInterface */
async function dropEnum(queryInterface, name) {
  await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${name}" CASCADE;`);
}

module.exports = { createEnum, dropEnum };
