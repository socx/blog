/**
 * Initial schema migration for FaithStories
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('name', 255).notNullable();
    t.string('email', 255).notNullable().unique();
    t.string('password_hash', 255).notNullable();
    t.string('role', 50).notNullable().defaultTo('author');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('media', (t) => {
    t.increments('id').primary();
    t.string('url', 2048).notNullable();
    t.string('mime_type', 100);
    t.integer('width');
    t.integer('height');
    t.string('alt_text', 512);
    t.integer('uploaded_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('posts', (t) => {
    t.increments('id').primary();
    // author_id should be nullable to allow ON DELETE SET NULL behavior
    t.integer('author_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    t.string('title', 1024).notNullable();
    t.string('slug', 255).notNullable().unique();
    t.text('excerpt');
    t.text('content');
    t.integer('featured_media_id').unsigned().references('id').inTable('media').onDelete('SET NULL');
    t.string('status', 50).notNullable().defaultTo('draft');
    t.timestamp('published_at').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('categories', (t) => {
    t.increments('id').primary();
    t.string('name', 255).notNullable();
    t.string('slug', 255).notNullable().unique();
  });

  await knex.schema.createTable('tags', (t) => {
    t.increments('id').primary();
    t.string('name', 255).notNullable();
    t.string('slug', 255).notNullable().unique();
  });

  await knex.schema.createTable('post_categories', (t) => {
    t.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
    t.integer('category_id').unsigned().notNullable().references('id').inTable('categories').onDelete('CASCADE');
    t.primary(['post_id','category_id']);
  });

  await knex.schema.createTable('post_tags', (t) => {
    t.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
    t.integer('tag_id').unsigned().notNullable().references('id').inTable('tags').onDelete('CASCADE');
    t.primary(['post_id','tag_id']);
  });

  await knex.schema.createTable('revisions', (t) => {
    t.increments('id').primary();
    t.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
    t.json('data_json').notNullable();
    t.integer('author_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('settings', (t) => {
    t.string('key', 255).primary();
    t.text('value');
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('revisions');
  await knex.schema.dropTableIfExists('post_tags');
  await knex.schema.dropTableIfExists('post_categories');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('posts');
  await knex.schema.dropTableIfExists('media');
  await knex.schema.dropTableIfExists('users');
};
