import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

/**
 * Gemini APIクライアント
 * 環境変数GEMINI_API_KEYを使用
 */

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/**
 * Gemini APIの初期化状態を確認
 */
export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Gemini APIクライアントを取得
 */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Gemini Proモデルを取得
 */
export function getGeminiModel(): GenerativeModel {
  if (!model) {
    const client = getGeminiClient();
    model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
}

/**
 * テキスト生成を実行
 */
export async function generateText(prompt: string): Promise<string> {
  const geminiModel = getGeminiModel();
  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * JSON形式でレスポンスを生成
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
  const geminiModel = getGeminiModel();
  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // JSONブロックを抽出
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonString = jsonMatch ? jsonMatch[1] : text;

  try {
    return JSON.parse(jsonString.trim()) as T;
  } catch (error) {
    // JSONパースに失敗した場合、テキスト全体をパース試行
    const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
    return JSON.parse(cleanedText) as T;
  }
}
