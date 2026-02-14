import { isGeminiAvailable, generateJSON } from '../lib/gemini.js';

/**
 * AI採点サービス
 * Gemini APIを使用して回答を採点し、フィードバックを生成
 */

// 採点結果の型定義
export interface ScoreDetail {
  specificity: number;  // 具体性 (0-100)
  structure: number;    // 構造 (0-100)
  persuasiveness: number; // 説得力 (0-100)
}

export interface EvaluationResult {
  score: number;           // 総合スコア (0-100)
  scoreDetail: ScoreDetail;
  feedback: string;        // フィードバックコメント
  improvements: string[];  // 改善点のリスト
  xpEarned: number;        // 獲得XP
}

// 採点リクエストの型定義
export interface EvaluationRequest {
  question: string;        // 質問文
  answer: string;          // ユーザーの回答
  method?: string;         // 使用メソッド (PREP, STAR, DESC等)
  mode?: string;           // モード (business, casual)
  difficulty?: number;     // 難易度 (1-5)
}

/**
 * 採点プロンプトを生成
 */
function buildEvaluationPrompt(request: EvaluationRequest): string {
  const methodDescription = getMethodDescription(request.method);

  return `あなたは話し方トレーニングアプリの採点AIです。
以下の回答を採点し、JSON形式でフィードバックを返してください。

## 質問
${request.question}

## 使用メソッド
${request.method || '指定なし'}
${methodDescription}

## ユーザーの回答
${request.answer}

## 採点基準

### 1. 具体性 (specificity): 0-100点
- 抽象的な表現を避け、具体的なエピソードや数字があるか
- 「いい感じ」「頑張った」などの曖昧な表現を避けているか
- 5W1Hが明確か

### 2. 構造 (structure): 0-100点
- 指定されたメソッド（${request.method || 'なし'}）に沿っているか
- 論理的な流れがあるか
- 冗長な部分がないか

### 3. 説得力 (persuasiveness): 0-100点
- 理由や根拠が明確か
- 相手の立場を考慮しているか
- 結論が明確か

## 出力形式
以下のJSON形式で回答してください：

\`\`\`json
{
  "specificity": <0-100の整数>,
  "structure": <0-100の整数>,
  "persuasiveness": <0-100の整数>,
  "feedback": "<2-3文の総合フィードバック（日本語）>",
  "improvements": ["<改善点1>", "<改善点2>", "<改善点3>"]
}
\`\`\`

注意:
- 各スコアは0-100の整数で返してください
- feedbackは励ましつつ具体的な改善点を示してください
- improvementsは1-3個の簡潔な改善提案を返してください
- 回答が短すぎる場合や質問に答えていない場合は低いスコアをつけてください`;
}

/**
 * メソッドの説明を取得
 */
function getMethodDescription(method?: string): string {
  const descriptions: Record<string, string> = {
    PREP: `PREP法:
- P (Point): 結論を先に述べる
- R (Reason): 理由を説明する
- E (Example): 具体例を挙げる
- P (Point): 結論を繰り返す`,

    STAR: `STAR法:
- S (Situation): 状況を説明する
- T (Task): 課題・目標を述べる
- A (Action): 取った行動を説明する
- R (Result): 結果を述べる`,

    DESC: `DESC法:
- D (Describe): 状況を客観的に描写する
- E (Express): 自分の気持ちを表現する
- S (Specify): 具体的な提案をする
- C (Consequences): 結果や影響を述べる`,

    SDS: `SDS法:
- S (Summary): 要約を述べる
- D (Details): 詳細を説明する
- S (Summary): 再度要約する`,
  };

  return method && descriptions[method] ? descriptions[method] : '特定のフォーマットなし';
}

/**
 * XPを計算
 */
function calculateXP(score: number, difficulty: number = 1): number {
  const baseXP = 10;
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.2; // 1.0 ~ 1.8
  const scoreMultiplier = score / 100;

  return Math.round(baseXP * difficultyMultiplier * scoreMultiplier * 10);
}

/**
 * モックレスポンスを生成（APIキーがない場合）
 */
