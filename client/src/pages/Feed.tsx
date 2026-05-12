import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Feed() {
  const { user } = useAuth();
  const { data: updates, isLoading } = trpc.updates.list.useQuery({ limit: 20 });

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
