import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { ArrowLeft, Eye, Heart, MessageCircle, Send, User, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { getQuestionById } from "../api/services/questions.service";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import type { Comment, QuestionThread } from "../types/content";

export default function QuestionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState<QuestionThread | null>(null);
  const [commentBody, setCommentBody] = useState("");

  useEffect(() => {
    if (!id) return;
    getQuestionById(id).then((item) => setQuestion(item ?? null));
  }, [id]);

  const comments = useMemo(() => question?.comments ?? [], [question]);

  const addReply = () => {
    if (!question || !commentBody.trim() || !user) return;
    const next: Comment = {
      id: `q-comment-${Date.now()}`,
      contentType: "question",
      contentId: question.id,
      parentCommentId: null,
      body: commentBody,
      postedBy: { id: user.id, displayName: user.displayName, role: user.role },
      createdAt: new Date().toISOString(),
      repliedAt: user.role === "staff" ? new Date().toISOString() : null,
      repliedBy: user.role === "staff" ? { id: user.id, displayName: user.displayName, role: user.role } : null,
      likes: 0,
    };
    setQuestion({
      ...question,
      counts: { ...question.counts, comments: question.counts.comments + 1 },
      repliedAt: new Date().toISOString(),
      comments: [...question.comments, next],
    });
    setCommentBody("");
  };

  const markStatus = (status: "completed" | "cancelled") => {
    if (!question || user?.role !== "staff") return;
    const stamp = new Date().toISOString();
    setQuestion({
      ...question,
      status,
      completedAt: status === "completed" ? stamp : question.completedAt,
      cancelledAt: status === "cancelled" ? stamp : question.cancelledAt,
    });
  };

  if (!question) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-gray-500">Question not found.</p>
          <Button asChild variant="outline">
            <Link to="/questions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Q&A
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
          <Link to="/questions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Q&A
          </Link>
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{question.category}</Badge>
          <Badge>{question.status.toUpperCase()}</Badge>
        </div>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">Q&A</Badge>
                  {question.status === "completed" && <Badge className="bg-green-600">Completed</Badge>}
                  {question.status === "cancelled" && <Badge variant="destructive">Cancelled</Badge>}
                </div>
                <h1 className="text-3xl font-bold leading-tight">{question.title}</h1>
              </div>
              {user?.role === "staff" && <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{question.postedBy.displayName}</span>
              <span>{formatDistanceToNowStrict(new Date(question.createdAt), { addSuffix: true })}</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{question.counts.views} views</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{question.counts.likes} likes</span>
              <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{question.counts.comments} replies</span>
            </div>

            <p className="text-gray-700 leading-7 whitespace-pre-wrap">{question.body}</p>

            {user?.role === "staff" && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => markStatus("completed")} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />Mark Completed
                </Button>
                <Button variant="outline" onClick={() => markStatus("cancelled")}>
                  <XCircle className="w-4 h-4 mr-2" />Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Replies</h2>
          {user ? (
            <div className="flex gap-2">
              <Input value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder="Write a reply..." />
              <Button onClick={addReply}><Send className="w-4 h-4 mr-2" />Post</Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Log in or continue as student/staff to reply.</p>
          )}

          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border bg-gray-50 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{comment.postedBy.displayName}</span>
                  <span className="text-gray-500">{formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                {comment.repliedBy && <p className="text-xs text-green-700">Replied by {comment.repliedBy.displayName}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
