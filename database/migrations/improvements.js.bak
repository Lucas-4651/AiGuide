const db = require('../../src/config/database');
async function run() {
  // Collections de prompts
  await db.schema.createTableIfNotExists('collections', t => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('name').notNullable();
    t.text('description');
    t.boolean('is_public').defaultTo(false);
    t.timestamp('created_at').defaultTo(db.fn.now());
  });
  await db.schema.createTableIfNotExists('collection_prompts', t => {
    t.increments('id').primary();
    t.integer('collection_id').notNullable().references('id').inTable('collections').onDelete('CASCADE');
    t.integer('prompt_id').notNullable().references('id').inTable('prompts').onDelete('CASCADE');
    t.timestamp('added_at').defaultTo(db.fn.now());
    t.unique(['collection_id','prompt_id']);
  });
  // Avis sur les IAs
  await db.schema.createTableIfNotExists('ai_reviews', t => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('ai_id').notNullable().references('id').inTable('ai_tools').onDelete('CASCADE');
    t.integer('rating').notNullable(); // 1-5
    t.text('comment');
    t.timestamp('created_at').defaultTo(db.fn.now());
    t.unique(['user_id','ai_id']);
  });
  // Badges
  await db.schema.createTableIfNotExists('user_badges', t => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('badge_key').notNullable();
    t.timestamp('earned_at').defaultTo(db.fn.now());
    t.unique(['user_id','badge_key']);
  });
  // Credits (freemium)
  const hasCred = await db.schema.hasColumn('users','credits');
  if (!hasCred) {
    await db.schema.table('users', t => {
      t.integer('credits').defaultTo(10);
      t.string('plan').defaultTo('free'); // free | premium
    });
  }
  console.log('✓ Tables improvements créées');
  await db.destroy();
}
run().catch(e => { console.error(e.message); process.exit(1); });
