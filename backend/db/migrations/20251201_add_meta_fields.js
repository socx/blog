/**
 * Add per-post meta fields for SEO and social sharing
 */
exports.up = async function(knex) {
  await knex.schema.table('posts', (t) => {
    t.string('meta_title', 1024).nullable();
    t.text('meta_description').nullable();
    t.string('meta_image_url', 2048).nullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.table('posts', (t) => {
    t.dropColumn('meta_title');
    t.dropColumn('meta_description');
    t.dropColumn('meta_image_url');
  });
};
