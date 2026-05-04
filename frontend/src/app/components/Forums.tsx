import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link } from "react-router";
import { 
  MessagesSquare, 
  TrendingUp, 
  Clock, 
  User, 
  Search,
  MessageCircle,
  Eye,
  ThumbsUp,
  Filter,
} from "lucide-react";
import { isForumLikedByUser, listForums, toggleForumLike } from "../api/services/forums.service";
import { createForum } from "../api/services/forums.service";
import { formatDistanceToNowStrict } from "date-fns";
import { useAuth } from "../auth/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type ForumCardItem = {
  id: string;
  title: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  likes: number;
  lastActive: string;
  createdAt: string;
  body: string;
};

export default function Forums() {
  const { user, isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [forumThreads, setForumThreads] = useState<ForumCardItem[]>([]);
  const [allPage, setAllPage] = useState(1);
  const [trendingPage, setTrendingPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [createError, setCreateError] = useState<string | null>(null);
  const [likedThreads, setLikedThreads] = useState<Record<string, boolean>>({});

  const itemsPerPage = 10;

  const forumCategoryOptions = ["Academic Support", "Campus Life", "Career Services", "IT & Technology", "Student Affairs", "General"];

  useEffect(() => {
    let mounted = true;
    listForums().then((items) => {
      if (!mounted) return;
      setForumThreads(
        items.map((thread) => ({
          id: thread.id,
          title: thread.title,
          author: thread.postedBy.displayName,
          category: thread.category,
          replies: thread.counts.comments,
          views: thread.counts.views,
          likes: thread.counts.likes,
          lastActive: formatDistanceToNowStrict(new Date(thread.repliedAt ?? thread.createdAt), { addSuffix: true }),
          createdAt: thread.createdAt,
          body: thread.body,
        })),
      );
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setLikedThreads({});
      return;
    }

    Promise.all(
      forumThreads.map(async (thread) => ({
        id: thread.id,
        liked: await isForumLikedByUser(thread.id, user.id),
      })),
    ).then((results) => {
      const next: Record<string, boolean> = {};
      results.forEach((item) => {
        next[item.id] = item.liked;
      });
      setLikedThreads(next);
    });
  }, [forumThreads, user]);

  const categories = [
    { name: "Academic Support", count: 234, color: "bg-blue-100 text-blue-700" },
    { name: "Campus Life", count: 156, color: "bg-green-100 text-green-700" },
    { name: "Career Services", count: 89, color: "bg-purple-100 text-purple-700" },
    { name: "IT & Technology", count: 67, color: "bg-orange-100 text-orange-700" },
    { name: "Student Affairs", count: 45, color: "bg-pink-100 text-pink-700" },
    { name: "General", count: 198, color: "bg-gray-100 text-gray-700" },
  ];

  const filteredThreads = useMemo(
    () =>
      forumThreads.filter((thread) => {
        const haystack = `${thread.title} ${thread.author} ${thread.category} ${thread.body}`.toLowerCase();
        return haystack.includes(searchQuery.toLowerCase());
      }),
    [forumThreads, searchQuery],
  );

  const [sortMode, setSortMode] = useState<"trending" | "recent" | "relevant">("trending");

  useEffect(() => {
    setAllPage(1);
    setTrendingPage(1);
    setRecentPage(1);
  }, [searchQuery, sortMode]);

  const relevanceScore = (thread: ForumCardItem, q: string) => {
    const hay = `${thread.title} ${thread.body}`.toLowerCase();
    return (hay.match(new RegExp(q, "gi")) || []).length;
  };

  const trendingThreads = useMemo(() => [...filteredThreads].sort((a, b) => b.likes - a.likes), [filteredThreads]);
  const recentThreads = useMemo(() => [...filteredThreads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [filteredThreads]);
  const relevantThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredThreads;
    return [...filteredThreads].sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q));
  }, [filteredThreads, searchQuery]);

  const allThreads = sortMode === "relevant" && searchQuery ? relevantThreads : filteredThreads;

  const paginate = (items: ForumCardItem[], page: number) => {
    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    const currentPage = Math.min(page, totalPages);
    return {
      currentPage,
      totalPages,
      items: items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    };
  };

  const PaginationControls = ({
    page,
    totalPages,
    onPageChange,
  }: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter((number) => {
      if (totalPages <= 5) return true;
      return number === 1 || number === totalPages || Math.abs(number - page) <= 1;
    });

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
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
              variant={number === page ? "default" : "outline"}
              size="sm"
              className={number === page ? "bg-blue-600 text-white" : ""}
              onClick={() => onPageChange(number)}
            >
              {number}
            </Button>
          );
        })}
        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    );
  };

  const allPagination = paginate(allThreads, allPage);
  const trendingPagination = paginate(trendingThreads, trendingPage);
  const recentPagination = paginate(recentThreads, recentPage);

  const handleCreateForum = async () => {
    try {
      setCreateError(null);
      const thread = await createForum(newTitle, newBody, newCategory);
      // reload list instead of inserting locally to avoid duplicates
      let mounted = true;
      const items = await listForums();
      if (mounted) {
        setForumThreads(
          items.map((thread) => ({
            id: thread.id,
            title: thread.title,
            author: thread.postedBy.displayName,
            category: thread.category,
            replies: thread.counts.comments,
            views: thread.counts.views,
            likes: thread.counts.likes,
            lastActive: formatDistanceToNowStrict(new Date(thread.repliedAt ?? thread.createdAt), { addSuffix: true }),
            createdAt: thread.createdAt,
            body: thread.body,
          })),
        );
      }
      setCreateOpen(false);
      setNewTitle("");
      setNewBody("");
      setNewCategory("General");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Unable to create forum thread");
    }
  };

  const handleToggleLike = async (threadId: string) => {
    if (!user || user.role === "guest") return;
    const updated = await toggleForumLike(threadId, user);

    setForumThreads((current) =>
      current.map((thread) =>
        thread.id === updated.id
          ? {
              ...thread,
              likes: updated.counts.likes,
              replies: updated.counts.comments,
              lastActive: formatDistanceToNowStrict(new Date(updated.repliedAt ?? updated.createdAt), { addSuffix: true }),
            }
          : thread,
      ),
    );

    setLikedThreads((current) => ({ ...current, [threadId]: !current[threadId] }));
  };

  const ThreadList = ({ threads }: { threads: ForumCardItem[] }) => (
    <div className="space-y-3">
      {threads.map((thread) => (
        <Card key={thread.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex flex-col items-center gap-1 pt-1">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <MessagesSquare className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-xs text-gray-500">{thread.replies}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <h3 className="font-semibold text-base line-clamp-2">{thread.title}</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{thread.body}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>{thread.author}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {thread.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">{thread.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{thread.replies}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs">{thread.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{thread.lastActive}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {user && user.role !== "guest" && (
                    <button
                      onClick={() => handleToggleLike(thread.id)}
                      aria-pressed={likedThreads[thread.id]}
                      className={
                        "p-2 rounded transition-colors " + (likedThreads[thread.id] ? "bg-white text-black" : "bg-black text-white")
                      }
                      title={likedThreads[thread.id] ? "Unlike" : "Like"}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                  )}

                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link to={`/forums/${thread.id}`}>View full thread →</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const displayedAllThreads = allPagination.items;
  const displayedTrendingThreads = trendingPagination.items;
  const displayedRecentThreads = recentPagination.items;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Community Forums</h1>
        <p className="text-gray-600">
          Connect with students and staff, ask questions, and share knowledge
        </p>
      </div>

      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search forum discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
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

        {!isGuest && user && (user.role === "student" || user.role === "staff") && (
          <Button className="sm:w-auto" onClick={() => setCreateOpen(true)}>
            <MessagesSquare className="w-4 h-4 mr-2" />
            New Discussion
          </Button>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Forum Discussion</DialogTitle>
            <DialogDescription>Create a discussion thread for students and staff.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forum-title">Title</Label>
              <Input id="forum-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Discussion title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forum-category">Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger id="forum-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {forumCategoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="forum-body">Body</Label>
              <Textarea id="forum-body" value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Write your discussion..." rows={5} />
            </div>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateForum}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Forum Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => (
              <button
                key={category.name}
                className="flex items-center justify-between p-4 rounded-lg border hover:border-blue-400 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${category.color.split(' ')[0]}`} />
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forum Threads */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">All Discussions</h2>
            <p className="text-sm text-gray-500">Use the sort control above to switch between trending, recent, and relevant views.</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {allThreads.length} results
          </Badge>
        </div>

        <ThreadList threads={displayedAllThreads} />
        <PaginationControls page={allPagination.currentPage} totalPages={allPagination.totalPages} onPageChange={setAllPage} />
      </div>
    </div>
  );
}
