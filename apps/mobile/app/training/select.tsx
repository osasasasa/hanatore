import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS, MASCOT } from '../../constants/colors';
import { useTrainingStore, TrainingCategory, TrainingMode } from '../../store/useTrainingStore';

const CATEGORY_INFO: Record<TrainingCategory, { icon: string; name: string; description: string }> = {
  business: { icon: '💼', name: 'ビジネス基礎', description: '会議・報告・提案のスキルを磨く' },
  presentation: { icon: '🎤', name: 'プレゼン', description: '発表・説得・共感のスキルを磨く' },
  daily: { icon: '💬', name: '日常会話', description: '雑談・説明・相談のスキルを磨く' },
  thinking: { icon: '📝', name: '思考整理', description: '整理・分析・決断のスキルを磨く' },
};

const MODE_INFO: { id: TrainingMode; icon: string; name: string; description: string; color: string }[] = [
  {
    id: 'quick',
    icon: '⚡',
    name: '瞬発力モード',
    description: '制限時間内に即座に回答！\n実践的な瞬発力を鍛えます',
    color: COLORS.primary,
  },
  {
    id: 'structured',
    icon: '📐',
    name: '構造化モード',
    description: 'ステップに沿って論理的に回答\n構造化された話し方を学びます',
    color: COLORS.secondary,
  },
];

export default function TrainingSelectScreen() {
  const { selectedCategory, startSession } = useTrainingStore();

  if (!selectedCategory) {
    router.back();
    return null;
  }

  const category = CATEGORY_INFO[selectedCategory];

  const handleModeSelect = (mode: TrainingMode) => {
    startSession(selectedCategory, mode);
    router.push('/training/question');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← 戻る</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
        </View>

        <View style={styles.mascotSection}>
          <Text style={styles.mascot}>{MASCOT}</Text>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              どのモードでトレーニングする？
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>モードを選択</Text>

        {MODE_INFO.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[styles.modeCard, { borderColor: mode.color }]}
            onPress={() => handleModeSelect(mode.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.modeIconContainer, { backgroundColor: mode.color }]}>
              <Text style={styles.modeIcon}>{mode.icon}</Text>
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeName}>{mode.name}</Text>
              <Text style={styles.modeDescription}>{mode.description}</Text>
            </View>
            <Text style={styles.modeArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: COLORS.textSub,
  },
  mascotSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  mascot: {
    fontSize: 48,
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
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  modeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeIcon: {
    fontSize: 28,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 13,
    color: COLORS.textSub,
    lineHeight: 18,
  },
  modeArrow: {
    fontSize: 28,
    color: COLORS.textLight,
  },
});
