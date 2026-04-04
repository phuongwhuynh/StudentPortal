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
  CheckCircle,
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
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("Academic");
  const [newPriority, setNewPriority] = useState<"info" | "warning" | "success" | "urgent">("info");
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
      case "success":
        return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" };
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
      case "success":
        return <Badge className="bg-green-500">New</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const categories = ["all", "Academic", "IT Services", "Events", "Library", "Student Services", "Facilities", "Career Services"];

  const filteredAnnouncements = useMemo(() => announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || announcement.category === filterCategory;
    return matchesSearch && matchesCategory;
  }), [announcements, searchQuery, filterCategory]);

  const handleCreateAnnouncement = async () => {
    try {
      setCreateError(null);
      const announcement = await createAnnouncement(newTitle, newBody, newCategory);
      setAnnouncements((current) => [
        {
          id: announcement.id,
          title: announcement.title,
          content: announcement.body,
          category: announcement.category,
          type: newPriority,
          date: new Date(announcement.createdAt).toLocaleDateString(),
          time: formatDistanceToNowStrict(new Date(announcement.createdAt), { addSuffix: true }),
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
                <p className="text-sm text-gray-600">This Week</p>
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

      {/* Search and Filter */}
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
                  <SelectItem value="success">New</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
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
        {filteredAnnouncements.map((announcement) => {
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
                    
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {announcement.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <Badge variant="secondary" className="text-xs">
                        {announcement.category}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs">{announcement.date}</span>
                      </div>
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

      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No announcements found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
