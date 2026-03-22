import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
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

export default function Forums() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Academic Support", count: 234, color: "bg-blue-100 text-blue-700" },
    { name: "Campus Life", count: 156, color: "bg-green-100 text-green-700" },
    { name: "Career Services", count: 89, color: "bg-purple-100 text-purple-700" },
    { name: "IT & Technology", count: 67, color: "bg-orange-100 text-orange-700" },
    { name: "Student Affairs", count: 45, color: "bg-pink-100 text-pink-700" },
    { name: "General", count: 198, color: "bg-gray-100 text-gray-700" },
  ];

  const forumThreads = [
    {
      id: 1,
      title: "How do I access the digital library from off-campus?",
      author: "Sarah Chen",
      category: "Academic Support",
      replies: 12,
      views: 245,
      likes: 8,
      lastActive: "15 mins ago",
      tags: ["library", "vpn", "resources"],
      isPinned: true,
    },
    {
      id: 2,
      title: "Best study spots on campus during finals week?",
      author: "Michael Rodriguez",
      category: "Campus Life",
      replies: 34,
      views: 512,
      likes: 23,
      lastActive: "1 hour ago",
      tags: ["study", "finals", "campus"],
      isPinned: false,
    },
    {
      id: 3,
      title: "Resume review - Career Services feedback",
      author: "Emily Watson",
      category: "Career Services",
      replies: 8,
      views: 167,
      likes: 5,
      lastActive: "2 hours ago",
      tags: ["resume", "career", "advice"],
      isPinned: false,
    },
    {
      id: 4,
      title: "WiFi connection issues in Engineering Building",
      author: "David Kim",
      category: "IT & Technology",
      replies: 15,
      views: 289,
      likes: 11,
      lastActive: "3 hours ago",
      tags: ["wifi", "technical", "campus-it"],
      isPinned: false,
    },
    {
      id: 5,
      title: "International student orientation - Spring 2026",
      author: "Priya Patel",
      category: "Student Affairs",
      replies: 28,
      views: 421,
      likes: 19,
      lastActive: "5 hours ago",
      tags: ["international", "orientation", "new-students"],
      isPinned: true,
    },
    {
      id: 6,
      title: "Looking for a study group - Advanced Calculus",
      author: "James Thompson",
      category: "Academic Support",
      replies: 9,
      views: 134,
      likes: 6,
      lastActive: "6 hours ago",
      tags: ["study-group", "mathematics", "calculus"],
      isPinned: false,
    },
  ];

  const trendingThreads = forumThreads.slice(0, 3);
  const recentThreads = [...forumThreads].sort((a, b) => 
    parseInt(a.lastActive) - parseInt(b.lastActive)
  );

  const ThreadList = ({ threads }: { threads: typeof forumThreads }) => (
    <div className="space-y-3">
      {threads.map((thread) => (
        <Card key={thread.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
        <Button className="sm:w-auto">
          <MessagesSquare className="w-4 h-4 mr-2" />
          New Discussion
        </Button>
      </div>

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
          <ThreadList threads={forumThreads} />
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
