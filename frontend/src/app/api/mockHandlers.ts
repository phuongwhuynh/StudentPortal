import type { AnnouncementPost, Comment, ForumThread, QuestionThread } from "../types/content";
import type { LoginPayload, RegisterStaffPayload, User } from "../types/auth";
import { announcements, forumThreads, mockUsers, questions } from "./mockDb";
import type { MockCredentials, MockStaffRegistration } from "./mockDb";

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

export async function getQuestionsMock(): Promise<QuestionThread[]> {
  return delay(questions);
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

export async function createAnnouncementMock(title: string, body: string, category = "General"): Promise<AnnouncementPost> {
  const item: AnnouncementPost = {
    id: makeId("ann"),
    title,
    body,
    category,
    priority: "info",
    postedBy: { id: "staff-1", displayName: "Admin Office", role: "staff" },
    createdAt: new Date().toISOString(),
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
    status: "open",
    postedBy: { id: "student-1", displayName: "Alex Nguyen", role: "student" },
    createdAt: new Date().toISOString(),
    counts: { views: 0, likes: 0, comments: 0 },
    tags: [],
    comments: [],
  };
  questions.unshift(item);
  return delay(item);
}
