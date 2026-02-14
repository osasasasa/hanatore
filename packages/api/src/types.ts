import { z } from 'zod';

// Enums matching Prisma schema
export const TrainingMode = {
  BUSINESS: 'BUSINESS',
  PRESENTATION: 'PRESENTATION',
  ONE_ON_ONE: 'ONE_ON_ONE',
  DAILY_TALK: 'DAILY_TALK',
  THINKING: 'THINKING',
} as const;

export const TrainingType = {
  QUICK: 'QUICK',
  STRUCTURED: 'STRUCTURED',
  AI_DIALOG: 'AI_DIALOG',
} as const;

export const LeagueTier = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
} as const;

export type TrainingMode = (typeof TrainingMode)[keyof typeof TrainingMode];
export type TrainingType = (typeof TrainingType)[keyof typeof TrainingType];
export type LeagueTier = (typeof LeagueTier)[keyof typeof LeagueTier];

// Zod Schemas for validation
export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  preferredModes: z.array(z.nativeEnum(TrainingMode)).optional(),
});

export const questionsQuerySchema = z.object({
  mode: z.nativeEnum(TrainingMode).optional(),
  trainingType: z.nativeEnum(TrainingType).optional(),
  difficulty: z.coerce.number().min(1).max(5).optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export const startTrainingSchema = z.object({
  mode: z.nativeEnum(TrainingMode),
  trainingType: z.nativeEnum(TrainingType),
});

export const submitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  content: z.string().min(1),
  timeSpentSeconds: z.number().optional(),
});

export const completeTrainingSchema = z.object({
  sessionId: z.string().uuid(),
});

export const trainingHistoryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export const rankingQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Response Types
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastTrainingDate: string | null;
  preferredModes: TrainingMode[] | null;
  createdAt: string;
}

export interface UserProgress {
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastTrainingDate: string | null;
  todayCompleted: boolean;
}

export interface Question {
  id: string;
  mode: TrainingMode;
  trainingType: TrainingType;
  method: string | null;
  title: string;
  context: string | null;
  hint: string | null;
  sampleAnswer?: string | null;
  difficulty: number;
  isPremium: boolean;
}

export interface TrainingSession {
  id: string;
  mode: TrainingMode;
  trainingType: TrainingType;
  startedAt: string;
  completedAt: string | null;
  totalXpEarned: number;
  questionsCount: number;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  score: number | null;
  scoreDetail: ScoreDetail | null;
  feedback: string | null;
  improvements: string[] | null;
  timeSpentSeconds: number | null;
  createdAt: string;
}

export interface ScoreDetail {
  specificity: number;
  structure: number;
  persuasiveness: number;
}

export interface AnswerResult {
  answerId: string;
  score: number;
  scoreDetail: ScoreDetail;
  feedback: string;
  improvements: string[];
  xpEarned: number;
}

export interface LeagueInfo {
  leagueId: string;
  tier: LeagueTier;
  weeklyXp: number;
  rank: number | null;
  startDate: string;
  endDate: string;
  totalParticipants: number;
}

export interface RankingEntry {
  rank: number;
  userId: string;
  displayName: string;
  weeklyXp: number;
  tier: LeagueTier;
  isCurrentUser: boolean;
}

// Error response type
export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
