import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Search } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function Archive() {
  const { data: metrics, isLoading } = trpc.archive.metrics.useQuery({ groupId: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<number | null>(null);

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

  // Mock entry data for filtering
  const allEntries = [
    { week: 18, date: new Date(Date.now() - 0 * 7 * 24 * 60 * 60 * 1000), mood: 4, metric: 5500, win: "Shipped auth", blocker: "Database issues" },
    { week: 17, date: new Date(Date.now() - 1 * 7 * 24 * 60 * 60 * 1000), mood: 3, metric: 5000, win: "Hit MRR", blocker: "Burnout" },
    { week: 16, date: new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000), mood: 4, metric: 4800, win: "Onboarded users", blocker: "Payment integration" },
    { week: 15, date: new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000), mood: 2, metric: 4500, win: "Fixed bugs", blocker: "Team bandwidth" },
    { week: 14, date: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000), mood: 5, metric: 5200, win: "Launched feature", blocker: "None" },
  ];

  // Filter entries based on search and mood
  const filteredEntries = allEntries.filter((entry) => {
    const matchesSearch =
      entry.win.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.blocker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = moodFilter === null || entry.mood === moodFilter;
    return matchesSearch && matchesMood;
  });

  const moodEmojis: Record<number, string> = {
    1: "😞",
    2: "😐",
    3: "🙂",
    4: "😊",
    5: "🎉",
  };

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

        {/* Search and Filter */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-normal">Search and Filter</h2>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search wins and blockers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Mood Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Filter by mood</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setMoodFilter(null)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    moodFilter === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-border"
                  }`}
                >
                  All
                </button>
                {[1, 2, 3, 4, 5].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setMoodFilter(mood)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      moodFilter === mood
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-border"
                    }`}
                  >
                    {moodEmojis[mood]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Entry Log */}
        <div className="space-y-4">
          <h2 className="text-2xl font-normal">
            Update Log ({filteredEntries.length} results)
          </h2>
          <div className="space-y-3">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <div
                  key={entry.week}
                  className="update-card p-4 flex justify-between items-center hover:border-primary transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">Week {entry.week}</p>
                    <p className="font-normal">{entry.date.toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">{entry.win}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Mood</p>
                      <p className="text-lg">{moodEmojis[entry.mood]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Metric</p>
                      <p className="text-lg font-normal text-primary">
                        ${entry.metric}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No updates match your search or filter criteria.
                </p>
              </Card>
            )}
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
