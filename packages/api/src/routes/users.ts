import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  updateProfileSchema,
  type User,
  type UserProgress,
  TrainingMode,
} from '../types.js';

const users = new Hono();

// Mock current user (will be replaced with auth)
const MOCK_USER_ID = 'user-mock-001';

// Mock user data
const mockUser: User = {
  id: MOCK_USER_ID,
  email: 'demo@hanatore.app',
  displayName: 'デモユーザー',
  level: 5,
  totalXp: 2450,
  currentStreak: 7,
  longestStreak: 14,
  lastTrainingDate: new Date().toISOString(),
  preferredModes: [TrainingMode.BUSINESS, TrainingMode.PRESENTATION],
  createdAt: new Date('2024-01-01').toISOString(),
};

// Helper: Calculate XP needed for next level
const calculateXpToNextLevel = (level: number, totalXp: number): number => {
  // XP formula: Each level requires level * 100 XP
  const xpForCurrentLevel = Array.from({ length: level - 1 }, (_, i) => (i + 1) * 100).reduce(
    (sum, xp) => sum + xp,
    0
  );
  const xpForNextLevel = level * 100;
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  return xpForNextLevel - xpInCurrentLevel;
};

// Helper: Check if user trained today
const isToday = (date: string | null): boolean => {
  if (!date) return false;
  const today = new Date();
  const checkDate = new Date(date);
  return (
    today.getFullYear() === checkDate.getFullYear() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getDate() === checkDate.getDate()
  );
};

/**
 * GET /users/me
 * Get current user information
 */
users.get('/me', (c) => {
  return c.json(mockUser);
});

/**
 * PATCH /users/me
 * Update user profile
 */
users.patch('/me', zValidator('json', updateProfileSchema), async (c) => {
  const data = c.req.valid('json');

  // Update mock user (in real implementation, this updates DB)
  if (data.displayName !== undefined) {
    mockUser.displayName = data.displayName;
  }
  if (data.preferredModes !== undefined) {
    mockUser.preferredModes = data.preferredModes;
  }

  return c.json(mockUser);
});

/**
 * GET /users/me/progress
 * Get user progress (XP, level, streak)
 */
users.get('/me/progress', (c) => {
  const progress: UserProgress = {
    level: mockUser.level,
    totalXp: mockUser.totalXp,
    xpToNextLevel: calculateXpToNextLevel(mockUser.level, mockUser.totalXp),
    currentStreak: mockUser.currentStreak,
    longestStreak: mockUser.longestStreak,
    lastTrainingDate: mockUser.lastTrainingDate,
    todayCompleted: isToday(mockUser.lastTrainingDate),
  };

  return c.json(progress);
});

export default users;
