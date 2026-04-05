import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  ThumbsUp 
} from "lucide-react";
import { listForums } from "../api/services/forums.service";
import { createForum } from "../api/services/forums.service";
import { formatDistanceToNowStrict } from "date-fns";
import { useAuth } from "../auth/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

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
  tags: string[];
  isPinned: boolean;
};

export default function Forums() {
  const { user, isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [forumThreads, setForumThreads] = useState<ForumCardItem[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [createError, setCreateError] = useState<string | null>(null);

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
          tags: thread.tags,
          isPinned: thread.isPinned,
        })),
      );
    });
    return () => {
      mounted = false;
    };
  }, []);

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
        const haystack = `${thread.title} ${thread.author} ${thread.category} ${thread.tags.join(" ")}`.toLowerCase();
        return haystack.includes(searchQuery.toLowerCase());
      }),
    [forumThreads, searchQuery],
  );

  const trendingThreads = filteredThreads.slice(0, 3);
  const recentThreads = [...filteredThreads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const handleCreateForum = async () => {
    try {
      setCreateError(null);
      const thread = await createForum(newTitle, newBody, newCategory);
      setForumThreads((current) => [
        {
          id: thread.id,
          title: thread.title,
          author: thread.postedBy.displayName,
          category: thread.category,
          replies: thread.counts.comments,
          views: thread.counts.views,
          likes: thread.counts.likes,
          lastActive: formatDistanceToNowStrict(new Date(thread.createdAt), { addSuffix: true }),
          createdAt: thread.createdAt,
          tags: thread.tags,
          isPinned: thread.isPinned,
        },
        ...current,
      ]);
      setCreateOpen(false);
      setNewTitle("");
      setNewBody("");
      setNewCategory("General");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Unable to create forum thread");
    }
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
                <div className="flex items-start gap-2 mb-2">
                  {thread.isPinned && (
                    <Badge variant="secondary" className="text-xs">📌 Pinned</Badge>
                  )}
                  <h3 className="font-semibold text-base line-clamp-2 flex-1">
                    {thread.title}
                  </h3>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {thread.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

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

                <Button asChild variant="link" className="p-0 h-auto mt-3">
                  <Link to={`/forums/${thread.id}`}>View full thread →</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
              <Input id="forum-category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="General" />
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
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All Discussions</TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="w-4 h-4 mr-2" />
            Recent
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ThreadList threads={filteredThreads} />
        </TabsContent>
        
        <TabsContent value="trending" className="mt-6">
          <ThreadList threads={trendingThreads} />
        </TabsContent>
        
        <TabsContent value="recent" className="mt-6">
          <ThreadList threads={recentThreads} />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <Button variant="outline" size="sm" disabled>Previous</Button>
        <Button variant="outline" size="sm" className="bg-blue-600 text-white">1</Button>
        <Button variant="outline" size="sm">2</Button>
        <Button variant="outline" size="sm">3</Button>
        <Button variant="outline" size="sm">Next</Button>
      </div>
    </div>
  );
}
