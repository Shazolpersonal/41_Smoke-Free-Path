import re

with open('smoke-free-path/app/(tabs)/progress.tsx', 'r') as f:
    content = f.read()

styles_to_remove = [
    r"  boldTextCenter: \{ fontWeight: '700', marginBottom: 4, textAlign: 'center' \},\n",
    r"  progressBarCard: \{\n    marginBottom: 12,\n  \},\n",
    r"  progressBarHeader: \{ \n    flexDirection: 'row', \n    justifyContent: 'space-between',\n    marginBottom: 12,\n  \},\n",
    r"  progressBarTrack: \{ \n    height: 12, \n    borderRadius: 6, \n    overflow: 'hidden' \n  \},\n",
    r"  progressBarFill: \{ \n    height: 12, \n    borderRadius: 6 \n  \},\n",
    r"  statsRow: \{ \n    flexDirection: 'row',\n    gap: 12,\n    marginBottom: 16,\n  \},\n",
    r"  statCard: \{\n    flex: 1, \n    borderRadius: 20, \n    padding: 16, \n    alignItems: 'center',\n    shadowColor: '#000',\n    shadowOffset: \{ width: 0, height: 2 \},\n    shadowOpacity: 0\.05,\n    shadowRadius: 8,\n    elevation: 3,\n  \},\n",
    r"  chartCard: \{\n    borderRadius: 20,\n    padding: 16,\n  \},\n",
    r"  chartContainer: \{\n    paddingVertical: 8,\n  \},\n",
    r"  chartRow: \{ \n    flexDirection: 'row', \n    alignItems: 'center', \n    marginBottom: 12 \n  \},\n",
    r"  chartBarBg: \{ \n    flex: 1, \n    height: 10, \n    borderRadius: 5, \n    overflow: 'hidden', \n    marginHorizontal: 12 \n  \},\n",
    r"  chartBarFill: \{ \n    height: 10, \n    borderRadius: 5 \n  \},\n",
    r"  chartCountText: \{ \n    fontWeight: '700', \n    width: 28, \n    textAlign: 'right' \n  \},\n",
    r"  chartSummary: \{ \n    marginTop: 12, \n    paddingTop: 12, \n    borderTopWidth: 1 \n  \},\n",
    r"  emptyState: \{ \n    alignItems: 'center', \n    paddingVertical: 32 \n  \},\n",
    r"  emptyStateCTA: \{ \n    borderRadius: 12, \n    paddingVertical: 12, \n    paddingHorizontal: 24 \n  \},\n"
]

for style in styles_to_remove:
    content = re.sub(style, "", content, flags=re.MULTILINE)

with open('smoke-free-path/app/(tabs)/progress.tsx', 'w') as f:
    f.write(content)
