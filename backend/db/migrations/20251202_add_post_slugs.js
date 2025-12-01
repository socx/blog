/**
 * Add post_slugs table to keep mapping of previous slugs to post ids
 */
exports.up = async function(knex) {
  await knex.schema.createTable('post_slugs', (t) => {
    t.increments('id').primary();
    t.string('slug', 255).notNullable().unique();
    t.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('post_slugs');
};
