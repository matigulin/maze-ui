require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const sslOff = process.env.DATABASE_SSL === 'false' || process.env.DATABASE_SSL === '0';
const sslOn = process.env.DATABASE_SSL === 'true' || process.env.DATABASE_SSL === '1';

const productionSsl =
  sslOff
    ? {}
    : sslOn || process.env.NODE_ENV === 'production'
      ? {
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
        }
      : {};

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    ...productionSsl,
  },
};
