const fs = require('fs');
try {
  const content = fs.readFileSync('smoke-free-path/components/craving/DuaLink.tsx', 'utf8');
  // Check that the file has a default export and imports React
  if (content.includes('export default function DuaLink') && content.includes('import React')) {
    console.log('DuaLink.tsx syntax looks reasonable.');
    process.exit(0);
  }
} catch (e) {
  console.error(e);
  process.exit(1);
}
