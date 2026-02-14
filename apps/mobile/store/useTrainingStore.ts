import { create } from 'zustand';

export type TrainingCategory = 'business' | 'presentation' | 'daily' | 'thinking';
export type TrainingMode = 'quick' | 'structured';

export interface Question {
  id: string;
  category: TrainingCategory;
  situation: string;
  prompt: string;
  timeLimit?: number;
  structuredSteps?: string[];
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  timeSpent: number;
  score: number;
  feedback: string;
  timestamp: Date;
}

export interface TrainingSession {
  id: string;
  category: TrainingCategory;
  mode: TrainingMode;
  questions: Question[];
  answers: Answer[];
  startTime: Date;
  endTime?: Date;
  totalXp: number;
}

export interface UserProgress {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  streak: number;
  totalSessions: number;
  title: string;
}

interface TrainingState {
  // Current session
  currentSession: TrainingSession | null;
  currentQuestionIndex: number;
  selectedCategory: TrainingCategory | null;
  selectedMode: TrainingMode | null;

  // User progress
  userProgress: UserProgress;

  // History
  sessionHistory: TrainingSession[];

  // Actions
  setSelectedCategory: (category: TrainingCategory) => void;
  setSelectedMode: (mode: TrainingMode) => void;
  startSession: (category: TrainingCategory, mode: TrainingMode) => void;
  submitAnswer: (answer: string, timeSpent: number) => void;
  nextQuestion: () => void;
  endSession: () => void;
  resetSession: () => void;
  addXp: (xp: number) => void;
}

const SAMPLE_QUESTIONS: Record<TrainingCategory, Question[]> = {
  business: [
    {
      id: 'b1',
      category: 'business',
      situation: '会議で上司から意見を求められました',
      prompt: '新規プロジェクトの進め方について、あなたの考えを30秒で述べてください',
      timeLimit: 30,
      structuredSteps: ['結論を述べる', '理由を2つ挙げる', '具体例を示す', '結論を再度述べる'],
    },
    {
      id: 'b2',
      category: 'business',
      situation: 'クライアントへの提案場面',
      prompt: '御社の課題解決に最適なソリューションを提案してください',
      timeLimit: 45,
      structuredSteps: ['課題の確認', '解決策の提示', 'メリットの説明', '次のステップ'],
    },
  ],
  presentation: [
    {
      id: 'p1',
      category: 'presentation',
      situation: '新製品発表会でのプレゼン',
      prompt: '新製品の魅力を3つのポイントで紹介してください',
      timeLimit: 60,
      structuredSteps: ['アテンションを引く', 'ポイント1', 'ポイント2', 'ポイント3', 'クロージング'],
    },
  ],
  daily: [
    {
      id: 'd1',
      category: 'daily',
      situation: '友人に週末の出来事を話す',
      prompt: '週末にあった印象的な出来事を説明してください',
      timeLimit: 30,
    },
    {
      id: 'd2',
      category: 'daily',
      situation: '映画の感想を聞かれた',
      prompt: '最近見た映画の感想を述べてください',
      timeLimit: 30,
    },
  ],
  thinking: [
    {
      id: 't1',
      category: 'thinking',
      situation: '自分の考えを整理する',
      prompt: '今抱えている課題について、原因と解決策を言語化してください',
      timeLimit: 60,
      structuredSteps: ['課題の明確化', '原因の分析', '解決策のリストアップ', '優先順位付け'],
    },
  ],
};

const LEVEL_TITLES = [
  '言語化ビギナー',
  '言語化チャレンジャー',
  '言語化プラクティショナー',
  '言語化エキスパート',
  '言語化マスター',
  '言語化レジェンド',
];

const getTitle = (level: number): string => {
  const index = Math.min(Math.floor((level - 1) / 5), LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[index];
};

export const useTrainingStore = create<TrainingState>((set, get) => ({
  currentSession: null,
  currentQuestionIndex: 0,
  selectedCategory: null,
  selectedMode: null,

  userProgress: {
    level: 1,
    currentXp: 0,
    xpToNextLevel: 100,
    streak: 0,
    totalSessions: 0,
    title: '言語化ビギナー',
  },

  sessionHistory: [],

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  setSelectedMode: (mode) => set({ selectedMode: mode }),

  startSession: (category, mode) => {
    const questions = SAMPLE_QUESTIONS[category] || [];
    const session: TrainingSession = {
      id: Date.now().toString(),
      category,
      mode,
      questions,
      answers: [],
      startTime: new Date(),
      totalXp: 0,
    };
    set({
      currentSession: session,
      currentQuestionIndex: 0,
      selectedCategory: category,
      selectedMode: mode,
    });
  },

  submitAnswer: (answer, timeSpent) => {
    const { currentSession, currentQuestionIndex } = get();
    if (!currentSession) return;

    const question = currentSession.questions[currentQuestionIndex];
    const score = Math.floor(Math.random() * 30) + 70;
    const xpEarned = Math.floor(score / 10) * 5;

    const newAnswer: Answer = {
      questionId: question.id,
      userAnswer: answer,
      timeSpent,
      score,
      feedback: score >= 80 ? 'すばらしい回答です！' : '良い回答ですね。次も頑張りましょう！',
      timestamp: new Date(),
    };

    set({
      currentSession: {
        ...currentSession,
        answers: [...currentSession.answers, newAnswer],
        totalXp: currentSession.totalXp + xpEarned,
      },
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex } = get();
    set({ currentQuestionIndex: currentQuestionIndex + 1 });
  },

  endSession: () => {
    const { currentSession, sessionHistory, userProgress } = get();
    if (!currentSession) return;

    const completedSession: TrainingSession = {
      ...currentSession,
      endTime: new Date(),
    };

    let newXp = userProgress.currentXp + currentSession.totalXp;
    let newLevel = userProgress.level;
    let newXpToNext = userProgress.xpToNextLevel;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = 100 + (newLevel - 1) * 20;
    }

    set({
      sessionHistory: [...sessionHistory, completedSession],
      userProgress: {
        ...userProgress,
        level: newLevel,
        currentXp: newXp,
        xpToNextLevel: newXpToNext,
        totalSessions: userProgress.totalSessions + 1,
        title: getTitle(newLevel),
      },
    });
  },

  resetSession: () => {
    set({
      currentSession: null,
      currentQuestionIndex: 0,
      selectedCategory: null,
      selectedMode: null,
    });
  },

  addXp: (xp) => {
    const { userProgress } = get();
    let newXp = userProgress.currentXp + xp;
    let newLevel = userProgress.level;
    let newXpToNext = userProgress.xpToNextLevel;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = 100 + (newLevel - 1) * 20;
    }

    set({
      userProgress: {
        ...userProgress,
        level: newLevel,
        currentXp: newXp,
        xpToNextLevel: newXpToNext,
        title: getTitle(newLevel),
      },
    });
  },
}));
