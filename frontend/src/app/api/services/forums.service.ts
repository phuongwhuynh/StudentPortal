import { API_ENDPOINTS } from "../constants";
import { createForumMock, getForumByIdMock, getForumsMock } from "../mockHandlers";
import type { ForumThread } from "../../types/content";

export async function listForums(): Promise<ForumThread[]> {
  // Real API: GET ${API_ENDPOINTS.forums}
  return getForumsMock();
}

export async function createForum(title: string, body: string, category?: string): Promise<ForumThread> {
  // Real API: POST ${API_ENDPOINTS.forums}
  return createForumMock(title, body, category);
}

export async function getForumById(id: string): Promise<ForumThread | undefined> {
  // Real API: GET ${API_ENDPOINTS.forumById(id)}
  return getForumByIdMock(id);
}
