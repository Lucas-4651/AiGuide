// ============================================================
//  src/config/database.js
// ============================================================

const knex = require('knex');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

const db = knex(
  isProd
    ? {
        client: 'pg',
        connection: {
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false
          }
        },
        pool: {
          min: 0,
          max: 10
        }
      }
    : {
        client: 'better-sqlite3',
        connection: {
          filename: path.join(__dirname, '../../database/aiguide.sqlite')
        },
        useNullAsDefault: true
      }
);

db.on('query-error', (err) => {
  console.error("SQL ERROR:", err);
});

module.exports = db;