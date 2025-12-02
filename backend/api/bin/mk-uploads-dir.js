#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');

try {
  const base = os.tmpdir();
  const dir = fs.mkdtempSync(path.join(base, 'blog-uploads-'));
  // ensure directory exists
  fs.mkdirSync(dir, { recursive: true });
  // print the path so callers can capture it
  console.log(dir);
  process.exit(0);
} catch (err) {
  console.error('Failed to create uploads temp dir:', err && err.message ? err.message : err);
  process.exit(1);
}
