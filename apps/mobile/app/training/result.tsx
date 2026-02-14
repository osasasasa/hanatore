import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { COLORS, MASCOT } from '../../constants/colors';
import { useTrainingStore } from '../../store/useTrainingStore';

export default function ResultScreen() {
  const { currentSession, userProgress, endSession, resetSession } = useTrainingStore();

  useEffect(() => {
    if (currentSession && !currentSession.endTime) {
      endSession();
    }
  }, []);

  if (!currentSession) {
    return null;
  }

  const totalQuestions = currentSession.questions.length;
  const answeredQuestions = currentSession.answers.length;
  const averageScore =
    answeredQuestions > 0
      ? Math.round(
          currentSession.answers.reduce((sum, a) => sum + a.score, 0) / answeredQuestions
        )
      : 0;

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'S', color: '#FFD700', message: '素晴らしい！' };
    if (score >= 80) return { grade: 'A', color: COLORS.success, message: '良くできました！' };
    if (score >= 70) return { grade: 'B', color: COLORS.secondary, message: 'がんばりました！' };
    if (score >= 60) return { grade: 'C', color: COLORS.primary, message: 'もう少し！' };
    return { grade: 'D', color: COLORS.textSub, message: '次は頑張ろう！' };
  };

  const scoreInfo = getScoreGrade(averageScore);

  const handleGoHome = () => {
    resetSession();
    router.replace('/');
  };

  const handleRetry = () => {
    const category = currentSession.category;
    const mode = currentSession.mode;
    resetSession();
    const { startSession } = useTrainingStore.getState();
    startSession(category, mode);
    router.replace('/training/question');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>トレーニング完了！</Text>
        </View>

        <View style={styles.mascotSection}>
          <Text style={styles.mascot}>{MASCOT}</Text>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{scoreInfo.message}</Text>
          </View>
        </View>

        <View style={styles.scoreCard}>
          <Text style={[styles.gradeText, { color: scoreInfo.color }]}>{scoreInfo.grade}</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{averageScore}</Text>
            <Text style={styles.scoreLabel}>平均スコア</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{answeredQuestions}</Text>
            <Text style={styles.statLabel}>回答数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>
              +{currentSession.totalXp}
            </Text>
            <Text style={styles.statLabel}>獲得XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(
                currentSession.answers.reduce((sum, a) => sum + a.timeSpent, 0) / answeredQuestions
              ) || 0}
              s
            </Text>
            <Text style={styles.statLabel}>平均時間</Text>
          </View>
        </View>

        <View style={styles.levelCard}>
          <Text style={styles.levelTitle}>レベル進捗</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>Lv.{userProgress.level}</Text>
            <View style={styles.xpBar}>
              <View
                style={[
                  styles.xpFill,
                  {
                    width: `${(userProgress.currentXp / userProgress.xpToNextLevel) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.xpText}>
              {userProgress.currentXp}/{userProgress.xpToNextLevel}
            </Text>
          </View>
          <Text style={styles.levelSubtext}>{userProgress.title}</Text>
        </View>

        <Text style={styles.sectionTitle}>回答詳細</Text>

        {currentSession.answers.map((answer, index) => (
          <View key={answer.questionId} style={styles.answerCard}>
            <View style={styles.answerHeader}>
              <Text style={styles.answerNumber}>Q{index + 1}</Text>
              <View
                style={[
                  styles.answerScoreBadge,
                  { backgroundColor: getScoreGrade(answer.score).color },
                ]}
              >
                <Text style={styles.answerScoreText}>{answer.score}</Text>
              </View>
            </View>
            <Text style={styles.answerText} numberOfLines={3}>
              {answer.userAnswer}
            </Text>
            <Text style={styles.feedbackText}>{answer.feedback}</Text>
            <Text style={styles.timeText}>{answer.timeSpent}秒で回答</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>もう一度</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <Text style={styles.homeButtonText}>ホームに戻る</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mascotSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  mascot: {
    fontSize: 56,
    marginRight: 12,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderTopLeftRadius: 4,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speechText: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: '600',
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  gradeText: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreCircle: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.textSub,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSub,
    marginTop: 4,
  },
  levelCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  levelTitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  xpBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  levelSubtext: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  answerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textSub,
  },
  answerScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  answerScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 13,
    color: COLORS.secondary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 32,
  },
  retryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  homeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
