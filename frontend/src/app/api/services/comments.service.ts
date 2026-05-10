import { API_ENDPOINTS } from "../constants";
import { requestJson } from "../http";
import type { Comment, ContentType } from "../../types/content";

type BackendComment = {
  id: number;
  comment: string;
  commenter: {
    id: number;
    full_name: string;
    role: string;
  };
  created_at: string;
  content_id: number;
  content_type: string;
  parent_comment_id: number | null;
};

type BackendCommentsResponse = {
  comments: BackendComment[];
};

export async function getContentComments(contentType: ContentType, contentId: string): Promise<Comment[]> {
  const response = await requestJson<BackendCommentsResponse>([API_ENDPOINTS.commentByContent(contentType, contentId)], {
    method: "GET",
  });

  return response.comments.map((comment) => ({
    id: String(comment.id),
    contentType,
    contentId: String(comment.content_id),
    parentCommentId: comment.parent_comment_id === null ? null : String(comment.parent_comment_id),
    body: comment.comment,
    postedBy: {
      id: String(comment.commenter.id),
      displayName: comment.commenter.full_name,
      role: comment.commenter.role,
    },
    repliedBy: null,
    createdAt: comment.created_at,
    repliedAt: null,
    deletedAt: null,
    deletedBy: null,
    likes: 0,
  }));
}