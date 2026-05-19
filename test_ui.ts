const fs = require('fs');

const duaLink = fs.readFileSync('smoke-free-path/components/craving/DuaLink.tsx', 'utf8');

if (
  duaLink.includes('<Typography') &&
  duaLink.includes('accessibilityRole="button"') &&
  duaLink.includes('accessibilityLabel="দোয়া সেকশনে যান"') &&
  duaLink.includes('<Animated.View style={animatedStyle}>')
) {
  console.log('✅ DuaLink.tsx successfully updated!');
} else {
  console.error('❌ Missing expected components in DuaLink.tsx.');
  process.exit(1);
}
