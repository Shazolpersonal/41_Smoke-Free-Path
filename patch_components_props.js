const fs = require('fs');

// Patch StepCard.tsx to pass dayNumber instead of relying on the old MilestoneStarburst component
let step = fs.readFileSync('smoke-free-path/components/StepCard.tsx', 'utf8');
step = step.replace(/<MilestoneStarburst size=\{20\} \/>/, '<MilestoneStarburst size={20} dayNumber={step} backgroundColor="transparent" />');
fs.writeFileSync('smoke-free-path/components/StepCard.tsx', step);

// Patch MilestoneList.tsx to pass dayNumber instead of relying on the old MilestoneStarburst component
let list = fs.readFileSync('smoke-free-path/components/MilestoneList.tsx', 'utf8');
list = list.replace(/<MilestoneStarburst[\s\S]*?size=\{32\}[\s\S]*?color=\{starColor\}[\s\S]*?hasGlow=\{isAchieved\}[\s\S]*?\/>/, '<MilestoneStarburst size={32} color={starColor} dayNumber={steps} />');
fs.writeFileSync('smoke-free-path/components/MilestoneList.tsx', list);
