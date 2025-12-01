const { defineConfig } = require('vitest/config')

module.exports = defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
    // run only unit tests under src/ to avoid picking up Playwright e2e specs
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
})
