import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { COLORS } from '../constants/colors';
import { useSpeechToText } from '../hooks/useSpeechToText';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function VoiceInputArea({ value, onChangeText, placeholder }: Props) {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const { transcript, isListening, error, isAvailable, start, stop, reset } =
    useSpeechToText();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sync transcript to parent
  useEffect(() => {
    if (transcript) {
      onChangeText(transcript);
    }
  }, [transcript, onChangeText]);

  // Pulse animation while listening
  useEffect(() => {
    if (isListening) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const handleMicPress = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  const switchToText = useCallback(() => {
    if (isListening) stop();
    setMode('text');
  }, [isListening, stop]);

  const switchToVoice = useCallback(() => {
    setMode('voice');
  }, []);

  if (mode === 'text') {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder ?? 'ここに回答を入力...'}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          multiline
          textAlignVertical="top"
        />
        {isAvailable && (
          <TouchableOpacity style={styles.switchButton} onPress={switchToVoice}>
            <Text style={styles.switchButtonText}>🎤 音声入力に切替</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.voiceArea}>
        {value ? (
          <Text style={styles.transcriptText}>{value}</Text>
        ) : (
          <Text style={styles.placeholderText}>
            {isListening ? '話してください...' : 'マイクボタンをタップして開始'}
          </Text>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.switchButton} onPress={switchToText}>
          <Text style={styles.switchButtonText}>⌨️ テキスト入力に切替</Text>
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={handleMicPress}
          >
            <Text style={styles.micIcon}>{isListening ? '⏹' : '🎤'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceArea: {
    minHeight: 100,
    justifyContent: 'center',
    marginBottom: 12,
  },
  transcriptText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  micButtonActive: {
    backgroundColor: COLORS.error,
  },
  micIcon: {
    fontSize: 24,
  },
  switchButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  switchButtonText: {
    fontSize: 13,
    color: COLORS.textSub,
  },
  textInput: {
    minHeight: 120,
    padding: 0,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
});
