const fs = require('fs');

function removeIfExists(filePath) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    // ignore cleanup errors
  }
}

function removeFiles(paths) {
  if (!Array.isArray(paths)) return;
  for (const p of paths) removeIfExists(p);
}

module.exports = { removeIfExists, removeFiles };
