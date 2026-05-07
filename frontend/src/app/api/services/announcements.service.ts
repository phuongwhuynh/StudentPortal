import { API_ENDPOINTS } from "../constants";
/* Feature: Announcements
  Endpoints:
  - GET ${API_ENDPOINTS.announcements}                -> list announcements
  - POST ${API_ENDPOINTS.announcements}               -> create announcement
  - GET ${API_ENDPOINTS.announcementById(id)}         -> get announcement by id
  - POST ${API_ENDPOINTS.announcementComments(id)}    -> add comment to announcement
*/
import { addAnnouncementCommentMock, createAnnouncementMock, getAnnouncementByIdMock, getAnnouncementsMock } from "../mockHandlers";
import type { AnnouncementPost } from "../../types/content";
import type { User } from "../../types/auth";

export async function listAnnouncements(): Promise<AnnouncementPost[]> {
  // Real API: GET ${API_ENDPOINTS.announcements}
  return getAnnouncementsMock();
}

export async function createAnnouncement(title: string, body: string, category?: string, expiresAt?: string | null): Promise<AnnouncementPost> {
  // Real API: POST ${API_ENDPOINTS.announcements}
  // Payload may include: { title, body, category, expiresAt }
  return createAnnouncementMock(title, body, category, expiresAt);
}

export async function getAnnouncementById(id: string): Promise<AnnouncementPost | undefined> {
  // Real API: GET ${API_ENDPOINTS.announcementById(id)}
  return getAnnouncementByIdMock(id);
}

export async function addAnnouncementComment(id: string, body: string, user: User, parentCommentId: string | null = null): Promise<AnnouncementPost> {
  // Real API: POST ${API_ENDPOINTS.announcementComments(id)}
  // Payload may include: { body, parentCommentId }
  return addAnnouncementCommentMock(id, body, user, parentCommentId);
}
