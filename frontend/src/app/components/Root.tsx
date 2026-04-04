import { Outlet, Link, useLocation } from "react-router";
import { Search, BookOpen, MessagesSquare, Bell, HelpCircle, Menu, X, LogIn, LogOut, UserPlus, Shield, User } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { useAuth } from "../auth/AuthContext";

export default function Root() {
  const location = useLocation();
  const { user, isGuest, isLoading, loginUser, logoutUser, continueAsGuest, registerStaffUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const roleLabel = useMemo(() => {
    if (!user) return isGuest ? "Guest" : "Anonymous";
    return user.role === "staff" ? "Staff" : "Student";
  }, [user, isGuest]);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: BookOpen },
    { path: "/forums", label: "Forums", icon: MessagesSquare },
    { path: "/announcements", label: "Announcements", icon: Bell },
    { path: "/questions", label: "Q&A Archive", icon: HelpCircle },
  ];

  const resetAuthForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setAuthError(null);
  };

  const handleAuthSubmit = async () => {
    try {
      setAuthError(null);
      if (authMode === "login") {
        await loginUser({ email, password });
      } else {
        await registerStaffUser({ email, password, displayName });
      }
      setAuthOpen(false);
      resetAuthForm();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-semibold text-lg">UniHub</h1>
                  {/* <p className="text-xs text-gray-500">Information Portal</p> */}
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-3 ml-8 flex-1 justify-end">
              {/* Search Bar - Desktop */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search forums, announcements, Q&A..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50"
                />
              </div>
              {!isLoading && (
                <div className="flex items-center gap-2">
                  {user ? (
                    <>
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        {roleLabel}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="max-w-36 truncate">{user.displayName}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={logoutUser}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => { setAuthMode("login"); setAuthOpen(true); }}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50"
              />
            </div>
            {!isLoading && (
              <div className="flex flex-wrap gap-2">
                {user ? (
                  <>
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      {roleLabel}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={logoutUser}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => { setAuthMode("login"); setAuthOpen(true); }}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <Dialog
        open={authOpen}
        onOpenChange={(open) => {
          setAuthOpen(open);
          if (!open) resetAuthForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{authMode === "login" ? "Login" : "Staff Registration"}</DialogTitle>
            <DialogDescription>
              {authMode === "login"
                ? "Use a seeded student or staff account. Guests can continue without login."
                : "Only staff accounts can be created in this phase."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@unihub.edu" />
            </div>
            {authMode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Admin Office" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" onClick={() => setAuthOpen(false)}>Cancel</Button>
              <Button onClick={handleAuthSubmit}>
                {authMode === "login" ? "Login" : "Create Staff Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3">About UniHub</h3>
              <p className="text-sm text-gray-600">
                Your centralized platform for university information, forums, and announcements.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/forums" className="hover:text-blue-600">Forums</Link></li>
                <li><Link to="/announcements" className="hover:text-blue-600">Announcements</Link></li>
                <li><Link to="/questions" className="hover:text-blue-600">Q&A Archive</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Contact</h3>
              <p className="text-sm text-gray-600">
                Need help? Contact support@university.edu
              </p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
            © 2026 University Information Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
