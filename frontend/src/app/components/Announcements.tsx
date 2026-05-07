import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Bell, 
  Search, 
  Calendar, 
  Filter,
  AlertCircle,
  Info,
  Megaphone
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { listAnnouncements } from "../api/services/announcements.service";
import { createAnnouncement } from "../api/services/announcements.service";
import { useAuth } from "../auth/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Link } from "react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function Announcements() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState<"all" | "active" | "expired">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("Academic");
  const [newPriority, setNewPriority] = useState<"info" | "warning" | "urgent">("info");
  const [newExpiresAt, setNewExpiresAt] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    type: string;
    date: string;
    time: string;
    author: string;
    tags: string[];
    expiresAt?: string | null;
  }>>([]);

  useEffect(() => {
    let mounted = true;
    listAnnouncements().then((items) => {
      if (!mounted) return;
      setAnnouncements(
        items.map((announcement) => ({
          id: announcement.id,
          title: announcement.title,
          content: announcement.body,
          category: announcement.category,
          type: announcement.priority,
          date: new Date(announcement.createdAt).toLocaleDateString(),
          time: formatDistanceToNowStrict(new Date(announcement.createdAt), { addSuffix: true }),
          author: announcement.postedBy.displayName,
          tags: announcement.tags,
          expiresAt: (announcement as any).expiresAt ?? null,
        })),
      );
    });
    return () => {
      mounted = false;
    };
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" };
      case "warning":
        return { icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50" };
      default:
        return { icon: Info, color: "text-blue-600", bg: "bg-blue-50" };
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "warning":
        return <Badge className="bg-orange-500">Warning</Badge>;
      case "info":
        return <Badge className="bg-blue-500">New Info</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const priorityOptions = [
    { value: "all", label: "All", color: "bg-gray-100 text-gray-700" },
    { value: "info", label: "New Info", color: "bg-blue-100 text-blue-700" },
    { value: "warning", label: "Warning", color: "bg-orange-100 text-orange-700" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
  ];

  const categories = ["all", "Academic", "IT Services", "Events", "Library", "Student Services", "Facilities", "Career Services"];

  const isExpired = (expiresAt?: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const filteredAnnouncements = useMemo(() => announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || announcement.category === filterCategory;
    const matchesPriority = priorityFilter === "all" || announcement.type === priorityFilter;
    const matchesExpiry =
      expiryFilter === "all" ||
      (expiryFilter === "expired" && isExpired(announcement.expiresAt)) ||
      (expiryFilter === "active" && !isExpired(announcement.expiresAt));
    return matchesSearch && matchesCategory && matchesPriority && matchesExpiry;
  }), [announcements, searchQuery, filterCategory, priorityFilter, expiryFilter]);

  const [sortMode, setSortMode] = useState<"trending" | "recent" | "relevant">("recent");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, priorityFilter, expiryFilter, sortMode]);

  const relevanceScore = (item: any, q: string) => {
    const hay = `${item.title} ${item.content}`.toLowerCase();
    const occurrences = (hay.match(new RegExp(q, "gi")) || []).length;
    return occurrences;
  };

  const sortedAnnouncements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (sortMode === "trending") return [...filteredAnnouncements].sort((a, b) => b.type.localeCompare(a.type));
    if (sortMode === "recent") return [...filteredAnnouncements].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (sortMode === "relevant" && q) return [...filteredAnnouncements].sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q));
    return filteredAnnouncements;
  }, [filteredAnnouncements, sortMode, searchQuery]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(sortedAnnouncements.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAnnouncements = sortedAnnouncements.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

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

  const handleCreateAnnouncement = async () => {
    try {
      setCreateError(null);
      const announcement = await createAnnouncement(newTitle, newBody, newCategory, newExpiresAt);
      setAnnouncements((current) => [
        {
          id: announcement.id,
          title: announcement.title,
          content: announcement.body,
          category: announcement.category,
          type: newPriority,
          date: new Date(announcement.createdAt).toLocaleDateString(),
          time: formatDistanceToNowStrict(new Date(announcement.createdAt), { addSuffix: true }),
          expiresAt: announcement.expiresAt ?? newExpiresAt,
          author: announcement.postedBy.displayName,
          tags: announcement.tags,
        },
        ...current,
      ]);
      setCreateOpen(false);
      setNewTitle("");
      setNewBody("");
      setNewCategory("Academic");
      setNewPriority("info");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Unable to create announcement");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Official Announcements</h1>
        <p className="text-gray-600">
          Stay updated with the latest news and important information from the university
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold">
                  {announcements.filter(a => a.type === "urgent").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
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
              <Filter className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {priorityOptions.map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() => setPriorityFilter(priority.value)}
                className={`flex items-center justify-between p-4 rounded-lg border text-left transition-all hover:shadow-sm hover:border-blue-400 ${
                  priorityFilter === priority.value ? "ring-2 ring-blue-500 border-blue-500" : ""
                }`}
              >
                <span className="font-medium text-sm">{priority.label}</span>
                <Badge variant="secondary" className={`text-xs ${priority.color}`}>
                  {priority.value === "all" ? announcements.length : announcements.filter((item) => item.type === priority.value).length}
                </Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search, Filter and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search announcements..."
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
        <Select value={expiryFilter} onValueChange={(value) => setExpiryFilter(value as "all" | "active" | "expired")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by expiry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Non-Expired</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
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
        {user?.role === "staff" && (
          <Button onClick={() => setCreateOpen(true)}>
            <Bell className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
            <DialogDescription>Create an official announcement for the university portal.</DialogDescription>
          </DialogHeader>
            <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ann-title">Title</Label>
              <Input id="ann-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Announcement title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-category">Category</Label>
              <Input id="ann-category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Academic" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-priority">Priority</Label>
              <Select value={newPriority} onValueChange={(value) => setNewPriority(value as typeof newPriority)}>
                <SelectTrigger id="ann-priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-expires">Expires At</Label>
              <Input id="ann-expires" type="date" value={newExpiresAt ?? ""} onChange={(e) => setNewExpiresAt(e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-body">Body</Label>
              <Textarea id="ann-body" value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Write announcement details..." rows={5} />
            </div>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAnnouncement}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Announcements List */}
      <div className="space-y-4">
        {paginatedAnnouncements.map((announcement) => {
          const { icon: Icon, color, bg } = getTypeIcon(announcement.type);
          
          return (
            <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className={`hidden sm:flex items-center justify-center w-12 h-12 rounded-lg ${bg} shrink-0`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {announcement.title}
                      </h3>
                      {getTypeBadge(announcement.type)}
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {announcement.content}
                    </p>
                    
                    {/* removed tags display — body is shown above */}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <Badge variant="secondary" className="text-xs">
                        {announcement.category}
                      </Badge>
                      {announcement.expiresAt && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs">Expires {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <span className="text-xs">{announcement.time}</span>
                      <span className="text-xs">by {announcement.author}</span>
                      <Button asChild variant="link" size="sm" className="ml-auto text-blue-600 p-0 h-auto">
                        <Link to={`/announcements/${announcement.id}`}>Read More →</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedAnnouncements.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No announcements found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

      <PaginationControls />
    </div>
  );
}
