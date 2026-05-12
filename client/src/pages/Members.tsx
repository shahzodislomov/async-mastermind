import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";

export default function Members() {
  const { data: members, isLoading } = trpc.members.list.useQuery({ groupId: 1 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-normal text-primary">Group Members</h1>
          <p className="text-muted-foreground">
            Accountability at a glance • 8 members • 12-week streak
          </p>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members && members.length > 0 ? (
            members.map((member) => {
              const isAtRisk = member.streak < 2;
              return (
                <div
                  key={member.id}
                  className="update-card p-6 space-y-4"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-normal">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    {isAtRisk && (
                      <div className="status-badge at-risk">
                        <AlertTriangle className="w-3 h-3" />
                        At Risk
                      </div>
                    )}
                  </div>

                  <div className="divider" />

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Streak</p>
                      <p className="text-2xl font-normal text-primary">
                        {member.streak}
                      </p>
                      <p className="text-xs text-muted-foreground">weeks</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Feedback Score</p>
                      <p className="text-2xl font-normal text-accent">
                        {member.feedbackScore}
                      </p>
                      <p className="text-xs text-muted-foreground">/5.0</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Status</p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          member.status === "active"
                            ? "bg-secondary"
                            : member.status === "paused"
                            ? "bg-muted"
                            : "bg-destructive"
                        }`}
                      />
                      <span className="text-sm capitalize">{member.status}</span>
                    </div>
                  </div>

                  {/* Last Update */}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">Last update</p>
                    <p className="text-sm">2 days ago</p>
                  </div>
                </div>
              );
            })
          ) : (
            <Card className="col-span-full p-8 text-center">
              <p className="text-muted-foreground">No members in this group yet.</p>
            </Card>
          )}
        </div>

        {/* Group Metrics */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-normal">Group Metrics</h2>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground mb-2">Current Streak</p>
              <p className="text-3xl font-normal text-primary">12</p>
              <p className="text-xs text-muted-foreground mt-1">weeks</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Avg Feedback Score</p>
              <p className="text-3xl font-normal text-accent">4.7</p>
              <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Submission Rate</p>
              <p className="text-3xl font-normal text-secondary">100%</p>
              <p className="text-xs text-muted-foreground mt-1">this week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
