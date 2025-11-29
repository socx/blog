/**
 * Add 'featured' boolean flag to posts for home/featured listing
 */
exports.up = async function(knex) {
  await knex.schema.table('posts', (t) => {
    t.boolean('featured').notNullable().defaultTo(false);
  });
};

exports.down = async function(knex) {
  await knex.schema.table('posts', (t) => {
    t.dropColumn('featured');
  });
};
