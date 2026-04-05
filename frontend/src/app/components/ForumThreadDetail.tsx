import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { ArrowLeft, Eye, Heart, MessageCircle, Send, User, Trash2 } from "lucide-react";
import { getForumById } from "../api/services/forums.service";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import type { Comment, ForumThread } from "../types/content";

export default function ForumThreadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [commentBody, setCommentBody] = useState("");

  useEffect(() => {
    if (!id) return;
    getForumById(id).then((item) => setThread(item ?? null));
  }, [id]);

  const comments = useMemo(() => thread?.comments ?? [], [thread]);

  const addComment = () => {
    if (!thread || !commentBody.trim() || !user) return;
    const next: Comment = {
      id: `comment-${Date.now()}`,
      contentType: "forum",
      contentId: thread.id,
      parentCommentId: null,
      body: commentBody,
      postedBy: { id: user.id, displayName: user.displayName, role: user.role },
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    setThread({
      ...thread,
      counts: { ...thread.counts, comments: thread.counts.comments + 1 },
      repliedAt: new Date().toISOString(),
      comments: [...thread.comments, next],
    });
    setCommentBody("");
  };

  if (!thread) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-gray-500">Forum thread not found.</p>
          <Button asChild variant="outline">
            <Link to="/forums">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forums
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost">
          <Link to="/forums">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forums
          </Link>
        </Button>
        <Badge variant="secondary">{thread.category}</Badge>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {thread.isPinned && <Badge>📌 Pinned</Badge>}
                  <Badge variant="secondary">Forum</Badge>
                </div>
                <h1 className="text-3xl font-bold leading-tight">{thread.title}</h1>
              </div>
              {user?.role === "staff" && <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{thread.postedBy.displayName}</span>
              <span>{formatDistanceToNowStrict(new Date(thread.createdAt), { addSuffix: true })}</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{thread.counts.views} views</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{thread.counts.likes} likes</span>
              <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{thread.counts.comments} comments</span>
            </div>

            <p className="text-gray-700 leading-7 whitespace-pre-wrap">{thread.body}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Comments</h2>
          {user ? (
            <div className="flex gap-2">
              <Input value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder="Write a comment..." />
              <Button onClick={addComment}><Send className="w-4 h-4 mr-2" />Post</Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Log in or continue as student/staff to comment.</p>
          )}

          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border bg-gray-50 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{comment.postedBy.displayName}</span>
                  <span className="text-gray-500">{formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
