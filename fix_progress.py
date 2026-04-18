import re

with open('smoke-free-path/app/(tabs)/progress.tsx', 'r') as f:
    content = f.read()

# Replace Animated.View containing stats
stats_pattern = r"          <Animated\.View entering=\{FadeInDown\.delay\(200\)\.duration\(600\)\.springify\(\)\} style=\{styles\.statsRow\}>.*?<\/Animated\.View>"
content = re.sub(stats_pattern, "          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>\n            <ProgressStats stats={stats} />\n          </Animated.View>", content, flags=re.DOTALL)

with open('smoke-free-path/app/(tabs)/progress.tsx', 'w') as f:
    f.write(content)
