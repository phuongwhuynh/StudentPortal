import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { ArrowLeft, Eye, ThumbsUp, MessageCircle, Send, User, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { acceptQuestion, addQuestionReply, addQuestionReplyToComment, deleteQuestion, getQuestionById, toggleCommentLike, isCommentLiked, toggleQuestionLike, isQuestionLiked } from "../api/services/questions.service";
import { incrementQuestionView } from "../api/services/questions.service";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import type { QuestionThread } from "../types/content";
import CommentTree from "./CommentTree";

export default function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState<QuestionThread | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [questionLiked, setQuestionLiked] = useState(false);
  const hasIncrementedRef = useRef(false);

  useEffect(() => {
    hasIncrementedRef.current = false;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getQuestionById(id).then((item) => setQuestion(item ?? null));
  }, [id]);

  useEffect(() => {
    if (!id || !question) return;
    if (hasIncrementedRef.current) return;
    hasIncrementedRef.current = true;
    const t = setTimeout(() => {
      incrementQuestionView(id);
    }, 800);
    return () => clearTimeout(t);
  }, [id, question]);

  useEffect(() => {
    if (!question || !user) return;
    isQuestionLiked(question.id, user.id).then((liked) => setQuestionLiked(liked)).catch(() => {});
  }, [question, user]);

  const comments = useMemo(
    () => [...(question?.comments ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [question],
  );

  const addReply = async (parentCommentId: string | null = null, body = commentBody) => {
    if (!question || !body.trim() || !user) return;
    try {
      setReplyError(null);
      const updated = parentCommentId
        ? await addQuestionReplyToComment(question.id, body.trim(), user, parentCommentId)
        : await addQuestionReply(question.id, body.trim(), user);
      setQuestion({ ...updated });
      if (parentCommentId === null) {
        setCommentBody("");
      }
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : "Unable to post reply");
    }
  };

  const handleAcceptQuestion = async () => {
    if (!question || user?.role !== "staff") return;
    try {
      setAcceptError(null);
      const updated = await acceptQuestion(question.id, user);
      setQuestion({ ...updated });
    } catch (error) {
      setAcceptError(error instanceof Error ? error.message : "Unable to accept question");
    }
  };

  const handleDeleteQuestion = async () => {
    if (!question || user?.role !== "staff" || isDeleting) return;

    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteQuestion(question.id);
      navigate("/questions");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete question");
    } finally {
      setIsDeleting(false);
    }
  };

  const isAccepted = question?.status === "completed";

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
          <Badge>{question.status.replace("-", " ").toUpperCase()}</Badge>
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
                  {question.status === "in-progress" && <Badge variant="outline">In Progress</Badge>}
                </div>
                <h1 className="text-3xl font-bold leading-tight">{question.title}</h1>
              </div>
              {user?.role === "staff" && (
                <Button variant="destructive" size="sm" onClick={handleDeleteQuestion} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Delete
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{question.postedBy.displayName}</span>
              <span>{formatDistanceToNowStrict(new Date(question.createdAt), { addSuffix: true })}</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{question.counts.views} views</span>
              <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4" />{question.counts.likes} likes</span>
              <button
                onClick={async () => {
                  if (!user) return;
                  try {
                    const updated = await toggleQuestionLike(question.id, user);
                    setQuestion({ ...updated });
                    setQuestionLiked((prev) => !prev);
                  } catch (err) {
                    // ignore
                  }
                }}
                aria-pressed={questionLiked}
                className={"ml-2 p-2 rounded border " + (questionLiked ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-300 text-gray-600")}
              >
                <ThumbsUp className="w-4 h-4" fill={questionLiked ? "currentColor" : "none"} />
              </button>
              <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{question.counts.comments} replies</span>
            </div>

            <p className="text-gray-700 leading-7 whitespace-pre-wrap">{question.body}</p>

            {user?.role === "staff" && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleAcceptQuestion} disabled={isAccepted || question.comments.length < 1} className="bg-green-600 hover:bg-green-700 disabled:opacity-50">
                  <CheckCircle2 className="w-4 h-4 mr-2" />Resolve this question
                </Button>
              </div>
            )}
            {user?.role === "staff" && question.comments.length < 1 && !isAccepted && (
              <p className="text-sm text-amber-700">At least one answer is required before resolving this question.</p>
            )}
            {acceptError && <p className="text-sm text-red-600">{acceptError}</p>}
            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Replies</h2>
          {isAccepted ? (
            <p className="text-sm text-green-700">This Q&A has been resolved. New replies are disabled.</p>
          ) : user ? (
            <div className="space-y-2 rounded-xl border bg-gray-50 p-4">
              <Textarea value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder="Write a reply..." rows={3} />
              <div className="flex justify-end">
                <Button onClick={() => addReply(null, commentBody)} disabled={!commentBody.trim()}>
                  <Send className="w-4 h-4 mr-2" />Post Reply
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Log in or continue as student/staff to reply.</p>
          )}
          {replyError && <p className="text-sm text-red-600">{replyError}</p>}

          <CommentTree comments={comments} currentUser={user} canReply={!isAccepted} onReply={(parentCommentId, body) => addReply(parentCommentId, body)} />
        </CardContent>
      </Card>
    </div>
  );
}
