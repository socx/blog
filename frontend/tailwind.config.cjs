const plugin = require('tailwindcss/plugin');

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.slate.700'),
            a: {
              color: theme('colors.lime.500'),
              '&:hover': { color: theme('colors.lime.600') },
            },
            h1: { color: theme('colors.slate.900'), fontWeight: '700', fontSize: theme('fontSize.3xl')[0] },
            h2: { color: theme('colors.slate.900'), fontWeight: '600', fontSize: theme('fontSize.2xl')[0] },
            h3: { color: theme('colors.slate.900') },
            strong: { color: theme('colors.slate.900') },
            code: {
              color: theme('colors.lime.500'),
              backgroundColor: theme('colors.slate.100'),
              padding: '0.15rem 0.3rem',
              borderRadius: theme('borderRadius.sm'),
            },
            'blockquote p': { color: theme('colors.slate.600') },
            // NOTE: responsive heading sizes are emitted via a small plugin below as
            // top-level @media rules so they don't end up nested inside the
            // `.prose` rule (which triggered CSS minifier/nesting warnings).
          },
        },
        sm: {
          css: {
            h1: { fontSize: theme('fontSize.2xl')[0] },
            h2: { fontSize: theme('fontSize.xl')[0] },
          },
        },
        dark: {
          css: {
            color: theme('colors.slate.300'),
            a: {
              color: theme('colors.lime.500'),
              '&:hover': { color: theme('colors.lime.400') },
            },
            h1: { color: theme('colors.slate.100') },
            h2: { color: theme('colors.slate.100') },
            h3: { color: theme('colors.slate.100') },
            strong: { color: theme('colors.slate.100') },
            code: {
              color: theme('colors.lime.400'),
              backgroundColor: theme('colors.slate.800'),
              padding: '0.15rem 0.3rem',
              borderRadius: theme('borderRadius.sm'),
            },
            'blockquote p': { color: theme('colors.slate.400') },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // small plugin to emit top-level media rules for responsive prose headings
    plugin(function ({ addBase, theme }) {
      addBase({
        [ `@media (min-width: ${theme('screens.md')})` ]: {
          '.prose h1': { fontSize: theme('fontSize.4xl')[0] },
          '.prose h2': { fontSize: theme('fontSize.3xl')[0] },
        },
        [ `@media (min-width: ${theme('screens.lg')})` ]: {
          '.prose h1': { fontSize: theme('fontSize.5xl')[0] },
          '.prose h2': { fontSize: theme('fontSize.4xl')[0] },
        },
      });
    }),
  ],
};
