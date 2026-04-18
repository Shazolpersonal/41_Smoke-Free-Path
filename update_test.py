with open('smoke-free-path/__tests__/property/uiDeepAnalysis.property.test.ts', 'r') as f:
    content = f.read()

content = content.replace("fc.float({ min: 0, max: 1 })", "fc.float({ min: 0, max: 1, noNaN: true })")

with open('smoke-free-path/__tests__/property/uiDeepAnalysis.property.test.ts', 'w') as f:
    f.write(content)
