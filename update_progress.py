import re

with open('smoke-free-path/app/(tabs)/progress.tsx', 'r') as f:
    content = f.read()

# Replace imports
content = re.sub(
    r"import Animated, { \n  FadeInDown, \n  FadeIn, \n  useSharedValue, \n  useAnimatedStyle, \n  withSpring,\n  withTiming\n} from 'react-native-reanimated';",
    "import Animated, { FadeInDown } from 'react-native-reanimated';",
    content
)

# Replace hooks
content = re.sub(
    r"import \{ useWeeklySummary \} from '@\/hooks\/useWeeklySummary';\n",
    "",
    content
)

# Add new component imports
new_imports = """import ProgressCalendar from '@/components/ProgressCalendar';
import HealthTimeline from '@/components/HealthTimeline';
import MilestoneList from '@/components/MilestoneList';
import WeeklyTriggerChart from '@/components/WeeklyTriggerChart';
import ProgressStats from '@/components/ProgressStats';
import ProgressBarCard from '@/components/ProgressBarCard';"""
content = re.sub(
    r"import ProgressCalendar from '@\/components\/ProgressCalendar';\nimport HealthTimeline from '@\/components\/HealthTimeline';\nimport MilestoneList from '@\/components\/MilestoneList';",
    new_imports,
    content
)

# Remove progress width animation logic
content = re.sub(
    r"  const progressWidth = useSharedValue\(0\);\n\n  useEffect\(\(\) => \{\n    progressWidth\.value = withSpring\(progressPercent, \{ damping: 15, stiffness: 100 \}\);\n  \}, \[progressPercent\]\);\n\n  const animatedProgressStyle = useAnimatedStyle\(\(\) => \(\{\n    width: `\$\{progressWidth\.value\}%` as DimensionValue,\n  \}\)\);\n",
    "",
    content
)

# Remove weekly summary hook usage
content = re.sub(
    r"  const weeklySummary = useWeeklySummary\(\);\n",
    "",
    content
)

# Remove weeklyChartData useMemo
content = re.sub(
    r"  const weeklyChartData = useMemo\(\(\) => \{\n    const cutoff = Date\.now\(\) - 7 \* 24 \* 60 \* 60 \* 1000;\n    const recent = triggerLogs\.filter\(\(l\) => new Date\(l\.timestamp\)\.getTime\(\) >= cutoff\);\n    const counts: Partial<Record<TriggerType, number>> = \{\};\n    for \(const log of recent\) \{\n      counts\[log\.type\] = \(counts\[log\.type\] \?\? 0\) \+ 1;\n    \}\n    const max = Math\.max\(1, \.\.\.\(Object\.values\(counts\) as number\[\]\)\);\n    return \(Object\.entries\(counts\) as \[TriggerType, number\]\[\]\)\.map\(\(\[type, count\]\) => \(\{\n      type,\n      count,\n      percent: count \/ max,\n    \}\)\);\n  \}, \[triggerLogs\]\);\n\n\n\n",
    "",
    content
)

# Replace ProgressBarCard
content = re.sub(
    r"          <Card style=\{styles\.progressBarCard\}>\n            <View style=\{styles\.progressBarHeader\}>\n              <Typography variant=\"subheading\" style=\{styles\.boldText\}>\{completedCount\}\/৪১ ধাপ সম্পূর্ণ<\/Typography>\n              <Typography variant=\"subheading\" color=\"primary\" style=\{styles\.boldText\}>\{progressPercent\}%<\/Typography>\n            <\/View>\n            <View\n              style=\[styles\.progressBarTrack, \{ backgroundColor: theme\.colors\.border \}\]\n              accessible=\{true\}\n              accessibilityLabel={`৪১ ধাপের মধ্যে \$\{completedCount\}টি সম্পন্ন, \$\{progressPercent\}%`}\n            >\n              <Animated\.View\n                style=\[styles\.progressBarFill, \{ backgroundColor: theme\.colors\.primary \}, animatedProgressStyle\]\n              \/>\n            <\/View>\n          <\/Card>",
    "          <ProgressBarCard completedCount={completedCount} progressPercent={progressPercent} />",
    content,
    flags=re.DOTALL
)

# Replace Stats
stats_pattern = r"            <View\n              style=\[styles\.statCard, \{ backgroundColor: theme\.colors\.surface \}\]\n              accessible=\{true\}\n              accessibilityLabel={`ধূমপান-মুক্ত দিন: \$\{stats\.smokeFreeDays\}`}\n            >\n              <Typography variant=\"heading\" color=\"primary\">\{stats\.smokeFreeDays\}<\/Typography>\n              <Typography variant=\"small\" color=\"textSecondary\">ধূমপান-মুক্ত দিন<\/Typography>\n            <\/View>\n            <View\n              style=\[styles\.statCard, \{ backgroundColor: theme\.colors\.surface \}\]\n              accessible=\{true\}\n              accessibilityLabel={`বাঁচানো সিগারেট: \$\{stats\.totalSavedCigarettes\}`}\n            >\n              <Typography variant=\"heading\" color=\"primary\">\{stats\.totalSavedCigarettes\}<\/Typography>\n              <Typography variant=\"small\" color=\"textSecondary\">বাঁচানো সিগারেট<\/Typography>\n            <\/View>\n            <View\n              style=\[styles\.statCard, \{ backgroundColor: theme\.colors\.surface \}\]\n              accessible=\{true\}\n              accessibilityLabel={`সাশ্রয়কৃত অর্থ: ৳\$\{Math\.round\(stats\.totalSavedMoney\)\}`}\n            >\n              <Typography variant=\"heading\" color=\"primary\">৳\{Math\.round\(stats\.totalSavedMoney\)\}<\/Typography>\n              <Typography variant=\"small\" color=\"textSecondary\">সাশ্রয়কৃত অর্থ<\/Typography>\n            <\/View>"
content = re.sub(stats_pattern, "            <ProgressStats stats={stats} />", content, flags=re.DOTALL)

# Replace Chart
chart_pattern = r"          <Card style=\{styles\.chartCard\}>\n            \{weeklyChartData.*?<\/Card>"
content = re.sub(chart_pattern, "          <WeeklyTriggerChart />", content, flags=re.DOTALL)

with open('smoke-free-path/app/(tabs)/progress.tsx', 'w') as f:
    f.write(content)
