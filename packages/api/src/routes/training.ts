import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  startTrainingSchema,
  submitAnswerSchema,
  completeTrainingSchema,
  trainingHistoryQuerySchema,
  type TrainingSession,
  type Answer,
  type AnswerResult,
  type ScoreDetail,
  TrainingMode,
  TrainingType,
} from '../types.js';

const training = new Hono();

// Mock current user (will be replaced with auth)
const MOCK_USER_ID = 'user-mock-001';

// In-memory session storage (will be replaced with DB)
const sessions = new Map<string, TrainingSession & { answers: Answer[] }>();

// Generate UUID (simple implementation for mock)
const generateId = () => crypto.randomUUID();

// Mock AI evaluation
const mockEvaluate = (content: string): { score: number; scoreDetail: ScoreDetail; feedback: string; improvements: string[] } => {
  // Simple mock scoring based on content length and keywords
  const length = content.length;
  const hasStructure = /結論|理由|具体的|したがって|まず|次に|最後に/.test(content);
  const hasNumbers = /\d+%|\d+件|\d+人|\d+日/.test(content);

  const specificity = Math.min(100, 50 + (hasNumbers ? 25 : 0) + Math.floor(length / 20));
  const structure = hasStructure ? Math.min(100, 70 + Math.floor(length / 30)) : Math.min(60, 40 + Math.floor(length / 50));
  const persuasiveness = Math.min(100, 60 + Math.floor(length / 25));

  const score = Math.round((specificity + structure + persuasiveness) / 3);

  const feedback = score >= 80
    ? '素晴らしい回答です！構造化された説明ができています。'
    : score >= 60
    ? '良い回答です。もう少し具体例を加えるとさらに良くなります。'
    : '基本的なポイントは押さえています。結論から話すことを意識してみましょう。';

  const improvements: string[] = [];
  if (!hasStructure) {
    improvements.push('結論を最初に述べると、より伝わりやすくなります');
  }
  if (!hasNumbers) {
    improvements.push('具体的な数字を入れると説得力が増します');
  }
  if (length < 100) {
    improvements.push('もう少し詳しく説明すると良いでしょう');
  }

  return {
    score,
    scoreDetail: { specificity, structure, persuasiveness },
    feedback,
    improvements,
  };
};

// Calculate XP from score
const calculateXp = (score: number): number => {
  if (score >= 90) return 100;
  if (score >= 80) return 75;
  if (score >= 70) return 50;
  if (score >= 60) return 35;
  return 20;
};

/**
 * POST /training/start
 * Start a new training session
 */
training.post('/start', zValidator('json', startTrainingSchema), async (c) => {
  const { mode, trainingType } = c.req.valid('json');

  const sessionId = generateId();
  const session: TrainingSession & { answers: Answer[] } = {
    id: sessionId,
    mode,
    trainingType,
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalXpEarned: 0,
    questionsCount: 0,
    answers: [],
  };

  sessions.set(sessionId, session);

  return c.json({
    sessionId: session.id,
    mode: session.mode,
    trainingType: session.trainingType,
    startedAt: session.startedAt,
  }, 201);
});

/**
 * POST /training/answer
 * Submit an answer for evaluation
 */
training.post('/answer', zValidator('json', submitAnswerSchema), async (c) => {
  const { sessionId, questionId, content, timeSpentSeconds } = c.req.valid('json');

  // Check if session exists
  const session = sessions.get(sessionId);
  if (!session) {
    return c.json({ error: 'not_found', message: 'Session not found' }, 404);
  }

  // Check if session is not completed
  if (session.completedAt) {
    return c.json({ error: 'session_completed', message: 'Session is already completed' }, 400);
  }

  // Evaluate the answer (mock AI)
  const evaluation = mockEvaluate(content);
  const xpEarned = calculateXp(evaluation.score);

  // Create answer record
  const answerId = generateId();
  const answer: Answer = {
    id: answerId,
    questionId,
    content,
    score: evaluation.score,
    scoreDetail: evaluation.scoreDetail,
    feedback: evaluation.feedback,
    improvements: evaluation.improvements,
    timeSpentSeconds: timeSpentSeconds || null,
    createdAt: new Date().toISOString(),
  };

  // Update session
  session.answers.push(answer);
  session.totalXpEarned += xpEarned;
  session.questionsCount += 1;

  const result: AnswerResult = {
    answerId,
    score: evaluation.score,
    scoreDetail: evaluation.scoreDetail,
    feedback: evaluation.feedback,
    improvements: evaluation.improvements,
    xpEarned,
  };

  return c.json(result);
});

