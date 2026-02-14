import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { Mascot } from '../../components/Mascot';
import { useTrainingStore } from '../../store/useTrainingStore';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  business: 'briefcase-outline',
  presentation: 'mic-outline',
  daily: 'chatbubble-outline',
  thinking: 'document-text-outline',
};

const CATEGORY_NAMES: Record<string, string> = {
  business: 'ビジネス基礎',
  presentation: 'プレゼン',
  daily: '日常会話',
  thinking: '思考整理',
};

export default function HistoryScreen() {
  const { sessionHistory, userProgress } = useTrainingStore();

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const getAverageScore = () => {
    if (sessionHistory.length === 0) return 0;
    const allAnswers = sessionHistory.flatMap((s) => s.answers);
    if (allAnswers.length === 0) return 0;
    return Math.round(allAnswers.reduce((sum, a) => sum + a.score, 0) / allAnswers.length);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>履歴</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProgress.totalSessions}</Text>
            <Text style={styles.statLabel}>セッション数</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getAverageScore()}</Text>
            <Text style={styles.statLabel}>平均スコア</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userProgress.streak}</Text>
            <Text style={styles.statLabel}>連続日数</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>最近のトレーニング</Text>

        {sessionHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Mascot mood="sad" size={80} style={styles.emptyMascot} />
            <Text style={styles.emptyText}>まだトレーニング履歴がありません</Text>
            <Text style={styles.emptySubText}>ホーム画面からトレーニングを始めましょう！</Text>
          </View>
        ) : (
          sessionHistory
            .slice()
            .reverse()
            .map((session) => (
              <View key={session.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyCategory}>
                    <Ionicons
                      name={CATEGORY_ICONS[session.category] || 'book-outline'}
                      size={20}
                      color={COLORS.secondary}
                      style={styles.categoryIcon}
                    />
                    <Text style={styles.categoryName}>
                      {CATEGORY_NAMES[session.category] || session.category}
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>{formatDate(session.startTime)}</Text>
                </View>
                <View style={styles.historyStats}>
                  <View style={styles.historyStat}>
                    <Text style={styles.historyStatValue}>{session.answers.length}</Text>
                    <Text style={styles.historyStatLabel}>問題</Text>
                  </View>
                  <View style={styles.historyStat}>
                    <Text style={styles.historyStatValue}>
                      {session.answers.length > 0
                        ? Math.round(
                            session.answers.reduce((sum, a) => sum + a.score, 0) /
                              session.answers.length
                          )
                        : 0}
                    </Text>
                    <Text style={styles.historyStatLabel}>スコア</Text>
                  </View>
                  <View style={styles.historyStat}>
                    <Text style={[styles.historyStatValue, { color: COLORS.primary }]}>
                      +{session.totalXp}
                    </Text>
                    <Text style={styles.historyStatLabel}>XP</Text>
                  </View>
                </View>
                <View style={styles.modeTag}>
                  <View style={styles.modeTagInner}>
                    <Ionicons
                      name={session.mode === 'quick' ? 'flash' : 'layers'}
                      size={12}
                      color={COLORS.textSub}
                    />
                    <Text style={styles.modeTagText}>
                      {session.mode === 'quick' ? '瞬発力モード' : '構造化モード'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSub,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyMascot: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textSub,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textSub,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyStat: {
    alignItems: 'center',
  },
  historyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  historyStatLabel: {
    fontSize: 11,
    color: COLORS.textSub,
    marginTop: 2,
  },
  modeTag: {
    marginTop: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  modeTagInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeTagText: {
    fontSize: 12,
    color: COLORS.textSub,
    fontWeight: '500',
  },
});
