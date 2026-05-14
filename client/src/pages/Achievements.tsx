import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Trophy, Zap, Target, Heart, Star } from "lucide-react";
import { toast } from "sonner";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
}

export default function Achievements() {
  const { user } = useAuth();

  const achievements: Achievement[] = [
    {
      id: "streak-10",
      name: "Getting Started",
      description: "Complete 10 consecutive weekly submissions",
      icon: <Zap className="w-8 h-8" />,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      progress: 10,
      target: 10,
    },
    {
      id: "streak-25",
      name: "On Fire",
      description: "Maintain a 25-week submission streak",
      icon: <Trophy className="w-8 h-8" />,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      progress: 25,
      target: 25,
    },
    {
      id: "streak-50",
      name: "Unstoppable",
      description: "Reach a 50-week submission streak",
      icon: <Star className="w-8 h-8" />,
      unlocked: false,
      progress: 12,
      target: 50,
    },
    {
      id: "feedback-master",
      name: "Feedback Champion",
      description: "Give 50 pieces of constructive feedback",
      icon: <Heart className="w-8 h-8" />,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      progress: 50,
      target: 50,
    },
    {
      id: "perfect-week",
      name: "Perfect Week",
      description: "Submit all updates and receive feedback in one week",
      icon: <Target className="w-8 h-8" />,
      unlocked: false,
      progress: 3,
      target: 7,
    },
    {
      id: "early-bird",
      name: "Early Bird",
      description: "Submit 10 updates before the deadline",
      icon: <Zap className="w-8 h-8" />,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      progress: 10,
      target: 10,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handleShare = (achievement: Achievement) => {
    const text = `I just unlocked the "${achievement.name}" achievement on Async Mastermind! 🎉 ${achievement.description}`;
    if (navigator.share) {
      navigator.share({
        title: "Async Mastermind Achievement",
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Achievement copied to clipboard!");
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-normal text-primary">Your Achievements</h1>
          <p className="text-muted-foreground">
            {unlockedCount} of {achievements.length} milestones unlocked • Keep building your streak
          </p>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-2">Current Streak</p>
            <p className="text-4xl font-normal text-primary">12</p>
            <p className="text-xs text-muted-foreground mt-2">weeks</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-2">Achievements</p>
            <p className="text-4xl font-normal text-accent">
              {unlockedCount}/{achievements.length}
            </p>
            <p className="text-xs text-muted-foreground mt-2">unlocked</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-2">Total Feedback</p>
            <p className="text-4xl font-normal text-secondary">72</p>
            <p className="text-xs text-muted-foreground mt-2">received</p>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-normal">Milestones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`update-card p-6 space-y-4 transition-all ${
                  achievement.unlocked
                    ? "border-l-primary"
                    : "border-l-muted opacity-75"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`p-3 rounded-lg ${
                      achievement.unlocked
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  {achievement.unlocked && (
                    <button
                      onClick={() => handleShare(achievement)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Share achievement"
                    >
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-normal text-lg">{achievement.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>

                {achievement.unlocked && achievement.unlockedAt ? (
                  <div className="text-xs text-secondary">
                    ✓ Unlocked {achievement.unlockedAt.toLocaleDateString()}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all"
                        style={{
                          width: `${
                            ((achievement.progress || 0) /
                              (achievement.target || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Streak Celebration */}
        {unlockedCount >= 4 && (
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-center space-y-4">
            <p className="text-3xl">🔥</p>
            <h3 className="text-2xl font-normal">You're on Fire!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You've unlocked {unlockedCount} achievements. Keep up the momentum and
              reach for the next milestone!
            </p>
            <Button className="btn-primary">View Leaderboard</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
