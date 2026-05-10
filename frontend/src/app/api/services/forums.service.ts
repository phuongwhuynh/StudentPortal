import { API_ENDPOINTS } from "../constants";
import { getContentComments } from "./comments.service";
import { requestJson } from "../http";
import type { ForumThread } from "../../types/content";
import type { User } from "../../types/auth";

type BackendUserRef = {
  id: number;
  full_name: string;
  role: string;
};

type BackendForum = {
  id: number;
  title: string;
  body: string;
  category: string;
  posted_by: BackendUserRef;
  created_at?: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  updated_at: string;
  has_liked: boolean;
};

type BackendForumList = {
  forums: BackendForum[];
};

const forumListUrl = API_ENDPOINTS.forum;
const forumByIdUrl = (id: string) => API_ENDPOINTS.forumById(id);

const normalizeForum = (forum: BackendForum): ForumThread => ({
  id: String(forum.id),
  title: forum.title,
  body: forum.body,
  category: forum.category,
  postedBy: {
    id: String(forum.posted_by.id),
    displayName: forum.posted_by.full_name,
    role: forum.posted_by.role as User["role"],
  },
  createdAt: forum.created_at ?? forum.updated_at,
  repliedAt: null,
  deletedAt: null,
  deletedBy: null,
  counts: {
    views: forum.views_count,
    likes: forum.likes_count,
    comments: forum.comments_count,
  },
  tags: [],
  isPinned: false,
  comments: [],
});
async function fetchBackendForum(id: string): Promise<BackendForum> {
  return requestJson<BackendForum>([forumByIdUrl(id)], { method: "GET" });
}

export async function listForums(options?: { sortBy?: "recent" | "trending"; limit?: number; offset?: number; category?: string; search?: string }): Promise<ForumThread[]> {
  const params = new URLSearchParams();
  if (options?.sortBy) params.set("sort_by", options.sortBy);
  if (typeof options?.limit === "number") params.set("limit", String(options.limit));
  if (typeof options?.offset === "number") params.set("offset", String(options.offset));
  if (options?.category) params.set("category", options.category);
  if (options?.search) params.set("search", options.search);

  const url = new URL(forumListUrl);
  params.forEach((value, key) => url.searchParams.set(key, value));

  const response = await requestJson<BackendForumList | BackendForum[]>([url.toString()], {
    method: "GET",
  });
  const forums = Array.isArray(response) ? response : response.forums;
  return forums.map(normalizeForum);
}

export async function createForum(title: string, body: string, category?: string): Promise<ForumThread> {
  const response = await requestJson<BackendForum>([forumListUrl], {
    method: "POST",
    body: { title, body, category },
  });
  return normalizeForum(response);
}

export async function getForumById(id: string): Promise<ForumThread | undefined> {
  const response = await fetchBackendForum(id);
  const normalized = normalizeForum(response);
  normalized.comments = await getContentComments("forum", id);
  return normalized;
}

export async function countForums(postedOn?: string): Promise<number> {
  try {
    const url = `${API_ENDPOINTS.forum}/count${postedOn ? `?posted_on=${encodeURIComponent(postedOn)}` : ""}`;
    const response = await requestJson<{ count: number }>([url], { method: "GET" });
    return response.count ?? 0;
  } catch {
    return 0;
  }
}

export async function addForumComment(id: string, body: string, _user: User, parentCommentId: string | null = null): Promise<ForumThread> {
  const contentId = Number(id);
  const parentId = parentCommentId === null ? null : Number(parentCommentId);
  await requestJson<unknown>([API_ENDPOINTS.commentCreate], {
    method: "POST",
    body: {
      comment: body,
      content_id: contentId,
      content_type: "forum",
      parent_comment_id: parentId,
    },
  });
  const updatedForum = await getForumById(id);
  if (updatedForum) {
    return updatedForum;
  }
  throw new Error("Forum thread not found after posting comment");
}

export async function toggleForumLike(id: string, _user: User): Promise<ForumThread> {
  const forum = await fetchBackendForum(id);
  await requestJson<unknown>([API_ENDPOINTS.forumLike(id)], {
    method: forum.has_liked ? "DELETE" : "POST",
  });
  const updatedForum = await getForumById(id);
  if (updatedForum) {
    return updatedForum;
  }
  throw new Error("Forum thread not found after updating like state");
}

export async function isForumLikedByUser(id: string, _userId: string): Promise<boolean> {
  const forum = await fetchBackendForum(id);
  return forum.has_liked;
}

export async function incrementForumView(id: string): Promise<void> {
  await requestJson<unknown>([API_ENDPOINTS.forumView(id)], { method: "POST" });
}

export async function deleteForum(id: string): Promise<void> {
  await requestJson<unknown>([API_ENDPOINTS.forumById(id)], { method: "DELETE" });
}
