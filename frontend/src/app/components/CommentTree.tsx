import { useMemo, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { CornerDownRight, MessageSquare, Send, ChevronDown } from "lucide-react";
import type { Comment } from "../types/content";
import type { User } from "../types/auth";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

type CommentTreeProps = {
  comments: Comment[];
  currentUser?: User | null;
  canReply?: boolean;
  onReply: (parentCommentId: string | null, body: string) => Promise<void> | void;
};

function CommentNode({
  comment,
  depth,
  canReply,
  currentUser,
  onReply,
  childrenMap,
}: {
  comment: Comment;
  depth: number;
  canReply: boolean;
  currentUser?: User | null;
  onReply: (parentCommentId: string | null, body: string) => Promise<void> | void;
  childrenMap: Map<string | null, Comment[]>;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const children = childrenMap.get(comment.id) ?? [];
  const hasChildren = children.length > 0;

  const handleSubmit = async () => {
    if (!replyBody.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, replyBody.trim());
      setReplyBody("");
      setReplyOpen(false);
      setShowReplies(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={depth === 0 ? "rounded-xl border bg-white p-4 shadow-sm" : "relative ml-5 border-l-2 border-gray-200 pl-4"}>
      {depth > 0 && <span className="absolute left-[-9px] top-6 h-3 w-3 rounded-full border-2 border-gray-200 bg-white" />}

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm text-gray-900">{comment.postedBy.displayName}</span>
              {comment.postedBy.role && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-600">
                  {comment.postedBy.role}
                </span>
              )}
              {comment.repliedBy && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                  Replied by {comment.repliedBy.displayName}
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{comment.likes ?? 0}</span>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">{comment.body}</p>

        <div className="flex items-center gap-2">
          {canReply && currentUser?.role !== "guest" && (
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={() => setReplyOpen((value) => !value)}>
              <CornerDownRight className="mr-1.5 h-3.5 w-3.5" />
              Reply
            </Button>
          )}

          {hasChildren && !showReplies && (
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => setShowReplies(true)}>
              <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
              View more replies ({children.length})
            </Button>
          )}
        </div>

        {replyOpen && canReply && currentUser?.role !== "guest" && (
          <div className="space-y-2 rounded-lg bg-gray-50 p-3">
            <Textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setReplyOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!replyBody.trim() || submitting}>
                <Send className="mr-2 h-4 w-4" />
                Post
              </Button>
            </div>
          </div>
        )}

        {showReplies && hasChildren && (
          <div className="space-y-3 pt-2">
            {children.map((child) => (
              <CommentNode
                key={child.id}
                comment={child}
                depth={depth + 1}
                canReply={canReply}
                currentUser={currentUser}
                onReply={onReply}
                childrenMap={childrenMap}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentTree({ comments, currentUser, canReply = true, onReply }: CommentTreeProps) {
  const childrenMap = useMemo(() => {
    const sorted = [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const map = new Map<string | null, Comment[]>();

    for (const comment of sorted) {
      const key = comment.parentCommentId;
      map.set(key, [...(map.get(key) ?? []), comment]);
    }

    return map;
  }, [comments]);

  const roots = childrenMap.get(null) ?? [];

  return (
    <div className="space-y-4">
      {roots.map((comment) => (
        <CommentNode
          key={comment.id}
          comment={comment}
          depth={0}
          canReply={canReply}
          currentUser={currentUser}
          onReply={onReply}
          childrenMap={childrenMap}
        />
      ))}
    </div>
  );
}