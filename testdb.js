const { Pool } = require('pg');
const pool = new Pool({
  host: 'ep-rough-voice-aigore1a-pooler.c-4.us-east-1.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_PF4VGoaJ6TLe',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 30000
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Erreur:', err);
  else console.log('Connecté!', res.rows[0]);
  pool.end();
});