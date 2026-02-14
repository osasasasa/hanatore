import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  questionsQuerySchema,
  type Question,
  TrainingMode,
  TrainingType,
} from '../types.js';

const questions = new Hono();

// Mock questions data
const mockQuestions: Question[] = [
  // BUSINESS - STRUCTURED
  {
    id: 'q-001',
    mode: TrainingMode.BUSINESS,
    trainingType: TrainingType.STRUCTURED,
    method: 'PREP',
    title: '上司に進捗報告をしてください。プロジェクトは予定より1週間遅れています。',
    context: 'あなたは新規サービス開発プロジェクトのリーダーです。週次ミーティングで上司に状況を報告する場面です。',
    hint: 'PREP法を使いましょう: Point(結論) → Reason(理由) → Example(具体例) → Point(結論)',
    sampleAnswer: '結論から申し上げますと、プロジェクトは1週間遅延しております。理由は、外部APIの仕様変更により追加開発が必要になったためです。具体的には、認証フローの再実装に3日、テストに2日を要しました。したがって、リリースは来週金曜日となる見込みです。',
    difficulty: 2,
    isPremium: false,
  },
  {
    id: 'q-002',
    mode: TrainingMode.BUSINESS,
    trainingType: TrainingType.STRUCTURED,
    method: 'PREP',
    title: '新しいツールの導入を提案してください。',
    context: 'チームの生産性向上のため、新しいプロジェクト管理ツールの導入を提案します。',
    hint: 'なぜ必要か、どんなメリットがあるかを具体的に説明しましょう。',
    sampleAnswer: null,
    difficulty: 2,
    isPremium: false,
  },
  // BUSINESS - QUICK
  {
    id: 'q-003',
    mode: TrainingMode.BUSINESS,
    trainingType: TrainingType.QUICK,
    method: null,
    title: '会議の終了時間が迫っています。議論をまとめてください。',
    context: '1時間の会議の残り5分。まだ結論が出ていません。',
    hint: '30秒以内に、決定事項・保留事項・次のアクションをまとめましょう。',
    sampleAnswer: null,
    difficulty: 3,
    isPremium: false,
  },
  // PRESENTATION - STRUCTURED
  {
    id: 'q-004',
    mode: TrainingMode.PRESENTATION,
    trainingType: TrainingType.STRUCTURED,
    method: 'STAR',
    title: '前職での成功体験を面接官に説明してください。',
    context: '転職面接で、これまでの実績をアピールする場面です。',
    hint: 'STAR法を使いましょう: Situation(状況) → Task(課題) → Action(行動) → Result(結果)',
    sampleAnswer: null,
    difficulty: 3,
    isPremium: false,
  },
  {
    id: 'q-005',
    mode: TrainingMode.PRESENTATION,
    trainingType: TrainingType.STRUCTURED,
    method: '5W1H',
    title: '新サービスの企画を経営陣にプレゼンしてください。',
    context: '3分間で新規事業の概要を伝える必要があります。',
    hint: '5W1Hで整理: Why(なぜ) → What(何を) → Who(誰に) → When(いつ) → Where(どこで) → How(どうやって)',
    sampleAnswer: null,
    difficulty: 4,
    isPremium: true,
  },
  // ONE_ON_ONE - AI_DIALOG
  {
    id: 'q-006',
    mode: TrainingMode.ONE_ON_ONE,
    trainingType: TrainingType.AI_DIALOG,
    method: null,
    title: '部下のモチベーション低下について話し合います。',
    context: '最近、部下の仕事への意欲が下がっているように見えます。1on1で状況を聞き出しましょう。',
    hint: '傾聴を心がけ、オープンクエスチョンを使いましょう。',
    sampleAnswer: null,
    difficulty: 3,
    isPremium: true,
  },
  // DAILY_TALK - QUICK
  {
    id: 'q-007',
    mode: TrainingMode.DAILY_TALK,
    trainingType: TrainingType.QUICK,
    method: null,
    title: '初対面の人と雑談をしてください。',
    context: '社内の懇親会で、他部署の人と話すことになりました。',
    hint: '相手に興味を持ち、質問を交えながら会話を広げましょう。',
    sampleAnswer: null,
    difficulty: 1,
    isPremium: false,
  },
  // THINKING - STRUCTURED
  {
    id: 'q-008',
    mode: TrainingMode.THINKING,
    trainingType: TrainingType.STRUCTURED,
    method: 'ロジックツリー',
    title: '売上が下がった原因を分析してください。',
    context: '前月比で売上が20%減少しました。原因を特定する必要があります。',
    hint: 'ロジックツリーで要因を分解: 売上 = 客数 × 客単価 → それぞれの要因を深掘り',
    sampleAnswer: null,
    difficulty: 4,
    isPremium: true,
  },
  {
    id: 'q-009',
    mode: TrainingMode.BUSINESS,
    trainingType: TrainingType.QUICK,
    method: null,
    title: 'エレベーターピッチ: 30秒で自己紹介をしてください。',
    context: 'カンファレンスで偶然、業界の有名人とエレベーターで一緒になりました。',
    hint: '自分の強みと相手へのメリットを簡潔に伝えましょう。',
    sampleAnswer: null,
    difficulty: 2,
    isPremium: false,
  },
  {
    id: 'q-010',
    mode: TrainingMode.PRESENTATION,
    trainingType: TrainingType.QUICK,
    method: null,
    title: '急な質問に答えてください: 「なぜ御社を志望しましたか？」',
    context: '面接で予想外の質問をされました。',
    hint: '結論から話し、具体的なエピソードを添えましょう。',
    sampleAnswer: null,
    difficulty: 2,
    isPremium: false,
  },
];

