const fs = require('fs');

// Fix DuaDecorator
let dua = fs.readFileSync('smoke-free-path/components/illustrations/DuaDecorator.tsx', 'utf8');
dua = dua.replace(/<<<<<<< HEAD[\s\S]*?=======\n/m, '');
dua = dua.replace(/>>>>>>>.*?\n/m, '');
// Re-apply spaces
dua = dua.replace(
  /const leftPath =.*/,
  'const leftPath = `M ${center - 12} ${centerY} C ${center - 40} ${centerY - 10} ${center - 60} ${centerY + 10} ${20} ${centerY}`;'
);
dua = dua.replace(
  /const rightPath =.*/,
  'const rightPath = `M ${center + 12} ${centerY} C ${center + 40} ${centerY - 10} ${center + 60} ${centerY + 10} ${width - 20} ${centerY}`;'
);
fs.writeFileSync('smoke-free-path/components/illustrations/DuaDecorator.tsx', dua);

// Fix MilestoneStarburst. Wait, what's HEAD in this rebase?
// In rebase, HEAD is master.
// So master has the `Path`, `Circle`, `G` version of `MilestoneStarburst` without `dayNumber`!
// And `ee131ae` has the version with `dayNumber` and `Polygon` and `Text`.
// We need to keep the `ee131ae` version since that's what was requested for Session C,
// BUT we also need it to NOT break `MilestoneList` and `StepCard` from master.
