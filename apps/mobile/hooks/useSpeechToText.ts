import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

type SpeechToTextState = {
  transcript: string;
  isListening: boolean;
  error: string | null;
  isAvailable: boolean;
};

export function useSpeechToText(locale = 'ja-JP') {
  const [state, setState] = useState<SpeechToTextState>({
    transcript: '',
    isListening: false,
    error: null,
    isAvailable: true,
  });
  const transcriptRef = useRef('');

  useSpeechRecognitionEvent('start', () => {
    setState((prev) => ({ ...prev, isListening: true, error: null }));
  });

  useSpeechRecognitionEvent('end', () => {
    setState((prev) => ({ ...prev, isListening: false }));
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    transcriptRef.current = text;
    setState((prev) => ({ ...prev, transcript: text }));
  });

  useSpeechRecognitionEvent('error', (event) => {
    setState((prev) => ({
      ...prev,
      isListening: false,
      error: event.error,
    }));
  });

  const start = useCallback(async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      setState((prev) => ({
        ...prev,
        error: 'マイクの使用が許可されていません',
        isAvailable: false,
      }));
      return;
    }

    transcriptRef.current = '';
    setState((prev) => ({ ...prev, transcript: '', error: null }));

    ExpoSpeechRecognitionModule.start({
      lang: locale,
      interimResults: true,
      continuous: true,
    });
  }, [locale]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const reset = useCallback(() => {
    transcriptRef.current = '';
    setState({
      transcript: '',
      isListening: false,
      error: null,
      isAvailable: true,
    });
  }, []);

  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.stop();
    };
  }, []);

  return {
    ...state,
    start,
    stop,
    reset,
  };
}