/**
 * GET /questions/daily
 * Get today's recommended questions
 */
questions.get('/daily', (c) => {
  // Return 3-5 questions as daily recommendations
  // In real implementation, this would be personalized based on user history
  const dailyQuestions = mockQuestions
    .filter((q) => !q.isPremium)
    .slice(0, 5)
    .map(({ sampleAnswer, ...q }) => q); // Exclude sample answers

  return c.json({
    date: new Date().toISOString().split('T')[0],
    questions: dailyQuestions,
    totalCount: dailyQuestions.length,
  });
});

/**
 * GET /questions
 * Get questions list with optional filters
 */
questions.get('/', zValidator('query', questionsQuerySchema), (c) => {
  const { mode, trainingType, difficulty, limit, offset } = c.req.valid('query');

  let filteredQuestions = [...mockQuestions];

  // Apply filters
  if (mode) {
    filteredQuestions = filteredQuestions.filter((q) => q.mode === mode);
  }
  if (trainingType) {
    filteredQuestions = filteredQuestions.filter((q) => q.trainingType === trainingType);
  }
  if (difficulty) {
    filteredQuestions = filteredQuestions.filter((q) => q.difficulty === difficulty);
  }

  // Get total before pagination
  const total = filteredQuestions.length;

  // Apply pagination
  filteredQuestions = filteredQuestions.slice(offset, offset + limit);

  // Remove sample answers from response
  const questionsWithoutAnswers = filteredQuestions.map(({ sampleAnswer, ...q }) => q);

  return c.json({
    questions: questionsWithoutAnswers,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  });
});

/**
 * GET /questions/:id
 * Get a specific question by ID
 */
questions.get('/:id', (c) => {
  const id = c.req.param('id');
  const question = mockQuestions.find((q) => q.id === id);

  if (!question) {
    return c.json({ error: 'not_found', message: 'Question not found' }, 404);
  }

  // Remove sample answer from response
  const { sampleAnswer, ...questionWithoutAnswer } = question;

  return c.json(questionWithoutAnswer);
});

export default questions;
