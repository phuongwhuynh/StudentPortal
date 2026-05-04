import type { AnnouncementPost, Comment, ForumThread, QuestionThread } from "../types/content";
import type { LoginPayload, RegisterStaffPayload, User } from "../types/auth";
import { announcements, forumThreads, mockUsers, questions } from "./mockDb";
import type { MockCredentials, MockStaffRegistration } from "./mockDb";

const forumLikeByUser: Record<string, Set<string>> = {};
const commentLikeByUser: Record<string, Set<string>> = {};
const questionLikeByUser: Record<string, Set<string>> = {};

const delay = async <T,>(value: T, ms = 180): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const stripPassword = (user: (typeof mockUsers)[number]): User => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  role: user.role,
});

export async function loginMock(payload: LoginPayload): Promise<User> {
  const user = mockUsers.find((item) => item.email.toLowerCase() === payload.email.toLowerCase() && item.password === payload.password);
  if (!user) {
    throw new Error("Invalid email or password");
  }
  return delay(stripPassword(user));
}

export async function logoutMock(): Promise<true> {
  return delay(true);
}

export async function registerStaffMock(payload: RegisterStaffPayload): Promise<User> {
  const exists = mockUsers.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) {
    throw new Error("Account already exists");
  }

  const newUser = {
    id: makeId("staff"),
    email: payload.email,
    password: payload.password,
    displayName: payload.displayName,
    role: "staff" as const,
  };

  mockUsers.push(newUser);
  return delay(stripPassword(newUser));
}

export async function getForumsMock(): Promise<ForumThread[]> {
  return delay(forumThreads);
}

export async function getForumByIdMock(id: string): Promise<ForumThread | undefined> {
  return delay(forumThreads.find((item) => item.id === id));
}

export async function getAnnouncementsMock(): Promise<AnnouncementPost[]> {
  return delay(announcements);
}

export async function getAnnouncementByIdMock(id: string): Promise<AnnouncementPost | undefined> {
  return delay(announcements.find((item) => item.id === id));
}

export async function getQuestionsMock(options?: { q?: string; category?: string; sort?: "asc" | "desc" }): Promise<QuestionThread[]> {
  let results = [...questions];

  // Filter by category
  if (options?.category && options.category !== "all") {
    results = results.filter((it) => it.category === options.category);
  }

  // Search (simple contains on title/body/tags)
  if (options?.q) {
    const q = options.q.toLowerCase();
    results = results.filter((it) => {
      return (
        it.title.toLowerCase().includes(q) ||
        it.body.toLowerCase().includes(q) ||
        it.tags.some((t) => t.toLowerCase().includes(q)) ||
        it.comments.some((c) => c.body.toLowerCase().includes(q))
      );
    });
  }

  // Sort by createdAt
  results.sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return (options?.sort === "asc" ? ta - tb : tb - ta);
  });

  return delay(results);
}

export async function getQuestionByIdMock(id: string): Promise<QuestionThread | undefined> {
  return delay(questions.find((item) => item.id === id));
}

export async function createForumMock(title: string, body: string, category = "General"): Promise<ForumThread> {
  const item: ForumThread = {
    id: makeId("forum"),
    title,
    body,
    category,
    postedBy: { id: "student-1", displayName: "Alex Nguyen", role: "student" },
    createdAt: new Date().toISOString(),
    counts: { views: 0, likes: 0, comments: 0 },
    tags: [],
    isPinned: false,
    comments: [],
  };
  forumThreads.unshift(item);
  return delay(item);
}

export async function createAnnouncementMock(title: string, body: string, category = "General", expiresAt?: string | null): Promise<AnnouncementPost> {
  const item: AnnouncementPost = {
    id: makeId("ann"),
    title,
    body,
    category,
    priority: "info",
    postedBy: { id: "staff-1", displayName: "Admin Office", role: "staff" },
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt ?? null,
    counts: { views: 0, likes: 0, comments: 0 },
    tags: [],
    comments: [],
  };
  announcements.unshift(item);
  return delay(item);
}

export async function createQuestionMock(title: string, body: string, category = "General"): Promise<QuestionThread> {
  const item: QuestionThread = {
    id: makeId("q"),
    title,
    body,
    category,
    status: "in-progress",
    postedBy: { id: "student-1", displayName: "Alex Nguyen", role: "student" },
    createdAt: new Date().toISOString(),
    counts: { views: 0, likes: 0, comments: 0 },
    tags: [],
    comments: [],
  };
  questions.unshift(item);
  // notify listeners that questions changed
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("questions-updated"));
  return delay(item);
}

