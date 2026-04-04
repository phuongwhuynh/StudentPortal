import { API_ENDPOINTS } from "../constants";
import { createQuestionMock, getQuestionByIdMock, getQuestionsMock } from "../mockHandlers";
import type { QuestionThread } from "../../types/content";

export async function listQuestions(): Promise<QuestionThread[]> {
  // Real API: GET ${API_ENDPOINTS.questions}
  return getQuestionsMock();
}

export async function createQuestion(title: string, body: string, category?: string): Promise<QuestionThread> {
  // Real API: POST ${API_ENDPOINTS.questions}
  return createQuestionMock(title, body, category);
}

export async function getQuestionById(id: string): Promise<QuestionThread | undefined> {
  // Real API: GET ${API_ENDPOINTS.questionById(id)}
  return getQuestionByIdMock(id);
}
