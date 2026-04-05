import type { AnnouncementPost, Comment, ForumThread, QuestionThread } from "../types/content";
import type { User } from "../types/auth";

export interface MockCredentials {
  email: string;
  password: string;
}

export interface MockStaffRegistration {
  email: string;
  password: string;
  displayName: string;
}

const now = new Date();
const minus = (minutes: number) => new Date(now.getTime() - minutes * 60 * 1000).toISOString();

export const mockUsers: Array<User & { password: string }> = [
  { id: "staff-1", email: "staff.admin@unihub.edu", password: "Staff@123", displayName: "Admin Office", role: "staff" },
  { id: "staff-2", email: "it.staff@unihub.edu", password: "Staff@123", displayName: "IT Services Staff", role: "staff" },
  { id: "student-1", email: "student.alex@unihub.edu", password: "Student@123", displayName: "Alex Nguyen", role: "student" },
  { id: "student-2", email: "student.mai@unihub.edu", password: "Student@123", displayName: "Mai Tran", role: "student" },
];

const forumComments: Comment[] = [
  {
    id: "forum-c-1",
    contentType: "forum",
    contentId: "forum-1",
    parentCommentId: null,
    body: "You can access the library through the VPN portal. I did it last week.",
    postedBy: { id: "student-2", displayName: "Mai Tran", role: "student" },
    createdAt: minus(90),
    repliedAt: null,
    likes: 4,
  },
];

const announcementComments: Comment[] = [
  {
    id: "ann-c-1",
    contentType: "announcement",
    contentId: "ann-1",
    parentCommentId: null,
    body: "Thanks for the update. Will the portal be unavailable during the window?",
    postedBy: { id: "student-1", displayName: "Alex Nguyen", role: "student" },
    createdAt: minus(120),
    repliedAt: null,
    likes: 2,
  },
];

const questionComments: Comment[] = [
  {
    id: "q-c-1",
    contentType: "question",
    contentId: "q-1",
    parentCommentId: null,
    body: "Go to the IT portal and choose Forgot Password.",
    postedBy: { id: "staff-2", displayName: "IT Services Staff", role: "staff" },
    createdAt: minus(150),
    repliedAt: minus(145),
    repliedBy: { id: "staff-2", displayName: "IT Services Staff", role: "staff" },
    likes: 12,
  },
];

export const forumThreads: ForumThread[] = [
  {
    id: "forum-1",
    title: "How do I access the digital library from off-campus?",
    body: "I need help accessing the university digital library while I am off campus. Is VPN required and where do I sign in?",
    category: "Academic Support",
    postedBy: { id: "student-1", displayName: "Alex Nguyen", role: "student" },
    createdAt: minus(240),
    repliedAt: minus(90),
    counts: { views: 245, likes: 8, comments: forumComments.length },
    tags: ["library", "vpn", "resources"],
    isPinned: true,
    comments: forumComments,
  },
];

export const announcements: AnnouncementPost[] = [
  {
    id: "ann-1",
    title: "Spring 2026 Registration Now Open",
    body: "Registration for Spring 2026 semester is now open. Students can access the registration portal through the student information system.",
    category: "Academic",
    priority: "urgent",
    postedBy: { id: "staff-1", displayName: "Admin Office", role: "staff" },
    createdAt: minus(300),
    repliedAt: minus(120),
    counts: { views: 180, likes: 11, comments: announcementComments.length },
    tags: ["registration", "spring-2026", "academic"],
    comments: announcementComments,
  },
];

export const questions: QuestionThread[] = [
  {
    id: "q-1",
    title: "How do I reset my university account password?",
    body: "I forgot my password and need to reset it. What is the fastest way?",
    category: "IT Services",
    status: "completed",
    postedBy: { id: "student-2", displayName: "Mai Tran", role: "student" },
    answeredBy: { id: "staff-2", displayName: "IT Services Staff", role: "staff" },
    createdAt: minus(360),
    repliedAt: minus(150),
    completedAt: minus(148),
    counts: { views: 2340, likes: 145, comments: questionComments.length },
    tags: ["password", "account", "login"],
    comments: questionComments,
  },
];
