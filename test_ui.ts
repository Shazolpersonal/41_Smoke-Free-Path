const fs = require('fs');

const files = [
  'smoke-free-path/app/trigger-log/index.tsx',
  'smoke-free-path/app/(tabs)/library.tsx',
  'smoke-free-path/app/(tabs)/dua.tsx'
];

let allPassed = true;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('keyboardDismissMode="on-drag"') && content.includes('keyboardShouldPersistTaps="handled"')) {
    console.log(`PASS: ${file} contains keyboard dismissal props.`);
  } else {
    console.error(`FAIL: ${file} is missing required props.`);
    allPassed = false;
  }
}

if (!allPassed) {
  process.exit(1);
}
