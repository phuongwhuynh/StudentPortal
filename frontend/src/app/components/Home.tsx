import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Bell, MessagesSquare, TrendingUp, Clock, ArrowRight } from "lucide-react";

export default function Home() {
  const recentAnnouncements = [
    {
      id: 1,
      title: "Spring Semester Registration Opens",
      date: "2 hours ago",
      category: "Academic",
      urgent: true,
    },
    {
      id: 2,
      title: "Campus WiFi Maintenance - March 10",
      date: "5 hours ago",
      category: "IT Services",
      urgent: false,
    },
    {
      id: 3,
      title: "Guest Lecture: AI in Healthcare",
      date: "1 day ago",
      category: "Events",
      urgent: false,
    },
  ];

  const trendingTopics = [
    {
      id: 1,
      title: "How to access library resources remotely?",
      replies: 24,
      category: "Library",
    },
    {
      id: 2,
      title: "Career fair preparation tips",
      replies: 18,
      category: "Career Services",
    },
    {
      id: 3,
      title: "Study group for Advanced Mathematics",
      replies: 15,
      category: "Academics",
    },
  ];

  const quickStats = [
    { label: "Active Discussions", value: "156", icon: MessagesSquare, color: "text-blue-600" },
    { label: "New Announcements", value: "12", icon: Bell, color: "text-green-600" },
    { label: "Answered Questions", value: "2,340", icon: TrendingUp, color: "text-purple-600" },
    { label: "Today's Posts", value: "48", icon: Clock, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to UniHub</h1>
        <p className="text-gray-600">
          Your centralized platform for forums, announcements, and historical Q&A
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Announcements</CardTitle>
                <CardDescription>Latest updates from the university</CardDescription>
              </div>
              <Link to="/announcements">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start space-x-3 pb-4 border-b last:border-b-0 last:pb-0"
                >
                  <div className="p-2 bg-blue-50 rounded-lg mt-1">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {announcement.title}
                      </h4>
                      {announcement.urgent && (
                        <Badge variant="destructive" className="text-xs shrink-0">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Badge variant="secondary" className="text-xs">
                        {announcement.category}
                      </Badge>
                      <span>•</span>
                      <span>{announcement.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Trending Topics</CardTitle>
                <CardDescription>Popular discussions right now</CardDescription>
              </div>
              <Link to="/forums">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-start space-x-3 pb-4 border-b last:border-b-0 last:pb-0"
                >
                  <div className="p-2 bg-purple-50 rounded-lg mt-1">
                    <MessagesSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {topic.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Badge variant="secondary" className="text-xs">
                        {topic.category}
                      </Badge>
                      <span>•</span>
                      <span>{topic.replies} replies</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Navigate to different sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/forums">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <MessagesSquare className="w-6 h-6" />
                <span>Browse Forums</span>
              </Button>
            </Link>
            <Link to="/announcements">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Bell className="w-6 h-6" />
                <span>View Announcements</span>
              </Button>
            </Link>
            <Link to="/questions">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <TrendingUp className="w-6 h-6" />
                <span>Search Q&A Archive</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
