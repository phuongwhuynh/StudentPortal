export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://api.unihub.edu/v1";

export const API_ENDPOINTS = {
  authLogin: `${API_BASE_URL}/auth/login`,
  authLogout: `${API_BASE_URL}/auth/logout`,
  authRegisterStaff: `${API_BASE_URL}/auth/register/staff`,
  forums: `${API_BASE_URL}/forums`,
  forumById: (id: string) => `${API_BASE_URL}/forums/${id}`,
  forumComments: (id: string) => `${API_BASE_URL}/forums/${id}/comments`,
  announcements: `${API_BASE_URL}/announcements`,
  announcementById: (id: string) => `${API_BASE_URL}/announcements/${id}`,
  announcementComments: (id: string) => `${API_BASE_URL}/announcements/${id}/comments`,
  questions: `${API_BASE_URL}/questions`,
  questionById: (id: string) => `${API_BASE_URL}/questions/${id}`,
  questionReplies: (id: string) => `${API_BASE_URL}/questions/${id}/replies`,
  questionStatus: (id: string) => `${API_BASE_URL}/questions/${id}/status`,
};
