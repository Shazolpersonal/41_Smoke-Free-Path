import re

with open('app/craving/index.tsx', 'r') as f:
    content = f.read()

# 1. Update STRATEGY_TABS
content = content.replace(
    "type StrategyTab = 'breathing' | 'dhikr' | 'dua' | 'activity';",
    "type StrategyTab = 'breathing' | 'dhikr' | 'dua' | 'activity' | 'grounding';"
)

content = content.replace(
    "{ key: 'activity', label: 'বিকল্প কার্যকলাপ' },\n];",
    "{ key: 'activity', label: 'বিকল্প কার্যকলাপ' },\n  { key: 'grounding', label: 'গ্রাউন্ডিং' },\n];"
)

# 2. Replace BreathingGuide and DhikrGuide
breathing_old = """function BreathingGuide({ theme }: { theme: Theme }) {
  return (
    <View style={styles.strategyContent}>
      <Text style={[styles.strategyTitle, { color: theme.colors.primaryDark }]}>গভীর শ্বাস-প্রশ্বাস গাইড</Text>
      <View style={styles.breathStep}>
        <Text style={[styles.breathNum, { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary }]}>১</Text>
        <Text style={[styles.breathText, { color: theme.colors.text }]}>নাক দিয়ে ৪ সেকেন্ড ধীরে শ্বাস নিন</Text>
      </View>
      <View style={styles.breathStep}>
        <Text style={[styles.breathNum, { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary }]}>২</Text>
        <Text style={[styles.breathText, { color: theme.colors.text }]}>৪ সেকেন্ড শ্বাস ধরে রাখুন</Text>
      </View>
      <View style={styles.breathStep}>
        <Text style={[styles.breathNum, { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary }]}>৩</Text>
        <Text style={[styles.breathText, { color: theme.colors.text }]}>মুখ দিয়ে ৬ সেকেন্ড ধীরে শ্বাস ছাড়ুন</Text>
      </View>
      <View style={styles.breathStep}>
        <Text style={[styles.breathNum, { backgroundColor: theme.colors.primary, color: theme.colors.onPrimary }]}>৪</Text>
        <Text style={[styles.breathText, { color: theme.colors.text }]}>এই প্রক্রিয়া ৫ বার পুনরাবৃত্তি করুন</Text>
      </View>
      <Text style={[styles.breathTip, { color: theme.colors.textSecondary }]}>
        💡 গভীর শ্বাস মস্তিষ্কে অক্সিজেন সরবরাহ বাড়ায় এবং ক্র্যাভিং কমায়।
      </Text>
    </View>
  );
}"""

breathing_new = """function BreathingGuide({ theme }: { theme: Theme }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [instruction, setInstruction] = useState('প্রস্তুত হোন...');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const breatheCycle = () => {
      if (!active) return;
      setInstruction('শ্বাস নিন... (৪ সেকেন্ড)');
      
      Animated.timing(scale, {
        toValue: 2.2,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        if (!active) return;
        setInstruction('ধরে রাখুন... (৪ সেকেন্ড)');
        
        setTimeout(() => {
          if (!active) return;
          setInstruction('শ্বাস ছাড়ুন... (৬ সেকেন্ড)');
          
          Animated.timing(scale, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }).start(() => {
            if (active) breatheCycle();
          });
        }, 4000);
      });
    };
    
    const timer = setTimeout(breatheCycle, 1000);
    
    return () => {
      active = false;
      clearTimeout(timer);
      scale.stopAnimation();
    };
  }, [scale]);

  return (
    <View style={styles.strategyContent}>
      <Text style={[styles.strategyTitle, { color: theme.colors.primaryDark, textAlign: 'center' }]}>গভীর শ্বাস-প্রশ্বাস গাইড</Text>
      
      <View style={styles.breathingContainer}>
        {!reduceMotion ? (
          <Animated.View style={[styles.breathingCircle, { backgroundColor: theme.colors.primary, transform: [{ scale }] }]} />
        ) : (
          <View style={[styles.breathingCircle, { backgroundColor: theme.colors.primary, transform: [{ scale: 1.5 }] }]} />
        )}
        <Text style={[styles.breathingInstruction, { color: theme.colors.primaryDark }]}>{instruction}</Text>
      </View>
      
      <Text style={[styles.breathTip, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 30 }]}>
        💡 গভীর শ্বাস মস্তিষ্কে অক্সিজেন সরবরাহ বাড়ায় এবং ক্র্যাভিং কমায়।
      </Text>
    </View>
  );
}"""

