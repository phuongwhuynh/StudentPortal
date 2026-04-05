import { API_ENDPOINTS } from "../constants";
import { createAnnouncementMock, getAnnouncementByIdMock, getAnnouncementsMock } from "../mockHandlers";
import type { AnnouncementPost } from "../../types/content";

export async function listAnnouncements(): Promise<AnnouncementPost[]> {
  // Real API: GET ${API_ENDPOINTS.announcements}
  return getAnnouncementsMock();
}

export async function createAnnouncement(title: string, body: string, category?: string): Promise<AnnouncementPost> {
  // Real API: POST ${API_ENDPOINTS.announcements}
  return createAnnouncementMock(title, body, category);
}

export async function getAnnouncementById(id: string): Promise<AnnouncementPost | undefined> {
  // Real API: GET ${API_ENDPOINTS.announcementById(id)}
  return getAnnouncementByIdMock(id);
}
