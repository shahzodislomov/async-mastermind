import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Plus, Trash2 } from "lucide-react";

interface MetricData {
  week: number;
  date: string;
  value: number;
}

interface CustomMetric {
  id: string;
  name: string;
  unit: string;
  color: string;
  data: MetricData[];
  trend: number;
}

export default function Metrics() {
  const [metrics, setMetrics] = useState<CustomMetric[]>([
    {
      id: "mrr",
      name: "Monthly Recurring Revenue",
      unit: "$",
      color: "#c8a96e",
      data: [
        { week: 1, date: "May 5", value: 2000 },
        { week: 2, date: "May 12", value: 2500 },
        { week: 3, date: "May 19", value: 3200 },
        { week: 4, date: "May 26", value: 4100 },
        { week: 5, date: "Jun 2", value: 5000 },
        { week: 6, date: "Jun 9", value: 5500 },
      ],
      trend: 12.5,
    },
    {
      id: "users",
      name: "Active Users",
      unit: "",
      color: "#22c55e",
      data: [
        { week: 1, date: "May 5", value: 45 },
        { week: 2, date: "May 12", value: 62 },
        { week: 3, date: "May 19", value: 89 },
        { week: 4, date: "May 26", value: 124 },
        { week: 5, date: "Jun 2", value: 156 },
        { week: 6, date: "Jun 9", value: 198 },
      ],
      trend: 18.2,
    },
    {
      id: "engagement",
      name: "Weekly Engagement",
      unit: "%",
      color: "#3b82f6",
      data: [
        { week: 1, date: "May 5", value: 42 },
        { week: 2, date: "May 12", value: 48 },
        { week: 3, date: "May 19", value: 55 },
        { week: 4, date: "May 26", value: 61 },
        { week: 5, date: "Jun 2", value: 68 },
        { week: 6, date: "Jun 9", value: 72 },
      ],
      trend: 8.7,
    },
  ]);

  const [newMetric, setNewMetric] = useState({ name: "", unit: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddMetric = () => {
    if (newMetric.name) {
      const metric: CustomMetric = {
        id: Date.now().toString(),
        name: newMetric.name,
        unit: newMetric.unit,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        data: [],
        trend: 0,
      };
      setMetrics([...metrics, metric]);
      setNewMetric({ name: "", unit: "" });
      setShowAddForm(false);
    }
  };

  const handleDeleteMetric = (id: string) => {
    setMetrics(metrics.filter((m) => m.id !== id));
  };

  const combinedData = metrics[0]?.data || [];

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-normal text-primary">Your Metrics</h1>
            <p className="text-muted-foreground">
              Track custom KPIs and monitor your progress over time
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Metric
          </Button>
        </div>

        {/* Add Metric Form */}
        {showAddForm && (
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-normal">Create New Metric</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Metric name (e.g., Conversion Rate)"
                value={newMetric.name}
                onChange={(e) =>
                  setNewMetric({ ...newMetric, name: e.target.value })
                }
                className="input-field"
              />
              <input
                type="text"
                placeholder="Unit (e.g., %, users, $)"
                value={newMetric.unit}
                onChange={(e) =>
                  setNewMetric({ ...newMetric, unit: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddMetric} className="btn-primary">
                Create Metric
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Combined Chart */}
        {metrics.length > 0 && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-normal">All Metrics Trend</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                {metrics.map((metric) => (
                  <Line
                    key={metric.id}
                    type="monotone"
                    dataKey="value"
                    name={metric.name}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={{ fill: metric.color }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Individual Metrics */}
        <div className="space-y-4">
          <h2 className="text-2xl font-normal">Detailed Metrics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metrics.map((metric) => (
              <Card key={metric.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{metric.name}</p>
                    <p className="text-3xl font-normal text-primary mt-1">
                      {metric.data[metric.data.length - 1]?.value || 0}
                      <span className="text-lg text-muted-foreground ml-1">
                        {metric.unit}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteMetric(metric.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Trend */}
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  <span
                    className={`text-sm font-medium ${
                      metric.trend > 0 ? "text-secondary" : "text-destructive"
                    }`}
                  >
                    {metric.trend > 0 ? "+" : ""}
                    {metric.trend.toFixed(1)}% this month
                  </span>
                </div>

                {/* Mini Chart */}
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={metric.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="week" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Bar dataKey="value" fill={metric.color} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Data Points */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Recent data
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {metric.data.slice(-3).map((point, idx) => (
                      <div
                        key={idx}
                        className="bg-muted p-2 rounded text-center text-xs"
                      >
                        <p className="text-muted-foreground">{point.date}</p>
                        <p className="font-medium text-foreground">
                          {point.value}
                          {metric.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Goals Section */}
        <Card className="p-6 space-y-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <h3 className="text-lg font-normal">Set Goals</h3>
          <p className="text-sm text-muted-foreground">
            Define targets for your metrics and track progress toward them
          </p>
          <Button className="btn-primary">Set Metric Goals</Button>
        </Card>
      </div>
    </div>
  );
}
