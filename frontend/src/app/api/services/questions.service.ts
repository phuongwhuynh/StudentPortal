import { API_ENDPOINTS } from "../constants";
import { getContentComments } from "./comments.service";
import { requestJson } from "../http";
import type { QuestionThread } from "../../types/content";
import type { User } from "../../types/auth";

type BackendUserRef = {
  id: number;
  name: string;
  role: string;
};

type BackendQuestion = {
  id: number;
  title: string;
  body: string;
  category: string;
  status: string;
  posted_by: BackendUserRef;
  answerer?: BackendUserRef | null;
  completed_at?: string | null;
  created_at: string;
  views_count: number;
  comments_count: number;
  likes_count: number;
  has_liked: boolean;
  latest_comment?: {
    id: number;
    content: string;
    posted_by: BackendUserRef;
    created_at: string;
  } | null;
};

type BackendQuestionList = {
  questions: BackendQuestion[];
};

const questionListUrl = API_ENDPOINTS.question;
const questionByIdUrl = (id: string) => API_ENDPOINTS.questionById(id);

const normalizeQuestionStatus = (status: string): QuestionThread["status"] => {
  const next = status.toLowerCase();
  if (next === "completed") return "completed";
  if (next === "cancelled") return "cancelled";
  return "in-progress";
};

const normalizeQuestion = (question: BackendQuestion): QuestionThread => ({
  id: String(question.id),
  title: question.title,
  body: question.body,
  category: question.category,
  status: normalizeQuestionStatus(question.status),
  postedBy: {
    id: String(question.posted_by.id),
    displayName: question.posted_by.name,
    role: question.posted_by.role as User["role"],
  },
  answeredBy: question.answerer
    ? {
        id: String(question.answerer.id),
        displayName: question.answerer.name,
        role: question.answerer.role as User["role"],
      }
    : null,
  createdAt: question.created_at,
  repliedAt: question.latest_comment?.created_at ?? null,
  completedAt: question.completed_at ?? null,
  cancelledAt: null,
  deletedAt: null,
  deletedBy: null,
  counts: {
    views: question.views_count,
    likes: question.likes_count,
    comments: question.comments_count,
  },
  tags: [],
  comments: [],
});

async function fetchBackendQuestion(id: string): Promise<BackendQuestion> {
  return requestJson<BackendQuestion>([questionByIdUrl(id)], { method: "GET" });
}

export async function listQuestions(options?: { q?: string; category?: string; sort?: "asc" | "desc" }): Promise<QuestionThread[]> {
  const searchParams = new URLSearchParams();
  if (options?.q?.trim()) {
    searchParams.set("search", options.q.trim());
  }
  if (options?.category && options.category !== "all") {
    searchParams.set("category", options.category);
  }
  if (options?.sort) {
    searchParams.set("sort_by", options.sort === "asc" ? "recent" : "trending");
  }

  const url = new URL(questionListUrl);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const response = await requestJson<BackendQuestionList | BackendQuestion[]>([url.toString()], {
    method: "GET",
  });
  const questions = Array.isArray(response) ? response : response.questions;
  return questions.map(normalizeQuestion);
}

export async function countQuestions(postedOn?: string): Promise<number> {
  try {
    const url = `${API_ENDPOINTS.question}/count${postedOn ? `?posted_on=${encodeURIComponent(postedOn)}` : ""}`;
    const response = await requestJson<{ count: number }>([url], { method: "GET" });
    return response.count ?? 0;
  } catch {
    return 0;
  }
}

export async function toggleCommentLike(_commentId: string, _user: User): Promise<QuestionThread> {
  throw new Error("Comment like is not supported by backend API");
}

export async function isCommentLiked(_commentId: string, _userId: string): Promise<boolean> {
  return false;
}

// Feature: Question Likes
// URLs:
// - GET ${API_ENDPOINTS.questionById(id)}/likes/me -> check if current user liked the question
// - POST ${API_ENDPOINTS.questionById(id)}/likes -> toggle like for the question
export async function toggleQuestionLike(questionId: string, _user: User): Promise<QuestionThread> {
  const question = await fetchBackendQuestion(questionId);
  await requestJson<unknown>([API_ENDPOINTS.questionLike(questionId)], {
    method: question.has_liked ? "DELETE" : "POST",
  });
  const updatedQuestion = await getQuestionById(questionId);
  if (updatedQuestion) {
    return updatedQuestion;
  }
  throw new Error("Question not found after updating like state");
}

export async function isQuestionLiked(questionId: string, _userId: string): Promise<boolean> {
  const question = await fetchBackendQuestion(questionId);
  return question.has_liked;
}

export async function createQuestion(title: string, body: string, category?: string): Promise<QuestionThread> {
  const response = await requestJson<BackendQuestion>([questionListUrl], {
    method: "POST",
    body: { title, body, category },
  });
  return normalizeQuestion(response);
}

export async function getQuestionById(id: string): Promise<QuestionThread | undefined> {
  const response = await fetchBackendQuestion(id);
  const question = normalizeQuestion(response);
  question.comments = await getContentComments("question", id);
  return question;
}

export async function addQuestionReply(id: string, body: string, _user: User): Promise<QuestionThread> {
  const contentId = Number(id);
  await requestJson<unknown>([API_ENDPOINTS.commentCreate], {
    method: "POST",
    body: {
      comment: body,
      content_id: contentId,
      content_type: "question",
      parent_comment_id: null,
    },
  });
  const updatedQuestion = await getQuestionById(id);
  if (updatedQuestion) {
    return updatedQuestion;
  }
  throw new Error("Question not found after posting reply");
}

export async function addQuestionReplyToComment(id: string, body: string, _user: User, parentCommentId: string | null = null): Promise<QuestionThread> {
  const contentId = Number(id);
  const parentId = parentCommentId === null ? null : Number(parentCommentId);
  await requestJson<unknown>([API_ENDPOINTS.commentCreate], {
    method: "POST",
    body: {
      comment: body,
      content_id: contentId,
      content_type: "question",
      parent_comment_id: parentId,
    },
  });
  const updatedQuestion = await getQuestionById(id);
  if (updatedQuestion) {
    return updatedQuestion;
  }
  throw new Error("Question not found after posting reply");
}

export async function acceptQuestion(id: string, _user: User): Promise<QuestionThread> {
  await requestJson<unknown>([API_ENDPOINTS.questionResolve(id)], {
    method: "POST",
  });
  const updatedQuestion = await getQuestionById(id);
  if (updatedQuestion) {
    return updatedQuestion;
  }
  throw new Error("Question not found after resolving");
}

export async function incrementQuestionView(id: string): Promise<void> {
  await requestJson<unknown>([API_ENDPOINTS.questionView(id)], { method: "POST" });
}

export async function deleteQuestion(id: string): Promise<void> {
  await requestJson<unknown>([API_ENDPOINTS.questionById(id)], { method: "DELETE" });
}
