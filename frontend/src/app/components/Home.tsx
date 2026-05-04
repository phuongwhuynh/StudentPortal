import { useState, useEffect, type FormEvent } from "react";
import { useSearchParams, Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Bell, MessagesSquare, TrendingUp, Clock, ArrowRight, Search } from "lucide-react";
import { globalSearch, type GlobalSearchResult } from "../api/services/search.service";
import { formatDistanceToNowStrict } from "date-fns";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);

  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    globalSearch(searchQuery).then((results) => {
      setSearchResults(results);
      setLoading(false);
    });
  }, [searchQuery]);

  useEffect(() => {
    setSearchPage(1);
  }, [searchQuery]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case "forum":
        return <MessagesSquare className="w-4 h-4" />;
      case "announcement":
        return <Bell className="w-4 h-4" />;
      case "question":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getFeatureBadgeColor = (type: string) => {
    switch (type) {
      case "forum":
        return "bg-blue-100 text-blue-700";
      case "announcement":
        return "bg-green-100 text-green-700";
      case "question":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const isExpired = (expiresAt?: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const searchItemsPerPage = 10;
  const searchTotalPages = Math.max(1, Math.ceil(searchResults.length / searchItemsPerPage));
  const safeSearchPage = Math.min(searchPage, searchTotalPages);
  const visibleSearchResults = searchResults.slice((safeSearchPage - 1) * searchItemsPerPage, safeSearchPage * searchItemsPerPage);

  const SearchPagination = () => {
    if (searchTotalPages <= 1) return null;

    const pageNumbers = Array.from({ length: searchTotalPages }, (_, index) => index + 1).filter((number) => {
      if (searchTotalPages <= 5) return true;
      return number === 1 || number === searchTotalPages || Math.abs(number - safeSearchPage) <= 1;
    });

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={safeSearchPage === 1}
          onClick={() => setSearchPage(safeSearchPage - 1)}
        >
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
              variant={number === safeSearchPage ? "default" : "outline"}
              size="sm"
              className={number === safeSearchPage ? "bg-blue-600 text-white" : ""}
              onClick={() => setSearchPage(number)}
            >
              {number}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={safeSearchPage === searchTotalPages}
          onClick={() => setSearchPage(safeSearchPage + 1)}
        >
          Next
        </Button>
      </div>
    );
  };

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
    { label: "Today's Discussions", value: "156", icon: MessagesSquare, color: "text-blue-600" },
    { label: "Today's Announcements", value: "12", icon: Bell, color: "text-green-600" },
    { label: "Urgent Announcements", value: "2,340", icon: TrendingUp, color: "text-purple-600" },
    { label: "Today's Questions", value: "48", icon: Clock, color: "text-orange-600" },
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

      {/* Dashboard Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search the Dashboard</CardTitle>
          <CardDescription>Search forums, announcements, and Q&A without leaving the dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search the university hub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50"
              />
            </div>
            <Button type="submit">Search</Button>
            {searchQuery.trim() && (
              <Button type="button" variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </form>

          {!searchQuery.trim() ? (
            <p className="text-sm text-gray-500">
              Try topics, announcements, question titles, categories, or keywords from any section.
            </p>
          ) : loading ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : visibleSearchResults.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
              No results found.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
              </div>
              <div className="grid gap-3">
                {visibleSearchResults.map((result) => (
                  <Link key={`${result.type}-${result.id}`} to={result.url} className="block">
                    <Card className="border hover:shadow-md transition-shadow">
                      <CardContent className="pt-5">
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded flex items-center justify-center ${getFeatureBadgeColor(result.type)}`}>
                            {getFeatureIcon(result.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{result.title}</h3>
                              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getFeatureBadgeColor(result.type)}`}>
                                {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{result.body}</p>

                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-600">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFeatureBadgeColor(result.type)}`}>
                                {result.category}
                              </span>

                              {result.type === "forum" && (
                                <>
                                  <span>👍 {result.likes} like{result.likes !== 1 ? "s" : ""}</span>
                                  <span>💬 {result.replies} repl{result.replies !== 1 ? "ies" : "y"}</span>
                                </>
                              )}

                              {result.type === "announcement" && (
                                <>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    result.priority === "urgent"
                                      ? "bg-red-100 text-red-700"
                                      : result.priority === "warning"
                                        ? "bg-orange-100 text-orange-700"
                                        : result.priority === "success"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-blue-100 text-blue-700"
                                  }`}>
                                    {result.priority?.toUpperCase()}
                                  </span>
                                  {result.expiresAt && (
                                    <span className={isExpired(result.expiresAt) ? "text-red-600 font-medium" : ""}>
                                      {isExpired(result.expiresAt)
                                        ? "❌ Expired"
                                        : `⏰ Expires ${new Date(result.expiresAt).toLocaleDateString()}`}
                                    </span>
                                  )}
                                </>
                              )}

                              {result.type === "question" && (
                                <>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    result.status === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : result.status === "in-progress"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-gray-100 text-gray-700"
                                  }`}>
                                    {result.status?.replace("-", " ").toUpperCase()}
                                  </span>
                                  <span>💬 {result.questionReplies} repl{result.questionReplies !== 1 ? "ies" : "y"}</span>
                                </>
                              )}

                              <span className="ml-auto">
                                {formatDistanceToNowStrict(new Date(result.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <SearchPagination />
            </div>
          )}
        </CardContent>
      </Card>

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
