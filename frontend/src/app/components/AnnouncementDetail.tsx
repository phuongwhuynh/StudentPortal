import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { ArrowLeft, Eye, Heart, User, Trash2 } from "lucide-react";
import { getAnnouncementById } from "../api/services/announcements.service";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import type { AnnouncementPost } from "../types/content";

export default function AnnouncementDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<AnnouncementPost | null>(null);

  useEffect(() => {
    if (!id) return;
    getAnnouncementById(id).then((item) => setPost(item ?? null));
  }, [id]);

  if (!post) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-gray-500">Announcement not found.</p>
          <Button asChild variant="outline">
            <Link to="/announcements">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Announcements
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost">
          <Link to="/announcements">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Announcements
          </Link>
        </Button>
        <Badge variant="secondary">{post.category}</Badge>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge>{post.priority.toUpperCase()}</Badge>
                  <Badge variant="secondary">Announcement</Badge>
                </div>
                <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
              </div>
              {user?.role === "staff" && <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.postedBy.displayName}</span>
              <span>{formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{post.counts.views} views</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{post.counts.likes} likes</span>
            </div>

            <p className="text-gray-700 leading-7 whitespace-pre-wrap">{post.body}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
