import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Feed() {
  const { user } = useAuth();
  const { data: updates, isLoading } = trpc.updates.list.useQuery({ limit: 20 });
  const { subscribe } = useRealtime(user?.id);
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);

  // Subscribe to real-time update events
  useEffect(() => {
    const unsubscribe = subscribe("update:new", (data: any) => {
      setLiveUpdates((prev) => [data, ...prev]);
      toast.success(`New update submitted!`);
    });
    return unsubscribe;
  }, [subscribe]);

  // Subscribe to streak milestone events
  useEffect(() => {
    const unsubscribe = subscribe("streak:achieved", (data: any) => {
      toast.success(`🔥 ${data.weeks}-week streak achieved!`);
    });
    return unsubscribe;
  }, [subscribe]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-normal text-primary">This Week's Progress</h1>
          <p className="text-muted-foreground">
            Week 12 • Submission deadline: Wednesday 23:59 UTC
          </p>
        </div>

        {/* Week Progress Bar */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-normal">Group Progress</h2>
            <span className="text-sm text-muted-foreground">5 of 8 submitted</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "62.5%" }}></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-normal text-primary">12 weeks</p>
            </div>
            <div>
              <p className="text-muted-foreground">Your Streak</p>
              <p className="text-2xl font-normal text-secondary">12 weeks</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Feedback Score</p>
              <p className="text-2xl font-normal text-accent">4.8/5</p>
            </div>
          </div>
        </div>

        {/* Live Updates Badge */}
        {liveUpdates.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
            <p className="text-sm font-medium text-primary">
              {liveUpdates.length} new update{liveUpdates.length > 1 ? "s" : ""} just submitted!
            </p>
          </div>
        )}

        {/* Updates List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-normal">Recent Updates</h2>
          {updates && updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="update-card p-6 space-y-4 hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(update.submittedAt).toLocaleDateString()}
                      </p>
                      <p className="text-lg font-normal">Week {update.weekId}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-2xl">
                        {["😞", "😐", "🙂", "😊", "🎉"][update.mood - 1]}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-secondary font-medium mb-2">Win</p>
                      <p className="text-foreground">{update.win}</p>
                    </div>
                    <div>
                      <p className="text-sm text-destructive font-medium mb-2">Blocker</p>
                      <p className="text-foreground">{update.blocker}</p>
                    </div>
                  </div>

                  {update.metricValue && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">Metric</p>
                      <p className="text-lg text-primary">${update.metricValue}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No updates yet. Start by submitting your first update.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
