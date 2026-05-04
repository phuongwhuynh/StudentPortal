import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { ArrowLeft, Eye, Heart, MessageCircle, Send, User, Trash2 } from "lucide-react";
import { addForumComment, getForumById, isForumLikedByUser, toggleForumLike } from "../api/services/forums.service";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import type { ForumThread } from "../types/content";

export default function ForumThreadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [liked, setLiked] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getForumById(id).then((item) => setThread(item ?? null));
  }, [id]);

  useEffect(() => {
    if (!id || !user) {
      setLiked(false);
      return;
    }
    isForumLikedByUser(id, user.id).then(setLiked);
  }, [id, user]);

  const comments = useMemo(
    () => [...(thread?.comments ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [thread],
  );

  const addComment = async () => {
    if (!thread || !commentBody.trim() || !user) return;
    try {
      setCommentError(null);
      const updated = await addForumComment(thread.id, commentBody.trim(), user);
      setThread({ ...updated });
      setCommentBody("");
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "Unable to post comment");
    }
  };

  const toggleLike = async () => {
    if (!thread || !user || user.role === "guest") return;
    const updated = await toggleForumLike(thread.id, user);
    setThread({ ...updated });
    setLiked((current) => !current);
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

            {user && user.role !== "guest" && (
              <Button variant={liked ? "default" : "outline"} onClick={toggleLike} className="w-fit">
                <Heart className="w-4 h-4 mr-2" />
                {liked ? "Unlike" : "Like"}
              </Button>
            )}

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
          {commentError && <p className="text-sm text-red-600">{commentError}</p>}

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