export async function addForumCommentMock(threadId: string, body: string, user: User): Promise<ForumThread> {
  const thread = forumThreads.find((item) => item.id === threadId);
  if (!thread) {
    throw new Error("Forum thread not found");
  }

  const comment: Comment = {
    id: makeId("forum-c"),
    contentType: "forum",
    contentId: thread.id,
    parentCommentId: null,
    body,
    postedBy: { id: user.id, displayName: user.displayName, role: user.role },
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  thread.comments.push(comment);
  thread.counts.comments += 1;
  thread.repliedAt = comment.createdAt;
  return delay(thread);
}

export async function addQuestionReplyMock(questionId: string, body: string, user: User): Promise<QuestionThread> {
  const question = questions.find((item) => item.id === questionId);
  if (!question) {
    throw new Error("Question not found");
  }

  if (question.status === "completed") {
    throw new Error("This Q&A is already accepted. New replies are disabled.");
  }

  const now = new Date().toISOString();
  const comment: Comment = {
    id: makeId("q-c"),
    contentType: "question",
    contentId: question.id,
    parentCommentId: null,
    body,
    postedBy: { id: user.id, displayName: user.displayName, role: user.role },
    createdAt: now,
    repliedAt: user.role === "staff" ? now : null,
    repliedBy: user.role === "staff" ? { id: user.id, displayName: user.displayName, role: user.role } : null,
    likes: 0,
  };

  question.comments.push(comment);
  question.counts.comments += 1;
  question.repliedAt = now;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("questions-updated"));
  return delay(question);
}

export async function acceptQuestionMock(questionId: string, user: User): Promise<QuestionThread> {
  if (user.role !== "staff") {
    throw new Error("Only staff can accept Q&A questions");
  }

  const question = questions.find((item) => item.id === questionId);
  if (!question) {
    throw new Error("Question not found");
  }

  if (question.comments.length < 1) {
    throw new Error("At least one answer is required before accepting");
  }

  question.status = "completed";
  question.completedAt = new Date().toISOString();
  question.answeredBy = { id: user.id, displayName: user.displayName, role: user.role };
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("questions-updated"));
  return delay(question);
}

export async function toggleForumLikeMock(threadId: string, user: User): Promise<ForumThread> {
  const thread = forumThreads.find((item) => item.id === threadId);
  if (!thread) {
    throw new Error("Forum thread not found");
  }

  const likedSet = forumLikeByUser[threadId] ?? new Set<string>();
  forumLikeByUser[threadId] = likedSet;

  if (likedSet.has(user.id)) {
    likedSet.delete(user.id);
    thread.counts.likes = Math.max(0, thread.counts.likes - 1);
  } else {
    likedSet.add(user.id);
    thread.counts.likes += 1;
  }

  return delay(thread);
}

export async function isForumLikedByUserMock(threadId: string, userId: string): Promise<boolean> {
  const likedSet = forumLikeByUser[threadId];
  return delay(Boolean(likedSet?.has(userId)));
}

export async function toggleQuestionLikeMock(questionId: string, user: User): Promise<QuestionThread> {
  const question = questions.find((item) => item.id === questionId);
  if (!question) throw new Error("Question not found");

  const likedSet = questionLikeByUser[questionId] ?? new Set<string>();
  questionLikeByUser[questionId] = likedSet;

  if (likedSet.has(user.id)) {
    likedSet.delete(user.id);
    question.counts.likes = Math.max(0, question.counts.likes - 1);
  } else {
    likedSet.add(user.id);
    question.counts.likes += 1;
  }

  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("questions-updated"));
  return delay(question);
}

export async function isQuestionLikedByUserMock(questionId: string, userId: string): Promise<boolean> {
  const likedSet = questionLikeByUser[questionId];
  return delay(Boolean(likedSet?.has(userId)));
}

export async function toggleQuestionCommentLikeMock(commentId: string, user: User): Promise<QuestionThread> {
  // find the question containing this comment
  for (const q of questions) {
    const comment = q.comments.find((c) => c.id === commentId);
    if (comment) {
      const likedSet = commentLikeByUser[commentId] ?? new Set<string>();
      commentLikeByUser[commentId] = likedSet;

      if (likedSet.has(user.id)) {
        likedSet.delete(user.id);
        comment.likes = Math.max(0, (comment.likes ?? 0) - 1);
      } else {
        likedSet.add(user.id);
        comment.likes = (comment.likes ?? 0) + 1;
      }

      // notify listeners that questions changed
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("questions-updated"));
      return delay(q);
    }
  }
  throw new Error("Comment not found");
}

export async function isCommentLikedByUserMock(commentId: string, userId: string): Promise<boolean> {
  const likedSet = commentLikeByUser[commentId];
  return delay(Boolean(likedSet?.has(userId)));
}
