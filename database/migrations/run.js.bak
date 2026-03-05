// ============================================================
//  database/migrations/run.js
//  Lance avec : npm run migrate
// ============================================================
const db = require('../../src/config/database');

async function run() {
  console.log('Lancement des migrations...');

  await db.schema.createTableIfNotExists('users', (t) => {
    t.increments('id').primary();
    t.string('email').notNullable().unique();
    t.string('username').notNullable();
    t.string('password_hash');
    t.string('oauth_provider');
    t.string('oauth_id');
    t.enu('role', ['user', 'admin']).defaultTo('user');
    t.string('avatar_url');
    t.text('bio');
    t.boolean('is_active').defaultTo(true);
    t.integer('daily_prompt_count').defaultTo(0);
    t.string('daily_prompt_date');
    t.string('last_login_at');
    t.timestamp('created_at').defaultTo(db.fn.now());
  });
  console.log('  [OK] Table users');

  await db.schema.createTableIfNotExists('ai_tools', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('slug').notNullable().unique();
    t.text('description').notNullable();
    t.string('short_description');
    t.string('type').notNullable();
    t.string('provider');
    t.string('website_url');
    t.string('pricing_type').defaultTo('freemium');
    t.string('price_info');
    t.text('strengths');    // JSON array
    t.text('limitations'); // JSON array
    t.text('use_cases');   // JSON array
    t.text('tags');        // JSON array
    t.string('logo_url');
    t.string('difficulty_level').defaultTo('beginner');
    t.boolean('is_featured').defaultTo(false);
    t.boolean('is_active').defaultTo(true);
    t.integer('view_count').defaultTo(0);
    t.timestamp('created_at').defaultTo(db.fn.now());
    t.timestamp('updated_at').defaultTo(db.fn.now());
  });
  console.log('  [OK] Table ai_tools');

  await db.schema.createTableIfNotExists('prompts', (t) => {
    t.increments('id').primary();
    t.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
    t.text('intention').notNullable();
    t.string('target_ai');
    t.text('generated_prompt').notNullable();
    t.string('model_used');
    t.integer('rating');
    t.boolean('is_public').defaultTo(false);
    t.string('guest_ip');
    t.timestamp('created_at').defaultTo(db.fn.now());
  });
  console.log('  [OK] Table prompts');

  await db.schema.createTableIfNotExists('flash_cards', (t) => {
    t.increments('id').primary();
    t.string('term').notNullable();
    t.text('definition').notNullable();
    t.string('category').defaultTo('general');
    t.integer('difficulty').defaultTo(1);
    t.text('example');
    t.integer('order_index').defaultTo(0);
    t.boolean('is_active').defaultTo(true);
    t.timestamp('created_at').defaultTo(db.fn.now());
  });
  console.log('  [OK] Table flash_cards');

  await db.schema.createTableIfNotExists('roadmaps', (t) => {
    t.increments('id').primary();
    t.string('title').notNullable();
    t.text('description');
    t.string('level').defaultTo('beginner');
    t.string('target_profile');
    t.string('estimated_duration');
    t.text('steps'); // JSON array d'etapes
    t.boolean('is_active').defaultTo(true);
    t.timestamp('created_at').defaultTo(db.fn.now());
  });
  console.log('  [OK] Table roadmaps');

  await db.schema.createTableIfNotExists('tips', (t) => {
    t.increments('id').primary();
    t.string('title').notNullable();
    t.text('content').notNullable();
    t.string('category').defaultTo('general');
    t.string('difficulty').defaultTo('beginner');
    t.text('tags');
    t.integer('order_index').defaultTo(0);
    t.boolean('is_active').defaultTo(true);
    t.timestamp('created_at').defaultTo(db.fn.now());
  });
  console.log('  [OK] Table tips');

  await db.schema.createTableIfNotExists('activity_logs', (t) => {
    t.increments('id').primary();
    t.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('action').notNullable();
    t.string('resource_type');
    t.string('resource_id');
    t.string('ip_address');
    t.string('user_agent');
    t.text('metadata');
    t.timestamp('created_at').defaultTo(db.fn.now());
  });
  console.log('  [OK] Table activity_logs');

  await db.schema.createTableIfNotExists('site_settings', (t) => {
    t.increments('id').primary();
    t.string('key').notNullable().unique();
    t.text('value');
    t.string('description');
    t.timestamp('updated_at').defaultTo(db.fn.now());
  });
  console.log('  [OK] Table site_settings');

  console.log('\nMigrations terminees avec succes !');
  await db.destroy();
}

run().catch((e) => { console.error('Erreur migration:', e.message); process.exit(1); });


