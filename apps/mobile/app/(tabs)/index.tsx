import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { Mascot } from '../../components/Mascot';
import { useTrainingStore, TrainingCategory } from '../../store/useTrainingStore';

const TRAINING_CATEGORIES: { id: TrainingCategory; icon: keyof typeof Ionicons.glyphMap; name: string; description: string }[] = [
  { id: 'business', icon: 'briefcase-outline', name: 'ビジネス基礎', description: '会議・報告・提案' },
  { id: 'presentation', icon: 'mic-outline', name: 'プレゼン', description: '発表・説得・共感' },
  { id: 'daily', icon: 'chatbubble-outline', name: '日常会話', description: '雑談・説明・相談' },
  { id: 'thinking', icon: 'document-text-outline', name: '思考整理', description: '整理・分析・決断' },
];

export default function HomeScreen() {
  const { userProgress, setSelectedCategory } = useTrainingStore();

  const handleCategoryPress = (category: TrainingCategory) => {
    setSelectedCategory(category);
    router.push('/training/select');
  };

  const xpPercentage = (userProgress.currentXp / userProgress.xpToNextLevel) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>ハナトレ</Text>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={18} color={COLORS.primary} />
            <Text style={styles.streak}>{userProgress.streak}日連続</Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <Mascot size={64} />
          <Text style={styles.level}>Lv.{userProgress.level} {userProgress.title}</Text>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpPercentage}%` }]} />
          </View>
          <Text style={styles.xpText}>
            {userProgress.currentXp} / {userProgress.xpToNextLevel} XP
          </Text>
        </View>

        <View style={styles.missionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flag" size={18} color={COLORS.text} />
            <Text style={styles.sectionTitle}>今日のミッション</Text>
          </View>
          <View style={styles.missionItem}>
            <Text style={styles.missionText}>○ ビジネス基礎 1問</Text>
          </View>
          <View style={styles.missionItem}>
            <Text style={styles.missionText}>○ 瞬発力チャレンジ</Text>
          </View>
          <View style={styles.missionItem}>
            <Text style={[styles.missionText, styles.missionDone]}>
              ● ログインボーナス +10XP
            </Text>
          </View>
        </View>

        <View style={styles.sectionTitleRow}>
          <Ionicons name="book" size={18} color={COLORS.text} />
          <Text style={styles.sectionTitle}>トレーニング</Text>
        </View>
        <View style={styles.modeGrid}>
          {TRAINING_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.modeCard}
              onPress={() => handleCategoryPress(category.id)}
              activeOpacity={0.7}
            >
              <Ionicons name={category.icon} size={32} color={COLORS.secondary} style={styles.modeIcon} />
              <Text style={styles.modeName}>{category.name}</Text>
              <Text style={styles.modeDescription}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streak: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mascot: {
    marginBottom: 8,
  },
  level: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  xpBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 14,
    color: COLORS.textSub,
    marginTop: 4,
  },
  missionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  missionItem: {
    paddingVertical: 8,
  },
  missionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  missionDone: {
    color: COLORS.textSub,
    textDecorationLine: 'line-through',
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  modeCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeIcon: {
    marginBottom: 8,
  },
  modeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 11,
    color: COLORS.textSub,
    textAlign: 'center',
  },
});
