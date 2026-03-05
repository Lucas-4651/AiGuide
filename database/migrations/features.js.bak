const db = require('../../src/config/database');

async function run() {
  // Favoris
  await db.schema.createTableIfNotExists('favorites', t => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('ai_id').notNullable().references('id').inTable('ai_tools').onDelete('CASCADE');
    t.timestamp('created_at').defaultTo(db.fn.now());
    t.unique(['user_id', 'ai_id']);
  });

  // Défis du jour
  await db.schema.createTableIfNotExists('daily_challenges', t => {
    t.increments('id').primary();
    t.string('date').notNullable().unique(); // YYYY-MM-DD
    t.string('type').defaultTo('flashcard'); // flashcard | tip | prompt
    t.integer('ref_id').notNullable();       // id de la flashcard ou tip
    t.text('challenge_text');                // consigne du défi
    t.boolean('is_active').defaultTo(true);
    t.timestamp('created_at').defaultTo(db.fn.now());
  });

  // Completions des défis
  await db.schema.createTableIfNotExists('challenge_completions', t => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('date').notNullable();
    t.integer('challenge_id').references('id').inTable('daily_challenges').onDelete('SET NULL');
    t.timestamp('completed_at').defaultTo(db.fn.now());
    t.unique(['user_id', 'date']);
  });

  // Progression roadmap par user
  await db.schema.createTableIfNotExists('roadmap_progress', t => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('roadmap_id').notNullable().references('id').inTable('roadmaps').onDelete('CASCADE');
    t.text('completed_steps').defaultTo('[]'); // JSON array d'index
    t.timestamp('updated_at').defaultTo(db.fn.now());
    t.unique(['user_id', 'roadmap_id']);
  });

  // Ajouter colonne streak sur users si absent
  const hasStreak = await db.schema.hasColumn('users', 'streak');
  if (!hasStreak) {
    await db.schema.table('users', t => {
      t.integer('streak').defaultTo(0);
      t.string('streak_last_date');
      t.integer('premium_credits').defaultTo(0);
      t.boolean('is_premium').defaultTo(false);
    });
  }

  console.log('✓ Tables features créées');
  await db.destroy();
}
run().catch(e => { console.error(e.message); process.exit(1); });
