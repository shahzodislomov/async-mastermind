import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function Archive() {
  const { data: metrics, isLoading } = trpc.archive.metrics.useQuery({ groupId: 1 });

  const handleExport = (format: "csv" | "json") => {
    try {
      let data = "";
      let filename = "";

      if (format === "csv") {
        data = "Date,Win,Blocker,Mood,Metric\n2026-05-05,Shipped auth,Database issues,4,5000\n2026-04-28,Hit MRR,Burnout,3,4500";
        filename = `archive-${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        data = JSON.stringify(
          [
            { week: 1, win: "Shipped auth", blocker: "Database issues", mood: 4, metric: 5000 },
            { week: 2, win: "Hit MRR", blocker: "Burnout", mood: 3, metric: 4500 },
          ],
          null,
          2
        );
        filename = `archive-${new Date().toISOString().split("T")[0]}.json`;
      }

      const element = document.createElement("a");
      element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`);
      element.setAttribute("download", filename);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const chartData = metrics?.map((m, idx) => ({
    week: `W${idx + 1}`,
    value: parseFloat(m.value?.toString() || "0"),
  })) || [];

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-normal text-primary">Your Archive</h1>
          <p className="text-muted-foreground">
            18 weeks of progress • Your structured autobiography of work
          </p>
        </div>

        {/* MRR Chart */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-normal">Progress Over 18 Weeks</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  dot={{ fill: "var(--primary)" }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available yet
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-normal">Export Your Archive</h2>
          <p className="text-sm text-muted-foreground">
            Download your complete update history in your preferred format
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => handleExport("csv")}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export as CSV
            </Button>
            <Button
              onClick={() => handleExport("json")}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export as JSON
            </Button>
          </div>
        </div>

        {/* Entry Log */}
        <div className="space-y-4">
          <h2 className="text-2xl font-normal">Update Log</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((week) => (
              <div
                key={week}
                className="update-card p-4 flex justify-between items-center hover:border-primary transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-sm text-muted-foreground">Week {18 - week + 1}</p>
                  <p className="font-normal">
                    {new Date(Date.now() - week * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Mood</p>
                    <p className="text-lg">😊</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Metric</p>
                    <p className="text-lg font-normal text-primary">
                      ${5000 + week * 500}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-2">Total Updates</p>
            <p className="text-3xl font-normal text-primary">18</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-2">Avg Mood</p>
            <p className="text-3xl">😊</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-2">Total Feedback</p>
            <p className="text-3xl font-normal text-accent">72</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
