export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const API_ENDPOINTS = {
  authSignin: `${API_BASE_URL}/signin`,
  authSignout: `${API_BASE_URL}/signout`,
  forum: `${API_BASE_URL}/forum`,
  forumById: (id: string) => `${API_BASE_URL}/forum/${id}`,
  forumView: (id: string) => `${API_BASE_URL}/forum/${id}/view`,
  commentByContent: (contentType: "forum" | "announcement" | "question", contentId: string) => `${API_BASE_URL}/comment/${contentType}/${contentId}/`,
  commentReplies: (commentId: string) => `${API_BASE_URL}/comment/${commentId}/replies`,
  forumLike: (id: string) => `${API_BASE_URL}/like/forum/${id}`,
  commentCreate: `${API_BASE_URL}/comment`,
  announcement: `${API_BASE_URL}/announcement`,
  announcementById: (id: string) => `${API_BASE_URL}/announcement/${id}`,
  question: `${API_BASE_URL}/question`,
  questionById: (id: string) => `${API_BASE_URL}/question/${id}`,
  questionView: (id: string) => `${API_BASE_URL}/question/${id}/view`,
  questionLike: (id: string) => `${API_BASE_URL}/like/question/${id}`,
  questionResolve: (id: string) => `${API_BASE_URL}/question/resolve/${id}`,
  search: `${API_BASE_URL}/search`,
};
