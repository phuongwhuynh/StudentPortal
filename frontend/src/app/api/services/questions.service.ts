import { API_ENDPOINTS } from "../constants";
/* Feature: Questions (Q&A)
  Endpoints:
  - GET ${API_ENDPOINTS.questions}                 -> list questions
  - POST ${API_ENDPOINTS.questions}                -> create question
  - GET ${API_ENDPOINTS.questionById(id)}          -> get question by id
  - POST ${API_ENDPOINTS.questionReplies(id)}     -> add reply to question
  - POST ${API_ENDPOINTS.questionById(id)}/likes   -> toggle like for a question
  - GET ${API_ENDPOINTS.questionById(id)}/likes/me -> check if current user liked the question
  - PATCH ${API_ENDPOINTS.questionStatus(id)}      -> change question status (resolve)
*/
import { acceptQuestionMock, addQuestionReplyMock, createQuestionMock, getQuestionByIdMock, getQuestionsMock } from "../mockHandlers";
import { toggleQuestionCommentLikeMock, isCommentLikedByUserMock, toggleQuestionLikeMock, isQuestionLikedByUserMock } from "../mockHandlers";
import type { QuestionThread } from "../../types/content";
import type { User } from "../../types/auth";

export async function listQuestions(options?: { q?: string; category?: string; sort?: "asc" | "desc" }): Promise<QuestionThread[]> {
  // Real API: GET ${API_ENDPOINTS.questions}
  return getQuestionsMock(options);
}

export async function toggleCommentLike(commentId: string, user: User): Promise<QuestionThread> {
  return toggleQuestionCommentLikeMock(commentId, user);
}

export async function isCommentLiked(commentId: string, userId: string): Promise<boolean> {
  return isCommentLikedByUserMock(commentId, userId);
}

// Feature: Question Likes
// URLs:
// - GET ${API_ENDPOINTS.questionById(id)}/likes/me -> check if current user liked the question
// - POST ${API_ENDPOINTS.questionById(id)}/likes -> toggle like for the question
export async function toggleQuestionLike(questionId: string, user: User): Promise<QuestionThread> {
  // Real API: POST ${API_ENDPOINTS.questionById(questionId)}/likes
  return toggleQuestionLikeMock(questionId, user);
}

export async function isQuestionLiked(questionId: string, userId: string): Promise<boolean> {
  // Real API: GET ${API_ENDPOINTS.questionById(questionId)}/likes/me
  return isQuestionLikedByUserMock(questionId, userId);
}

export async function createQuestion(title: string, body: string, category?: string): Promise<QuestionThread> {
  // Real API: POST ${API_ENDPOINTS.questions}
  return createQuestionMock(title, body, category);
}

export async function getQuestionById(id: string): Promise<QuestionThread | undefined> {
  // Real API: GET ${API_ENDPOINTS.questionById(id)}
  return getQuestionByIdMock(id);
}

export async function addQuestionReply(id: string, body: string, user: User): Promise<QuestionThread> {
  // Real API: POST ${API_ENDPOINTS.questionReplies(id)}
  return addQuestionReplyMock(id, body, user);
}

export async function acceptQuestion(id: string, user: User): Promise<QuestionThread> {
  // Real API: PATCH ${API_ENDPOINTS.questionStatus(id)}
  return acceptQuestionMock(id, user);
}