content = content.replace(breathing_old, breathing_new)

dhikr_old = """function DhikrGuide({ theme }: { theme: Theme }) {
  return (
    <View style={styles.strategyContent}>
      <Text style={[styles.strategyTitle, { color: theme.colors.primaryDark }]}>জিকির করুন</Text>
      {DHIKR_LIST.map((item, idx) => (
        <View key={idx} style={[styles.dhikrCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.dhikrArabic, { color: theme.colors.primaryDark }]}>{item.arabic}</Text>
          <Text style={[styles.dhikrBangla, { color: theme.colors.primary }]}>{item.bangla}</Text>
          <Text style={[styles.dhikrMeaning, { color: theme.colors.textSecondary }]}>{item.meaning}</Text>
        </View>
      ))}
      <Text style={[styles.breathTip, { color: theme.colors.textSecondary }]}>
        💡 প্রতিটি জিকির ৩৩ বার করে পড়ুন। আল্লাহর স্মরণে হৃদয় প্রশান্ত হয়।
      </Text>
    </View>
  );
}"""

dhikr_new = """function DhikrGuide({ theme }: { theme: Theme }) {
  const [counts, setCounts] = useState<number[]>([0, 0, 0]);

  const handleTap = (index: number) => {
    if (counts[index] < 33) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      const newCounts = [...counts];
      newCounts[index] += 1;
      setCounts(newCounts);
      
      if (newCounts[index] === 33) {
         try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      }
    }
  };

  return (
    <View style={styles.strategyContent}>
      <Text style={[styles.strategyTitle, { color: theme.colors.primaryDark }]}>জিকির করুন (প্রতিটি ৩৩ বার)</Text>
      {DHIKR_LIST.map((item, idx) => {
        const isComplete = counts[idx] >= 33;
        return (
          <TouchableOpacity 
            key={idx} 
            style={[styles.dhikrCard, { backgroundColor: theme.colors.surfaceVariant, borderWidth: isComplete ? 2 : 0, borderColor: theme.colors.primary }]}
            onPress={() => handleTap(idx)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${item.bangla}, বর্তমান কাউন্ট ${counts[idx]}`}
          >
            <View style={styles.dhikrHeaderRow}>
               <Text style={[styles.dhikrArabic, { color: theme.colors.primaryDark }]}>{item.arabic}</Text>
               <View style={[styles.tasbihCounter, { backgroundColor: isComplete ? theme.colors.primary : theme.colors.chipBackground }]}>
                 {isComplete ? (
                    <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>✔</Text>
                 ) : (
                    <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 13 }}>{counts[idx]}/33</Text>
                 )}
               </View>
            </View>
            <Text style={[styles.dhikrBangla, { color: theme.colors.primary }]}>{item.bangla}</Text>
            <Text style={[styles.dhikrMeaning, { color: theme.colors.textSecondary }]}>{item.meaning}</Text>
          </TouchableOpacity>
        );
      })}
      <Text style={[styles.breathTip, { color: theme.colors.textSecondary }]}>
        💡 ট্যাপ করে গননা করুন। আল্লাহর স্মরণে হৃদয় প্রশান্ত হয়।
      </Text>
    </View>
  );
}"""

content = content.replace(dhikr_old, dhikr_new)

