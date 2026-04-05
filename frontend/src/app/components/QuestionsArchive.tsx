import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  HelpCircle, 
  Search, 
  ThumbsUp, 
  MessageSquare,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { listQuestions } from "../api/services/questions.service";
import { createQuestion } from "../api/services/questions.service";
import { useAuth } from "../auth/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Link } from "react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function QuestionsArchive() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("Academic");
  const [createError, setCreateError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Array<{
    id: number;
    question: string;
    answer: string;
    category: string;
    askedBy: string;
    answeredBy: string;
    upvotes: number;
    views: number;
    replies: number;
    dateAsked: string;
    dateAnswered: string;
    tags: string[];
    isSolved: boolean;
    isPopular: boolean;
  }>>([]);

  useEffect(() => {
    let mounted = true;
    listQuestions().then((items) => {
      if (!mounted) return;
      setQuestions(
        items.map((question, index) => ({
          id: index + 1,
          question: question.title,
          answer: question.body,
          category: question.category,
          askedBy: question.postedBy.displayName,
          answeredBy: question.answeredBy?.displayName ?? "Staff",
          upvotes: question.counts.likes,
          views: question.counts.views,
          replies: question.counts.comments,
          dateAsked: new Date(question.createdAt).toLocaleDateString(),
          dateAnswered: question.repliedAt ? new Date(question.repliedAt).toLocaleDateString() : "—",
          tags: question.tags,
          isSolved: question.status === "completed",
          isPopular: question.counts.views > 1000,
        })),
      );
    });
    return () => {
      mounted = false;
    };
  }, []);

  const categories = ["all", "IT Services", "Library", "Housing", "Career Services", "Academic", "Dining", "Student Services", "Transportation"];

  const filteredQuestions = useMemo(() => questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || q.category === filterCategory;
    return matchesSearch && matchesCategory;
  }), [questions, searchQuery, filterCategory]);

  const popularQuestions = questions.filter(q => q.isPopular);

  const handleCreateQuestion = async () => {
    try {
      setCreateError(null);
      const question = await createQuestion(newTitle, newBody, newCategory);
      setQuestions((current) => [
        {
          id: current.length + 1,
          question: question.title,
          answer: question.body,
          category: question.category,
          askedBy: question.postedBy.displayName,
          answeredBy: question.answeredBy?.displayName ?? "Staff",
          upvotes: question.counts.likes,
          views: question.counts.views,
          replies: question.counts.comments,
          dateAsked: new Date(question.createdAt).toLocaleDateString(),
          dateAnswered: question.repliedAt ? new Date(question.repliedAt).toLocaleDateString() : "—",
          tags: question.tags,
          isSolved: question.status === "completed",
          isPopular: false,
        },
        ...current,
      ]);
      setCreateOpen(false);
      setNewTitle("");
      setNewBody("");
      setNewCategory("Academic");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Unable to create question");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Questions Archive</h1>
        <p className="text-gray-600">
          Browse through thousands of answered questions from the university community
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold">{questions.length}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Solved</p>
                <p className="text-2xl font-bold">
                  {questions.filter(q => q.isSolved).length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">
                  {(questions.reduce((sum, q) => sum + q.views, 0) / 1000).toFixed(1)}k
                </p>
              </div>
              <ThumbsUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
              <Filter className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search questions, answers, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {user && (user.role === "student" || user.role === "staff") && (
          <Button onClick={() => setCreateOpen(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask Question
          </Button>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask a New Question</DialogTitle>
            <DialogDescription>Students and staff can create questions in the archive.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="q-title">Title</Label>
              <Input id="q-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Question title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-category">Category</Label>
              <Input id="q-category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Academic" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-body">Body</Label>
              <Textarea id="q-body" value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Describe your question..." rows={5} />
            </div>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateQuestion}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popular Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            Most Popular Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {popularQuestions.slice(0, 3).map((q) => (
              <button
                key={q.id}
                onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                className="w-full text-left p-4 rounded-lg border hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-2">{q.question}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {q.upvotes}
                      </span>
                      <span>{q.views} views</span>
                      <Badge variant="secondary" className="text-xs">{q.category}</Badge>
                    </div>
                  </div>
                  {expandedQuestion === q.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </div>
                {expandedQuestion === q.id && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-700">{q.answer}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Questions ({filteredQuestions.length})</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {filteredQuestions.map((q) => (
            <AccordionItem key={q.id} value={`item-${q.id}`} className="border rounded-lg">
              <Card className="border-0">
                <AccordionTrigger className="hover:no-underline px-6">
                  <div className="flex items-start gap-4 text-left flex-1 pr-4">
                    <div className="hidden sm:flex flex-col items-center gap-1 pt-1">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-2">{q.question}</h3>
                      
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {q.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <Badge variant="secondary" className="text-xs">
                          {q.category}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {q.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {q.replies}
                        </span>
                        <span>{q.views} views</span>
                        <span className="text-gray-400">•</span>
                        <span>Asked {q.dateAsked}</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="pl-0 sm:pl-14">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-green-900 mb-1">Accepted Answer</p>
                          <p className="text-sm text-gray-700">{q.answer}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Answered by {q.answeredBy} on {q.dateAnswered}</span>
                      <Button asChild variant="link" size="sm" className="text-blue-600 p-0 h-auto">
                        <Link to={`/questions/${q.id}`}>View Full Thread →</Link>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No questions found matching your search criteria.</p>
            <p className="text-sm text-gray-400 mt-2">Try different keywords or browse all categories.</p>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-8 text-center">
          <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Didn't find what you're looking for?</h3>
          <p className="text-gray-600 mb-4">Ask a new question in the forums and get help from the community</p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask a Question
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