function generateMockResponse(request: EvaluationRequest): EvaluationResult {
  // 回答の長さに基づいて基本スコアを計算
  const answerLength = request.answer.length;
  const baseScore = Math.min(answerLength / 5, 100);

  // 具体性: 数字や具体的な単語が含まれているか
  const hasNumbers = /[0-9０-９]/.test(request.answer);
  const hasSpecificWords = /(具体的|例えば|特に|実際|結果)/.test(request.answer);
  const specificity = Math.min(
    baseScore + (hasNumbers ? 15 : 0) + (hasSpecificWords ? 10 : 0),
    100
  );

  // 構造: メソッドに関連するキーワードがあるか
  const methodKeywords: Record<string, RegExp> = {
    PREP: /(結論|理由|例|具体例|したがって)/,
    STAR: /(状況|課題|行動|結果)/,
    DESC: /(状況|気持ち|提案|影響)/,
    SDS: /(要約|詳細|まとめ)/,
  };
  const methodRegex = request.method && methodKeywords[request.method];
  const hasStructure = methodRegex ? methodRegex.test(request.answer) : false;
  const structure = Math.min(baseScore + (hasStructure ? 20 : 0), 100);

  // 説得力: 理由や根拠を示す言葉があるか
  const hasReasoning = /(なぜなら|理由|から|ため|よって|したがって)/.test(request.answer);
  const persuasiveness = Math.min(baseScore + (hasReasoning ? 15 : 0), 100);

  // 総合スコア
  const score = Math.round((specificity + structure + persuasiveness) / 3);

  // フィードバック生成
  let feedback = '';
  const improvements: string[] = [];

  if (score >= 80) {
    feedback = '素晴らしい回答です！構造的で具体的な内容になっています。';
  } else if (score >= 60) {
    feedback = '良い回答です。いくつかのポイントを改善するとさらに良くなります。';
    if (!hasNumbers) {
      improvements.push('具体的な数字やデータを入れるとより説得力が増します');
    }
    if (!hasStructure && request.method) {
      improvements.push(`${request.method}法の構造をより意識してみましょう`);
    }
  } else if (score >= 40) {
    feedback = '基本的なポイントは押さえていますが、改善の余地があります。';
    improvements.push('結論を最初に述べることを意識してみましょう');
    if (!hasNumbers) {
      improvements.push('具体的な数字やエピソードを追加しましょう');
    }
    if (!hasReasoning) {
      improvements.push('理由や根拠を明確に示しましょう');
    }
  } else {
    feedback = '回答をより具体的に、構造的にすることで大きく改善できます。';
    improvements.push('まず結論を明確にしましょう');
    improvements.push('具体的なエピソードや数字を入れましょう');
    improvements.push('理由を「なぜなら」を使って説明しましょう');
  }

  const xpEarned = calculateXP(score, request.difficulty);

  return {
    score: Math.round(score),
    scoreDetail: {
      specificity: Math.round(specificity),
      structure: Math.round(structure),
      persuasiveness: Math.round(persuasiveness),
    },
    feedback,
    improvements: improvements.slice(0, 3),
    xpEarned,
  };
}

/**
 * 回答を採点する（メイン関数）
 */
export async function evaluateAnswer(request: EvaluationRequest): Promise<EvaluationResult> {
  // APIキーがない場合はモックレスポンスを返す
  if (!isGeminiAvailable()) {
    console.log('[AI Service] Gemini API key not found, using mock response');
    return generateMockResponse(request);
  }

  try {
    const prompt = buildEvaluationPrompt(request);

    interface GeminiResponse {
      specificity: number;
      structure: number;
      persuasiveness: number;
      feedback: string;
      improvements: string[];
    }

    const response = await generateJSON<GeminiResponse>(prompt);

    // スコアを0-100の範囲に正規化
    const specificity = Math.max(0, Math.min(100, response.specificity));
    const structure = Math.max(0, Math.min(100, response.structure));
    const persuasiveness = Math.max(0, Math.min(100, response.persuasiveness));

    // 総合スコアを計算
    const score = Math.round((specificity + structure + persuasiveness) / 3);

    // XPを計算
    const xpEarned = calculateXP(score, request.difficulty);

    return {
      score,
      scoreDetail: {
        specificity,
        structure,
        persuasiveness,
      },
      feedback: response.feedback,
      improvements: response.improvements.slice(0, 3),
      xpEarned,
    };
  } catch (error) {
    console.error('[AI Service] Error evaluating answer:', error);
    // エラー時はモックレスポンスにフォールバック
    return generateMockResponse(request);
  }
}

/**
 * 複数の回答を一括採点
 */
export async function evaluateAnswers(
  requests: EvaluationRequest[]
): Promise<EvaluationResult[]> {
  return Promise.all(requests.map((request) => evaluateAnswer(request)));
}
