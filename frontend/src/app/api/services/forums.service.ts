import { API_ENDPOINTS } from "../constants";
/* Feature: Forums
  Endpoints:
  - GET ${API_ENDPOINTS.forums}                -> list forums
  - POST ${API_ENDPOINTS.forums}               -> create forum thread
  - GET ${API_ENDPOINTS.forumById(id)}         -> get forum by id
  - POST ${API_ENDPOINTS.forumComments(id)}    -> add comment to forum thread
  - POST ${API_ENDPOINTS.forumById(id)}/like   -> toggle like for a forum thread
*/
import { addForumCommentMock, createForumMock, getForumByIdMock, getForumsMock, isForumLikedByUserMock, toggleForumLikeMock } from "../mockHandlers";
import type { ForumThread } from "../../types/content";
import type { User } from "../../types/auth";

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

export async function addForumComment(id: string, body: string, user: User): Promise<ForumThread> {
  // Real API: POST ${API_ENDPOINTS.forumComments(id)}
  return addForumCommentMock(id, body, user);
}

export async function toggleForumLike(id: string, user: User): Promise<ForumThread> {
  // Real API: POST ${API_ENDPOINTS.forumById(id)}/like
  return toggleForumLikeMock(id, user);
}

export async function isForumLikedByUser(id: string, userId: string): Promise<boolean> {
  // Real API: GET ${API_ENDPOINTS.forumById(id)}/likes/me
  return isForumLikedByUserMock(id, userId);
}
