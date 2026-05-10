import { API_ENDPOINTS } from "../constants";
import { requestJson } from "../http";

export type GlobalSearchResult = {
  id: string;
  type: "forum" | "announcement" | "question";
  title: string;
  body: string;
  category: string;
  createdAt: string;
  url: string;
  likes?: number;
  replies?: number;
  priority?: string;
  expiresAt?: string | null;
  status?: string;
  questionReplies?: number;
};

/* Feature: Global Search
   Endpoints:
   - GET ${API_ENDPOINTS.search}?q=query -> search across forums, announcements, and Q&A
   Request params: q (search query string)
   Response: Array of GlobalSearchResult with type, metadata, and URL
*/

export async function globalSearch(query: string): Promise<GlobalSearchResult[]> {
  const response = await requestJson<{ results: Array<Record<string, unknown>> } | Array<Record<string, unknown>>>([
    `${API_ENDPOINTS.search}?search=${encodeURIComponent(query)}`,
  ], {
    method: "GET",
  });

  const results = Array.isArray(response) ? response : response.results;

  return results.map((item) => {
    const type = String(item.content_type ?? item.type ?? "forum") as GlobalSearchResult["type"];
    const id = String(item.id ?? "");
    const category = String(
      item.forum_category ?? item.question_category ?? item.announcement_category ?? item.category ?? "General",
    );
    const createdAt = String(item.created_at ?? item.createdAt ?? new Date().toISOString());
    const title = String(item.title ?? "");
    const body = String(item.body ?? "");

    return {
      id,
      type,
      title,
      body,
      category,
      createdAt,
      url:
        type === "forum"
          ? `/forums/${id}`
          : type === "announcement"
            ? `/announcements/${id}`
            : `/questions/${id}`,
      likes: Number(item.likes_count ?? item.likes ?? 0),
      replies: Number(item.comments_count ?? item.replies ?? 0),
      priority: String(item.announcement_priority ?? item.priority ?? "info").toLowerCase(),
      expiresAt: (item.expired_at ?? item.expiresAt ?? null) as string | null,
      status: item.question_status ? String(item.question_status).toLowerCase() : item.has_resolved === true ? "completed" : undefined,
      questionReplies: Number(item.comments_count ?? item.questionReplies ?? 0),
    } satisfies GlobalSearchResult;
  });
}