# 3. Add GroundingGuide before the // ─── Main Screen block
grounding_guide = """
const GROUNDING_STEPS = [
  { count: 5, label: 'আপনার চারপাশের ৫টি জিনিস দেখুন\\n(যেমন: একটি কলম বা আকাশ)।', icon: '👁️' },
  { count: 4, label: '৪টি জিনিস স্পর্শ করুন\\n(যেমন: আপনার জামা বা চেয়ার)।', icon: '✋' },
  { count: 3, label: '৩টি শব্দ শোনার চেষ্টা করুন\\n(যেমন: পাখির ডাক বা ফ্যানের শব্দ)।', icon: '👂' },
  { count: 2, label: '২টি জিনিসের গন্ধ অনুভব করুন\\n(যেমন: চা বা বাতাসের গন্ধ)।', icon: '👃' },
  { count: 1, label: '১টি ইতিবাচক চিন্তা বা স্বাদ অনুভব করুন।', icon: '🧠' },
];

function GroundingGuide({ theme }: { theme: Theme }) {
  return (
    <View style={styles.strategyContent}>
      <Text style={[styles.strategyTitle, { color: theme.colors.primaryDark }]}>5-4-3-2-1 গ্রাউন্ডিং টেকনিক</Text>
      <Text style={[styles.cardSub, { color: theme.colors.textSecondary, marginBottom: 16 }]}>
        ক্র্যাভিং খুব তীব্র হলে বর্তমান মুহূর্তে মনোযোগ ফিরিয়ে আনতে এই ধাপগুলো অনুসরণ করুন:
      </Text>
      
      {GROUNDING_STEPS.map((step, idx) => (
        <View key={idx} style={styles.groundingRow}>
          <View style={[styles.groundingIconWrap, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={styles.groundingIcon}>{step.icon}</Text>
          </View>
          <View style={styles.groundingTextWrap}>
             <Text style={[styles.groundingCount, { color: theme.colors.primary }]}>{step.count}টি জিনিস</Text>
             <Text style={[styles.groundingDesc, { color: theme.colors.text }]}>{step.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
"""

content = content.replace("// ─── Main Screen", grounding_guide + "\n// ─── Main Screen")

# 4. strategyMap update
content = content.replace(
    "breathing: 'breathing',\n      dhikr: 'dhikr',\n      dua: 'dua',\n      activity: 'activity',\n    };",
    "breathing: 'breathing',\n      dhikr: 'dhikr',\n      dua: 'dua',\n      activity: 'activity',\n      grounding: 'grounding',\n    };"
)

# 5. render GroundingGuide
content = content.replace(
    "{activeTab === 'activity' && <ActivityList theme={theme} />}",
    "{activeTab === 'activity' && <ActivityList theme={theme} />}\n          {activeTab === 'grounding' && <GroundingGuide theme={theme} />}"
)

# 6. Add styles
styles_to_add = """  // New Breathing & Dhikr & Grounding Styles
  breathingContainer: { height: 180, alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  breathingCircle: { position: 'absolute', width: 90, height: 90, borderRadius: 45, opacity: 0.15 },
  breathingInstruction: { fontSize: 16, fontWeight: '600', zIndex: 10 },
  dhikrHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: 4 },
  dhikrArabic: { fontSize: 22, textAlign: 'right', flex: 1, marginRight: 8 },
  tasbihCounter: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, minWidth: 46, alignItems: 'center', alignSelf: 'center' },
  groundingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  groundingIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  groundingIcon: { fontSize: 20 },
  groundingTextWrap: { flex: 1 },
  groundingCount: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  groundingDesc: { fontSize: 13, lineHeight: 18 },
"""

content = content.replace("  outcomeBtnTextDark: { fontSize: 15, fontWeight: '600' },\n});", "  outcomeBtnTextDark: { fontSize: 15, fontWeight: '600' },\n" + styles_to_add + "});")

with open('app/craving/index.tsx', 'w') as f:
    f.write(content)
