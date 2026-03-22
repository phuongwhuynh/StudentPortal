import { Link } from "react-router";
import { Button } from "./ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-8">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-2">Page Not Found</h2>
        <p className="text-gray-600 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
        <Link to="/forums">
          <Button variant="outline" className="gap-2">
            <Search className="w-4 h-4" />
            Browse Forums
          </Button>
        </Link>
      </div>
    </div>
  );
}
