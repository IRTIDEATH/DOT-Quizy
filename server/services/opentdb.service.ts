import { decode } from 'html-entities';
import { QuizQuestion } from '../types/question';
import { 
  OpenTDBResponse, 
  OpenTDBCategoriesResponse, 
  OpenTDBQuestion,
  OPENTDB_RESPONSE_CODES,
  FetchQuestionsParams,
  FetchQuestionsResult,
} from '../types/opentdb';

const OPENTDB_BASE_URL = 'https://opentdb.com';

function decodeHtml(text: string): string {
  return decode(text);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function transformQuestion(question: OpenTDBQuestion): QuizQuestion {
  const correctAnswer = decodeHtml(question.correct_answer);
  const incorrectAnswers = question.incorrect_answers.map(decodeHtml);
  
  const allOptions = shuffleArray([correctAnswer, ...incorrectAnswers]);
  
  return {
    id: generateQuestionId(),
    question: decodeHtml(question.question),
    options: allOptions,
    correctAnswer: correctAnswer,
    category: decodeHtml(question.category),
    difficulty: question.difficulty,
    type: question.type,
  };
}

function getResponseCodeMessage(code: number): string {
  switch (code) {
    case OPENTDB_RESPONSE_CODES.SUCCESS:
      return 'Success';
    case OPENTDB_RESPONSE_CODES.NO_RESULTS:
      return 'Not enough questions available for the specified parameters';
    case OPENTDB_RESPONSE_CODES.INVALID_PARAMETER:
      return 'Invalid parameter provided';
    case OPENTDB_RESPONSE_CODES.TOKEN_NOT_FOUND:
      return 'Session token not found';
    case OPENTDB_RESPONSE_CODES.TOKEN_EMPTY:
      return 'Session token exhausted - all questions retrieved';
    case OPENTDB_RESPONSE_CODES.RATE_LIMIT:
      return 'Too many requests - please wait 5 seconds and try again';
    default:
      return 'Unknown error from trivia service';
  }
}

export async function fetchCategories(): Promise<OpenTDBCategoriesResponse> {
  const response = await fetch(`${OPENTDB_BASE_URL}/api_category.php`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchQuestions(params: FetchQuestionsParams): Promise<FetchQuestionsResult> {
  const queryParams = new URLSearchParams({
    amount: String(Math.min(Math.max(params.amount, 1), 50)),
  });
  
  if (params.category) {
    queryParams.append('category', String(params.category));
  }
  
  if (params.difficulty) {
    queryParams.append('difficulty', params.difficulty);
  }
  
  if (params.type) {
    queryParams.append('type', params.type);
  }
  
  const url = `${OPENTDB_BASE_URL}/api.php?${queryParams.toString()}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    return {
      success: false,
      questions: [],
      error: `HTTP error: ${response.statusText}`,
    };
  }
  
  const data: OpenTDBResponse = await response.json();
  
  if (data.response_code !== OPENTDB_RESPONSE_CODES.SUCCESS) {
    return {
      success: false,
      questions: [],
      error: getResponseCodeMessage(data.response_code),
      responseCode: data.response_code,
    };
  }
  
  const questions = data.results.map(transformQuestion);
  
  return {
    success: true,
    questions,
  };
}

export async function getCategoryNameById(categoryId: number): Promise<string | null> {
  try {
    const { trivia_categories } = await fetchCategories();
    const category = trivia_categories.find(c => c.id === categoryId);
    return category?.name ?? null;
  } catch {
    return null;
  }
}
