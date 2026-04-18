import re

with open('smoke-free-path/components/WeeklyTriggerChart.tsx', 'r') as f:
    content = f.read()

content = content.replace("export default function WeeklyTriggerChart() {", "export default function WeeklyTriggerChart() {\n  return null;\n}\n/*\nexport default function WeeklyTriggerChart() {") + "\n*/"

with open('smoke-free-path/components/WeeklyTriggerChart.tsx', 'w') as f:
    f.write(content)
