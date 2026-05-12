import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-normal text-primary">Async Mastermind</h1>
          <p className="text-xl text-muted-foreground">
            Accountability for the asynchronous age. Weekly updates, peer feedback, no meetings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="text-3xl text-primary mb-3">📝</div>
            <h3 className="text-lg font-normal mb-2">Structured Updates</h3>
            <p className="text-sm text-muted-foreground">
              Win, blocker, target, reflection. No blank pages. Just signal.
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="text-3xl text-secondary mb-3">👥</div>
            <h3 className="text-lg font-normal mb-2">Peer Accountability</h3>
            <p className="text-sm text-muted-foreground">
              Small groups (5-8 people) that actually know each other.
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="text-3xl text-accent mb-3">📊</div>
            <h3 className="text-lg font-normal mb-2">Personal Archive</h3>
            <p className="text-sm text-muted-foreground">
              18 weeks of metrics. Your structured autobiography of work.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            Join a group or create your own. Start your weekly rhythm today.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-primary text-primary-foreground hover:opacity-90 px-8 py-3 text-lg"
          >
            Sign In with Manus
          </Button>
        </div>
      </div>
    </div>
  );
}
