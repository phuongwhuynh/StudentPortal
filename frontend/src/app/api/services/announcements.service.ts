import { API_ENDPOINTS } from "../constants";
import { getContentComments } from "./comments.service";
import { requestJson } from "../http";
import type { AnnouncementPost } from "../../types/content";
import type { User } from "../../types/auth";

type BackendUserRef = {
  id: number;
  name: string;
  role: string;
};

type BackendAnnouncement = {
  id: number;
  title: string;
  body: string;
  category: string;
  priority: string;
  created_at: string;
  expired_at: string | null;
  has_expired: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
  posted_by: BackendUserRef;
};

type BackendAnnouncementList = {
  announcements: BackendAnnouncement[];
};

const announcementListUrl = API_ENDPOINTS.announcement;
const announcementByIdUrl = (id: string) => API_ENDPOINTS.announcementById(id);

const normalizePriority = (priority: string): AnnouncementPost["priority"] => {
  const next = priority.toLowerCase();
  if (next === "urgent") return "urgent";
  if (next === "warning") return "warning";
  return "info";
};

const normalizeAnnouncement = (announcement: BackendAnnouncement): AnnouncementPost => ({
  id: String(announcement.id),
  title: announcement.title,
  body: announcement.body,
  category: announcement.category,
  priority: normalizePriority(announcement.priority),
  postedBy: {
    id: String(announcement.posted_by.id),
    displayName: announcement.posted_by.name,
    role: announcement.posted_by.role as User["role"],
  },
  createdAt: announcement.created_at,
  expiresAt: announcement.expired_at,
  repliedAt: null,
  deletedAt: null,
  deletedBy: null,
  counts: {
    views: announcement.views_count,
    likes: announcement.likes_count,
    comments: announcement.comments_count,
  },
  tags: [],
  comments: [],
});

export async function listAnnouncements(options?: { sortBy?: "recent" | "trending"; limit?: number; offset?: number; category?: string; priority?: string; hasExpired?: boolean; search?: string }): Promise<AnnouncementPost[]> {
  const params = new URLSearchParams();
  if (options?.sortBy) params.set("sort_by", options.sortBy);
  if (typeof options?.limit === "number") params.set("limit", String(options.limit));
  if (typeof options?.offset === "number") params.set("offset", String(options.offset));
  if (options?.category) params.set("category", options.category);
  if (options?.priority) params.set("priority", options.priority);
  if (typeof options?.hasExpired === "boolean") params.set("has_expired", String(options.hasExpired));
  if (options?.search) params.set("search", options.search);

  const url = new URL(announcementListUrl);
  params.forEach((value, key) => url.searchParams.set(key, value));

  const response = await requestJson<BackendAnnouncementList | BackendAnnouncement[]>([url.toString()], {
    method: "GET",
  });
  const announcements = Array.isArray(response) ? response : response.announcements;
  return announcements.map(normalizeAnnouncement);
}

export async function createAnnouncement(title: string, body: string, category?: string, priority?: string, expiresAt?: string | null): Promise<AnnouncementPost> {
  const response = await requestJson<BackendAnnouncement>([announcementListUrl], {
    method: "POST",
    body: { title, body, category, priority, expired_at: expiresAt },
  });
  return normalizeAnnouncement(response);
}

  export async function countAnnouncements(postedOn?: string, priority?: string, hasExpired?: boolean): Promise<number> {
    try {
      const params = new URLSearchParams();
      if (postedOn) params.set("posted_on", postedOn);
      if (priority) params.set("priority", priority);
      if (typeof hasExpired === "boolean") params.set("has_expired", String(hasExpired));
      const url = `${API_ENDPOINTS.announcement}/count${params.toString() ? `?${params.toString()}` : ""}`;
      const resp = await requestJson<{ count: number }>([url], { method: "GET" });
      return resp.count ?? 0;
    } catch {
      return 0;
    }
  }

export async function getAnnouncementById(id: string): Promise<AnnouncementPost | undefined> {
  const response = await requestJson<BackendAnnouncement>([announcementByIdUrl(id)], {
    method: "GET",
  });
  const announcement = normalizeAnnouncement(response);
  announcement.comments = await getContentComments("announcement", id);
  return announcement;
}

export async function addAnnouncementComment(id: string, body: string, _user: User, parentCommentId: string | null = null): Promise<AnnouncementPost> {
  const contentId = Number(id);
  const parentId = parentCommentId === null ? null : Number(parentCommentId);
  await requestJson<unknown>([API_ENDPOINTS.commentCreate], {
    method: "POST",
    body: {
      comment: body,
      content_id: contentId,
      content_type: "announcement",
      parent_comment_id: parentId,
    },
  });
  const updatedAnnouncement = await getAnnouncementById(id);
  if (updatedAnnouncement) {
    return updatedAnnouncement;
  }
  throw new Error("Announcement not found after posting comment");
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await requestJson<unknown>([API_ENDPOINTS.announcementById(id)], { method: "DELETE" });
}
