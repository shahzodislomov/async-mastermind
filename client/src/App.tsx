import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Feed from "./pages/Feed";
import Submit from "./pages/Submit";
import Members from "./pages/Members";
import Feedback from "./pages/Feedback";
import Archive from "./pages/Archive";
import Achievements from "./pages/Achievements";
import Metrics from "./pages/Metrics";
import Groups from "./pages/Groups";
import Landing from "./pages/Landing";
import Sidebar from "./components/Sidebar";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path={"/(.*)?"} component={() => {
        if (isAuthenticated) {
          return (
            <div className="flex h-screen bg-background">
              <Sidebar />
              <div className="flex-1 overflow-auto">
                <Switch>
                  <Route path="/feed" component={() => <ProtectedRoute component={Feed} />} />
                  <Route path="/submit" component={() => <ProtectedRoute component={Submit} />} />
                  <Route path="/members" component={() => <ProtectedRoute component={Members} />} />
                  <Route path="/feedback" component={() => <ProtectedRoute component={Feedback} />} />
                  <Route path="/archive" component={() => <ProtectedRoute component={Archive} />} />
                  <Route path="/achievements" component={() => <ProtectedRoute component={Achievements} />} />
                  <Route path="/metrics" component={() => <ProtectedRoute component={Metrics} />} />
                  <Route path="/groups" component={() => <ProtectedRoute component={Groups} />} />
                  <Route path="/" component={() => <ProtectedRoute component={Feed} />} />
                  <Route component={NotFound} />
                </Switch>
              </div>
            </div>
          );
        }
        return <Landing />;
      }} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