/**
 * POST /training/complete
 * Complete a training session
 */
training.post('/complete', zValidator('json', completeTrainingSchema), async (c) => {
  const { sessionId } = c.req.valid('json');

  // Check if session exists
  const session = sessions.get(sessionId);
  if (!session) {
    return c.json({ error: 'not_found', message: 'Session not found' }, 404);
  }

  // Check if session is not already completed
  if (session.completedAt) {
    return c.json({ error: 'session_completed', message: 'Session is already completed' }, 400);
  }

  // Check if there are any answers
  if (session.answers.length === 0) {
    return c.json({ error: 'no_answers', message: 'Cannot complete session without answers' }, 400);
  }

  // Complete the session
  session.completedAt = new Date().toISOString();

  // Calculate summary
  const averageScore = Math.round(
    session.answers.reduce((sum, a) => sum + (a.score || 0), 0) / session.answers.length
  );

  return c.json({
    sessionId: session.id,
    completedAt: session.completedAt,
    summary: {
      questionsCount: session.questionsCount,
      totalXpEarned: session.totalXpEarned,
      averageScore,
      duration: Math.round(
        (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
      ),
    },
  });
});

/**
 * GET /training/history
 * Get training history
 */
training.get('/history', zValidator('query', trainingHistoryQuerySchema), (c) => {
  const { limit, offset } = c.req.valid('query');

  // Get completed sessions (in real implementation, filter by user)
  const completedSessions = Array.from(sessions.values())
    .filter((s) => s.completedAt !== null)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  const total = completedSessions.length;
  const paginatedSessions = completedSessions.slice(offset, offset + limit);

  // Format for response
  const history = paginatedSessions.map((s) => ({
    sessionId: s.id,
    mode: s.mode,
    trainingType: s.trainingType,
    startedAt: s.startedAt,
    completedAt: s.completedAt,
    questionsCount: s.questionsCount,
    totalXpEarned: s.totalXpEarned,
    averageScore: s.answers.length > 0
      ? Math.round(s.answers.reduce((sum, a) => sum + (a.score || 0), 0) / s.answers.length)
      : 0,
  }));

  // Add some mock history if no real sessions exist
  if (history.length === 0 && offset === 0) {
    const mockHistory = [
      {
        sessionId: 'session-mock-001',
        mode: TrainingMode.BUSINESS,
        trainingType: TrainingType.STRUCTURED,
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000 + 900000).toISOString(),
        questionsCount: 3,
        totalXpEarned: 175,
        averageScore: 78,
      },
      {
        sessionId: 'session-mock-002',
        mode: TrainingMode.PRESENTATION,
        trainingType: TrainingType.QUICK,
        startedAt: new Date(Date.now() - 172800000).toISOString(),
        completedAt: new Date(Date.now() - 172800000 + 600000).toISOString(),
        questionsCount: 5,
        totalXpEarned: 225,
        averageScore: 72,
      },
      {
        sessionId: 'session-mock-003',
        mode: TrainingMode.BUSINESS,
        trainingType: TrainingType.STRUCTURED,
        startedAt: new Date(Date.now() - 259200000).toISOString(),
        completedAt: new Date(Date.now() - 259200000 + 1200000).toISOString(),
        questionsCount: 4,
        totalXpEarned: 300,
        averageScore: 85,
      },
    ];

    return c.json({
      sessions: mockHistory,
      total: mockHistory.length,
      limit,
      offset,
      hasMore: false,
    });
  }

  return c.json({
    sessions: history,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  });
});

/**
 * GET /training/session/:id
 * Get a specific session details
 */
training.get('/session/:id', (c) => {
  const sessionId = c.req.param('id');
  const session = sessions.get(sessionId);

  if (!session) {
    return c.json({ error: 'not_found', message: 'Session not found' }, 404);
  }

  return c.json({
    sessionId: session.id,
    mode: session.mode,
    trainingType: session.trainingType,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    questionsCount: session.questionsCount,
    totalXpEarned: session.totalXpEarned,
    answers: session.answers.map((a) => ({
      id: a.id,
      questionId: a.questionId,
      score: a.score,
      scoreDetail: a.scoreDetail,
      feedback: a.feedback,
      timeSpentSeconds: a.timeSpentSeconds,
      createdAt: a.createdAt,
    })),
  });
});

export default training;
