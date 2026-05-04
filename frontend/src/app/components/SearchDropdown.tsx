import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { Bell, MessageSquare, HelpCircle, X, Zap, ArrowRight } from "lucide-react";
import { globalSearch, type GlobalSearchResult } from "../api/services/search.service";

interface SearchDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDropdown({ query, isOpen, onClose }: SearchDropdownProps) {
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    globalSearch(query).then((data) => {
      setResults(data);
      setLoading(false);
    });
  }, [query, isOpen]);

  if (!isOpen || !query.trim()) return null;

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case "forum":
        return <MessageSquare className="w-4 h-4" />;
      case "announcement":
        return <Bell className="w-4 h-4" />;
      case "question":
        return <HelpCircle className="w-4 h-4" />;
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

  return (
    <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-w-2xl">
      {loading ? (
        <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
      ) : results.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">No results found</div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                to={result.url}
                onClick={onClose}
                className={`flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors`}
              >
                {/* Feature Icon and Type */}
                <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center ${getFeatureBadgeColor(result.type)}`}>
                  {getFeatureIcon(result.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{result.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{result.body}</p>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-600">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFeatureBadgeColor(result.type)}`}>
                      {result.category}
                    </span>

                    {/* Feature-specific metadata */}
                    {result.type === "forum" && (
                      <>
                        <span>👍 {result.likes}</span>
                        <span>💬 {result.replies}</span>
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
                            {isExpired(result.expiresAt) ? "❌ Expired" : `⏰ Expires ${new Date(result.expiresAt).toLocaleDateString()}`}
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
                        <span>💬 {result.questionReplies}</span>
                      </>
                    )}

                    <span className="ml-auto text-xs text-gray-500">
                      {formatDistanceToNowStrict(new Date(result.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* View All Button */}
          <Link
            to={`/?search=${encodeURIComponent(query)}`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full p-3 border-t bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
          >
            View All Results
            <ArrowRight className="w-4 h-4" />
          </Link>
        </>
      )}
    </div>
  );
}
