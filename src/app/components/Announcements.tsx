import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function Announcements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const announcements = [
    {
      id: 1,
      title: "Spring 2026 Registration Now Open",
      content: "Registration for Spring 2026 semester is now open. Students can access the registration portal through the student information system. Priority registration dates are based on credit hours completed.",
      category: "Academic",
      type: "urgent",
      date: "March 7, 2026",
      time: "2 hours ago",
      author: "Registrar's Office",
      tags: ["registration", "spring-2026", "academic"],
    },
    {
      id: 2,
      title: "Campus WiFi Maintenance Scheduled",
      content: "The IT department will perform routine maintenance on the campus-wide WiFi network on March 10, 2026, from 2:00 AM to 6:00 AM. During this time, wireless internet access may be intermittent.",
      category: "IT Services",
      type: "info",
      date: "March 7, 2026",
      time: "5 hours ago",
      author: "IT Services",
      tags: ["wifi", "maintenance", "it"],
    },
    {
      id: 3,
      title: "Guest Lecture: The Future of AI in Healthcare",
      content: "Join us for an exciting guest lecture by Dr. Maria Santos on 'The Future of AI in Healthcare' on March 15, 2026, at 4:00 PM in the Main Auditorium. Open to all students and faculty.",
      category: "Events",
      type: "success",
      date: "March 6, 2026",
      time: "1 day ago",
      author: "Department of Computer Science",
      tags: ["lecture", "ai", "healthcare", "event"],
    },
    {
      id: 4,
      title: "Library Extended Hours During Finals Week",
      content: "The University Library will offer extended hours during finals week (March 20-27). The library will be open 24/7 to support students during the examination period. Additional study rooms will be available.",
      category: "Library",
      type: "info",
      date: "March 6, 2026",
      time: "1 day ago",
      author: "University Library",
      tags: ["library", "finals", "study"],
    },
    {
      id: 5,
      title: "New Mental Health Resources Available",
      content: "The Student Wellness Center has launched new mental health support services, including free counseling sessions, meditation workshops, and peer support groups. Schedule appointments online.",
      category: "Student Services",
      type: "success",
      date: "March 5, 2026",
      time: "2 days ago",
      author: "Student Wellness Center",
      tags: ["mental-health", "wellness", "counseling"],
    },
    {
      id: 6,
      title: "Campus Security Alert: Parking Lot Construction",
      content: "Parking Lot C will be closed for construction starting March 12, 2026. Alternative parking is available in Lots A, B, and D. Temporary parking passes can be obtained from Campus Security.",
      category: "Facilities",
      type: "warning",
      date: "March 5, 2026",
      time: "2 days ago",
      author: "Campus Security",
      tags: ["parking", "construction", "facilities"],
    },
    {
      id: 7,
      title: "Career Fair 2026 - Register Now",
      content: "The Annual Career Fair will take place on March 25, 2026. Over 100 employers will be attending. Students are encouraged to register in advance, update their resumes, and prepare for networking opportunities.",
      category: "Career Services",
      type: "urgent",
      date: "March 4, 2026",
      time: "3 days ago",
      author: "Career Services Center",
      tags: ["career-fair", "jobs", "internships"],
    },
    {
      id: 8,
      title: "Spring Break Schedule Reminder",
      content: "Spring break is scheduled for March 14-18, 2026. Classes will not be held during this period. The university will operate on a limited schedule. Residence halls will remain open.",
      category: "Academic",
      type: "info",
      date: "March 3, 2026",
      time: "4 days ago",
      author: "Academic Affairs",
      tags: ["spring-break", "schedule"],
    },
  ];

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

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || announcement.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
      </div>

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
                      <Button variant="link" size="sm" className="ml-auto text-blue-600 p-0 h-auto">
                        Read More →
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
