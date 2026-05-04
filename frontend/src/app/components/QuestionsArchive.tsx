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
import { listQuestions } from "../api/services/questions.service";
import { Loader2 } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [createError, setCreateError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Array<{
    id: string;
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
    comments: any[];
    status: string;
  }>>([]);

  const forumCategories = ["Academic Support", "Campus Life", "Career Services", "IT & Technology", "Student Affairs", "General"];

  const categories = ["all", ...forumCategories];

  const filteredQuestions = useMemo(() => questions.filter(q => {
    const sq = searchQuery.toLowerCase();
    const matchesSearch = q.question.toLowerCase().includes(sq) ||
                         q.answer.toLowerCase().includes(sq) ||
                         q.tags.some(tag => tag.toLowerCase().includes(sq)) ||
                         q.comments.some(c => c.body.toLowerCase().includes(sq));
    const matchesCategory = filterCategory === "all" || q.category === filterCategory;
    return matchesSearch && matchesCategory;
  }), [questions, searchQuery, filterCategory]);

  const [sortMode, setSortMode] = useState<"trending" | "recent" | "relevant">("recent");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, sortMode]);

  const relevanceScore = (item: any, q: string) => {
    const hay = `${item.question} ${item.answer}`.toLowerCase();
    const occurrences = (hay.match(new RegExp(q, "gi")) || []).length;
    return occurrences + (item.comments ? item.comments.length : 0);
  };

  const sortedFilteredQuestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (sortMode === "trending") return [...filteredQuestions].sort((a, b) => b.upvotes - a.upvotes);
    if (sortMode === "recent") return [...filteredQuestions].sort((a, b) => new Date(b.dateAsked).getTime() - new Date(a.dateAsked).getTime());
    if (sortMode === "relevant" && q) return [...filteredQuestions].sort((a, b) => {
      return (relevanceScore(b, q) - relevanceScore(a, q));
    });
    return filteredQuestions;
  }, [filteredQuestions, sortMode, searchQuery]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(sortedFilteredQuestions.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedQuestions = sortedFilteredQuestions.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter((number) => {
      if (totalPages <= 5) return true;
      return number === 1 || number === totalPages || Math.abs(number - safePage) <= 1;
    });

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
        <Button variant="outline" size="sm" disabled={safePage === 1} onClick={() => setCurrentPage(safePage - 1)}>
          Previous
        </Button>
        {pageNumbers.map((number, index) => {
          const previousNumber = pageNumbers[index - 1];
          const isGap = index > 0 && previousNumber !== undefined && number - previousNumber > 1;

          if (isGap) {
            return (
              <span key={`gap-${number}`} className="px-2 text-gray-400">
                ...
              </span>
            );
          }

          return (
            <Button
              key={number}
              variant={number === safePage ? "default" : "outline"}
              size="sm"
              className={number === safePage ? "bg-blue-600 text-white" : ""}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </Button>
          );
        })}
        <Button variant="outline" size="sm" disabled={safePage === totalPages} onClick={() => setCurrentPage(safePage + 1)}>
          Next
        </Button>
      </div>
    );
  };

    const load = async (opts?: { q?: string; category?: string; sort?: "asc" | "desc" }) => {
      let mounted = true;
      const items = await listQuestions(opts);
      if (!mounted) return;
      setQuestions(
        items.map((question) => ({
          id: question.id,
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
          comments: question.comments ?? [],
          status: question.status,
        })),
      );
      return () => {
        mounted = false;
      };
    };

    useEffect(() => {
      load({ q: searchQuery, category: filterCategory });
    }, [searchQuery, filterCategory]);

    useEffect(() => {
      const handler = () => load({ q: searchQuery, category: filterCategory });
      window.addEventListener("questions-updated", handler);
      return () => window.removeEventListener("questions-updated", handler);
    }, [searchQuery, filterCategory]);

  const handleCreateQuestion = async () => {
    try {
      setCreateError(null);
      const question = await createQuestion(newTitle, newBody, newCategory);
      // reload list to avoid duplicates (mock handler emits update event)
      await load({ q: searchQuery, category: filterCategory });
      setCreateOpen(false);
      setNewTitle("");
      setNewBody("");
      setNewCategory("General");
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
                <p className="text-sm text-gray-600">Today</p>
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
        <Select value={sortMode} onValueChange={(v) => setSortMode(v as any)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="relevant" disabled={!searchQuery}>Relevant (search active)</SelectItem>
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
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger id="q-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {forumCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Questions List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Questions ({sortedFilteredQuestions.length})</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {paginatedQuestions.map((q) => (
            <AccordionItem key={q.id} value={`item-${q.id}`} className="border rounded-lg">
              <Card className="border-0">
                <AccordionTrigger className="hover:no-underline px-6">
                  <div className="flex items-start gap-4 text-left flex-1 pr-4">
                    <div className="hidden sm:flex flex-col items-center gap-1 pt-1">
                      <div className={"p-2 rounded-lg " + (q.isSolved ? "bg-green-50" : "bg-orange-50")}>
                          {q.isSolved ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Loader2 className="w-5 h-5 text-orange-600" />
                          )}
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-2">{q.question}</h3>
                      
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{q.answer}</p>

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
                          {q.isSolved ? (
                            <>
                              <p className="font-medium text-sm text-green-900 mb-1">Resolved Answer</p>
                              <p className="text-sm text-gray-700">{(q.comments && q.comments.length > 0) ? [...q.comments].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())[0].body : q.answer}</p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-sm text-green-900 mb-1">Latest Reply</p>
                              <p className="text-sm text-gray-700">{(q.comments && q.comments.length > 0) ? [...q.comments].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())[0].body : <span className="italic text-slate-500">No replies yet</span>}</p>
                            </>
                          )}
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

      {sortedFilteredQuestions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No questions found matching your search criteria.</p>
            <p className="text-sm text-gray-400 mt-2">Try different keywords or browse all categories.</p>
          </CardContent>
        </Card>
      )}

      <PaginationControls />

      {/* CTA */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-8 text-center">
          <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Didn't find what you're looking for?</h3>
          <p className="text-gray-600 mb-4">Ask a new question in the forums and get help from the community</p>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setCreateOpen(true)}>
            <MessageSquare className="w-4 h-4 mr-2"  />
            Ask a Question
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
