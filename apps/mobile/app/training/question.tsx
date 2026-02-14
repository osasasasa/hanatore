import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { Mascot } from '../../components/Mascot';
import { useTrainingStore } from '../../store/useTrainingStore';
import { VoiceInputArea } from '../../components/VoiceInputArea';

export default function QuestionScreen() {
  const {
    currentSession,
    currentQuestionIndex,
    selectedMode,
    submitAnswer,
    nextQuestion,
  } = useTrainingStore();

  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepAnswers, setStepAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const question = currentSession?.questions[currentQuestionIndex];
  const isQuickMode = selectedMode === 'quick';
  const hasStructuredSteps = !isQuickMode && question?.structuredSteps && question.structuredSteps.length > 0;

  useEffect(() => {
    if (!currentSession || !question) {
      router.replace('/');
      return;
    }

    startTimeRef.current = Date.now();
    setAnswer('');
    setCurrentStep(0);
    setStepAnswers([]);
    setIsSubmitting(false);

    if (isQuickMode && question.timeLimit) {
      setTimeLeft(question.timeLimit);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, currentSession?.id]);

  const handleSubmit = (isTimeUp = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const finalAnswer = hasStructuredSteps
      ? stepAnswers.join('\n\n')
      : answer || (isTimeUp ? '(時間切れ)' : '');

    submitAnswer(finalAnswer, timeSpent);

    const isLastQuestion = currentQuestionIndex >= (currentSession?.questions.length || 1) - 1;

    if (isLastQuestion) {
      router.replace('/training/result');
    } else {
      nextQuestion();
      setAnswer('');
      setCurrentStep(0);
      setStepAnswers([]);
      setIsSubmitting(false);
      startTimeRef.current = Date.now();

      if (isQuickMode && question?.timeLimit) {
        setTimeLeft(question.timeLimit);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              handleSubmit(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  };

  const handleStepNext = () => {
    if (!hasStructuredSteps || !question?.structuredSteps) return;

    const newStepAnswers = [...stepAnswers, answer];
    setStepAnswers(newStepAnswers);
    setAnswer('');

    if (currentStep < question.structuredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      submitAnswer(newStepAnswers.join('\n\n'), timeSpent);

      const isLastQuestion = currentQuestionIndex >= (currentSession?.questions.length || 1) - 1;
      if (isLastQuestion) {
        router.replace('/training/result');
      } else {
        nextQuestion();
      }
    }
  };

  const handleSkip = () => {
    handleSubmit(false);
  };

  if (!currentSession || !question) {
    return null;
  }

  const progressPercentage =
    ((currentQuestionIndex + 1) / currentSession.questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={COLORS.textSub} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} / {currentSession.questions.length}
          </Text>
        </View>
        {isQuickMode && (
          <View style={[styles.timerContainer, timeLeft <= 10 && styles.timerDanger]}>
            <Text style={[styles.timerText, timeLeft <= 10 && styles.timerTextDanger]}>
              {timeLeft}s
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.modeTag}>
          <View style={styles.modeTagInner}>
            <Ionicons
              name={isQuickMode ? 'flash' : 'layers'}
              size={14}
              color={COLORS.textSub}
            />
            <Text style={styles.modeTagText}>
              {isQuickMode ? '瞬発力モード' : '構造化モード'}
            </Text>
          </View>
        </View>

        <View style={styles.situationCard}>
          <Text style={styles.situationLabel}>シチュエーション</Text>
          <Text style={styles.situationText}>{question.situation}</Text>
        </View>

        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Mascot size={56} />
            <View style={styles.speechBubble}>
              <Text style={styles.questionText}>{question.prompt}</Text>
            </View>
          </View>
        </View>

        {hasStructuredSteps && question.structuredSteps && (
          <View style={styles.stepsContainer}>
            {question.structuredSteps.map((step, index) => (
              <View
                key={index}
                style={[
                  styles.stepIndicator,
                  index < currentStep && styles.stepCompleted,
                  index === currentStep && styles.stepCurrent,
                ]}
              >
                <View
                  style={[
                    styles.stepDot,
                    index < currentStep && styles.stepDotCompleted,
                    index === currentStep && styles.stepDotCurrent,
                  ]}
                >
                  {index < currentStep ? (
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  ) : (
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepText,
                    index === currentStep && styles.stepTextCurrent,
                  ]}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>
        )}

        <VoiceInputArea
          key={`${currentSession?.id}-${currentQuestionIndex}-${currentStep}`}
          value={answer}
          onChangeText={setAnswer}
          placeholder={
            hasStructuredSteps && question.structuredSteps
              ? `Step ${currentStep + 1}: ${question.structuredSteps[currentStep]}`
              : 'ここに回答を入力...'
          }
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>スキップ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, !answer.trim() && styles.submitButtonDisabled]}
          onPress={() => (hasStructuredSteps ? handleStepNext() : handleSubmit())}
          disabled={!answer.trim()}
        >
          <Text style={styles.submitButtonText}>
            {hasStructuredSteps
              ? currentStep < (question.structuredSteps?.length || 1) - 1
                ? '次のステップ →'
                : '回答を送信'
              : '回答を送信'}
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSub,
    fontWeight: '600',
  },
  timerContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  timerDanger: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  timerTextDanger: {
    color: COLORS.error,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  modeTag: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modeTagInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeTagText: {
    fontSize: 14,
    color: COLORS.textSub,
    fontWeight: '500',
  },
  situationCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  situationLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 4,
  },
  situationText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  questionCard: {
    marginBottom: 24,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mascot: {
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
  questionText: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 26,
    fontWeight: '500',
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepCompleted: {
    opacity: 0.6,
  },
  stepCurrent: {
    opacity: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.success,
  },
  stepDotCurrent: {
    backgroundColor: COLORS.secondary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.textSub,
  },
  stepTextCurrent: {
    color: COLORS.text,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skipButtonText: {
    fontSize: 16,
    color: COLORS.textSub,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  submitButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
