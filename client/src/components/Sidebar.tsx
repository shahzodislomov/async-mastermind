import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { BarChart3, Users, MessageSquare, Archive, PlusCircle, LogOut, Trophy, TrendingUp, Settings } from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const navItems = [
    { label: "Feed", path: "/feed", icon: BarChart3 },
    { label: "Submit", path: "/submit", icon: PlusCircle },
    { label: "Members", path: "/members", icon: Users },
    { label: "Feedback", path: "/feedback", icon: MessageSquare },
    { label: "Archive", path: "/archive", icon: Archive },
    { label: "Achievements", path: "/achievements", icon: Trophy },
    { label: "Metrics", path: "/metrics", icon: TrendingUp },
    { label: "Groups", path: "/groups", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sidebar-accent-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-normal text-primary">Async Mastermind</h1>
        <p className="text-sm text-muted-foreground mt-1">Accountability Reimagined</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-border space-y-3">
        {user && (
          <div className="px-4 py-3 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground">{user.name || "User"}</p>
            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
