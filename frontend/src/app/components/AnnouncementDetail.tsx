import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { ArrowLeft, Eye, Heart, User, Trash2, Send, Clock3, BadgeAlert } from "lucide-react";
import { addAnnouncementComment, getAnnouncementById } from "../api/services/announcements.service";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import type { AnnouncementPost } from "../types/content";
import CommentTree from "./CommentTree";

export default function AnnouncementDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<AnnouncementPost | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);

  const isExpired = useMemo(() => {
    if (!post?.expiresAt) return false;
    return new Date(post.expiresAt) < new Date();
  }, [post?.expiresAt]);

  useEffect(() => {
    if (!id) return;
    getAnnouncementById(id).then((item) => setPost(item ?? null));
  }, [id]);

  const addComment = async (parentCommentId: string | null = null, body = commentBody) => {
    if (!post || !body.trim() || !user) return;
    try {
      setCommentError(null);
      const updated = await addAnnouncementComment(post.id, body.trim(), user, parentCommentId);
      setPost({ ...updated });
      if (parentCommentId === null) {
        setCommentBody("");
      }
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "Unable to post comment");
    }
  };

  if (!post) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-gray-500">Announcement not found.</p>
          <Button asChild variant="outline">
            <Link to="/announcements">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Announcements
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
          <Link to="/announcements">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Announcements
          </Link>
        </Button>
        <Badge variant="secondary">{post.category}</Badge>
      </div>

      <Card className={`overflow-hidden shadow-sm ${isExpired ? "border-red-200 bg-red-50/40" : "border-green-200 bg-green-50/30"}`}>
        <CardContent className="p-0">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={isExpired ? "bg-red-600" : post.priority === "urgent" ? "bg-red-600" : post.priority === "warning" ? "bg-orange-500" : "bg-blue-600"}>
                    {post.priority === "info" ? "New Info" : post.priority.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary">Announcement</Badge>
                  <Badge variant={isExpired ? "destructive" : "secondary"} className={isExpired ? "" : "bg-green-100 text-green-700"}>
                    {isExpired ? "Expired" : "Active"}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
              </div>
              {user?.role === "staff" && <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.postedBy.displayName}</span>
              <span>{formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{post.counts.views} views</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{post.counts.likes} likes</span>
              {post.expiresAt && (
                <span className={`flex items-center gap-1.5 ${isExpired ? "text-red-700" : "text-green-700"}`}>
                  <Clock3 className="w-4 h-4" />
                  {isExpired ? "Expired" : `Expires ${new Date(post.expiresAt).toLocaleDateString()}`}
                </span>
              )}
            </div>

            <div className={`rounded-lg border p-4 ${isExpired ? "border-red-200 bg-red-100/60" : "border-green-200 bg-green-100/60"}`}>
              <div className="flex items-start gap-3">
                <BadgeAlert className={`mt-0.5 h-5 w-5 ${isExpired ? "text-red-700" : "text-green-700"}`} />
                <div>
                  <p className={`font-medium ${isExpired ? "text-red-800" : "text-green-800"}`}>
                    {isExpired ? "This announcement has expired" : "This announcement is active"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isExpired
                      ? "Users can still read and discuss the announcement, but it is no longer active."
                      : post.expiresAt
                        ? `This announcement remains active until ${new Date(post.expiresAt).toLocaleDateString()}.`
                        : "This announcement does not have an expiry date."}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-700 leading-7 whitespace-pre-wrap">{post.body}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Comments</h2>
          {user ? (
            <div className="space-y-2 rounded-xl border bg-gray-50 p-4">
              <Textarea value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder="Write a comment..." rows={3} />
              <div className="flex justify-end">
                <Button onClick={() => addComment(null, commentBody)} disabled={!commentBody.trim()}>
                  <Send className="w-4 h-4 mr-2" />Post Comment
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Log in or continue as student/staff to comment.</p>
          )}
          {commentError && <p className="text-sm text-red-600">{commentError}</p>}

          <CommentTree comments={post.comments} currentUser={user} canReply onReply={(parentCommentId, body) => addComment(parentCommentId, body)} />
        </CardContent>
      </Card>
    </div>
  );
}
