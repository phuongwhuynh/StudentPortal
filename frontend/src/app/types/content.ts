import type { UserRole } from "./auth";

export type ContentType = "forum" | "announcement" | "question";
export type QuestionStatus = "open" | "completed" | "cancelled";

export interface MetaCounts {
  views: number;
  likes: number;
  comments: number;
}

export interface ContentUserRef {
  id: string;
  displayName: string;
  role?: UserRole;
}

export interface Comment {
  id: string;
  contentType: ContentType;
  contentId: string;
  parentCommentId: string | null;
  body: string;
  postedBy: ContentUserRef;
  repliedBy?: ContentUserRef | null;
  createdAt: string;
  repliedAt?: string | null;
  deletedAt?: string | null;
  deletedBy?: ContentUserRef | null;
  likes: number;
}

export interface ForumThread {
  id: string;
  title: string;
  body: string;
  category: string;
  postedBy: ContentUserRef;
  createdAt: string;
  repliedAt?: string | null;
  deletedAt?: string | null;
  deletedBy?: ContentUserRef | null;
  counts: MetaCounts;
  tags: string[];
  isPinned: boolean;
  comments: Comment[];
}

export interface AnnouncementPost {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: "info" | "warning" | "success" | "urgent";
  postedBy: ContentUserRef;
  createdAt: string;
  repliedAt?: string | null;
  deletedAt?: string | null;
  deletedBy?: ContentUserRef | null;
  counts: MetaCounts;
  tags: string[];
  comments: Comment[];
}

export interface QuestionThread {
  id: string;
  title: string;
  body: string;
  category: string;
  status: QuestionStatus;
  postedBy: ContentUserRef;
  answeredBy?: ContentUserRef | null;
  createdAt: string;
  repliedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  deletedAt?: string | null;
  deletedBy?: ContentUserRef | null;
  counts: MetaCounts;
  tags: string[];
  comments: Comment[];
}
