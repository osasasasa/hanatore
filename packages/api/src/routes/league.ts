import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  rankingQuerySchema,
  type LeagueInfo,
  type RankingEntry,
  LeagueTier,
} from '../types.js';

const league = new Hono();

// Mock current user (will be replaced with auth)
const MOCK_USER_ID = 'user-mock-001';

// Helper: Get current week's league ID (e.g., "2024-W15")
const getCurrentLeagueId = (): string => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
};

// Helper: Get week start/end dates
const getWeekDates = (): { startDate: string; endDate: string } => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    startDate: monday.toISOString(),
    endDate: sunday.toISOString(),
  };
};

// Mock ranking data
const generateMockRanking = (): RankingEntry[] => {
  const names = [
    '話し上手さん', 'プレゼンマスター', 'ビジネス達人', '説明の鬼',
    '論理的思考', 'コミュ力UP', 'PREP使い', '瞬発力トレーナー',
    '毎日継続', 'ストリーク維持', '努力の人', '成長中',
    'デモユーザー', 'がんばり屋', 'もくもく', '朝活派',
    'スキマ時間', '通勤トレ', 'ランチ練習', '寝る前5分',
  ];

  // Generate 20 participants with varying XP
  const participants: RankingEntry[] = names.map((name, index) => ({
    rank: index + 1,
    userId: index === 12 ? MOCK_USER_ID : `user-${index + 1}`,
    displayName: name,
    weeklyXp: Math.max(0, 1000 - index * 45 + Math.floor(Math.random() * 30)),
    tier: index < 3 ? LeagueTier.GOLD : index < 10 ? LeagueTier.SILVER : LeagueTier.BRONZE,
    isCurrentUser: index === 12,
  }));

  // Sort by XP and reassign ranks
  participants.sort((a, b) => b.weeklyXp - a.weeklyXp);
  participants.forEach((p, i) => {
    p.rank = i + 1;
  });

  return participants;
};

// Store ranking (simulates weekly reset)
let cachedRanking: RankingEntry[] | null = null;
let cachedLeagueId: string | null = null;

const getRanking = (): RankingEntry[] => {
  const currentLeagueId = getCurrentLeagueId();

  // Reset ranking on new week
  if (cachedLeagueId !== currentLeagueId) {
    cachedRanking = generateMockRanking();
    cachedLeagueId = currentLeagueId;
  }

  return cachedRanking!;
};

/**
 * GET /league/current
 * Get current week's league information
 */
league.get('/current', (c) => {
  const leagueId = getCurrentLeagueId();
  const { startDate, endDate } = getWeekDates();
  const ranking = getRanking();

  // Find current user in ranking
  const currentUserEntry = ranking.find((r) => r.userId === MOCK_USER_ID);

  const leagueInfo: LeagueInfo = {
    leagueId,
    tier: currentUserEntry?.tier || LeagueTier.BRONZE,
    weeklyXp: currentUserEntry?.weeklyXp || 0,
    rank: currentUserEntry?.rank || null,
    startDate,
    endDate,
    totalParticipants: ranking.length,
  };

  return c.json(leagueInfo);
});

/**
 * GET /league/ranking
 * Get league ranking
 */
league.get('/ranking', zValidator('query', rankingQuerySchema), (c) => {
  const { limit } = c.req.valid('query');
  const ranking = getRanking();

  // Get top N
  const topRanking = ranking.slice(0, limit);

  // Find current user if not in top N
  const currentUserInTop = topRanking.find((r) => r.isCurrentUser);
  const currentUser = ranking.find((r) => r.isCurrentUser);

  return c.json({
    leagueId: getCurrentLeagueId(),
    ranking: topRanking,
    currentUser: currentUserInTop ? null : currentUser,
    totalParticipants: ranking.length,
  });
});

/**
 * GET /league/history
 * Get past league results
 */
league.get('/history', (c) => {
  // Mock past league results
  const history = [
    {
      leagueId: '2024-W14',
      tier: LeagueTier.SILVER,
      finalRank: 8,
      weeklyXp: 650,
      totalParticipants: 25,
      promoted: true,
    },
    {
      leagueId: '2024-W13',
      tier: LeagueTier.BRONZE,
      finalRank: 3,
      weeklyXp: 720,
      totalParticipants: 30,
      promoted: true,
    },
    {
      leagueId: '2024-W12',
      tier: LeagueTier.BRONZE,
      finalRank: 12,
      weeklyXp: 450,
      totalParticipants: 28,
      promoted: false,
    },
  ];

  return c.json({
    history,
    totalWeeks: history.length,
  });
});

export default league;
