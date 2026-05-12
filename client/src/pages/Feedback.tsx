import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Feedback() {
  const { data: receivedFeedback, isLoading } = trpc.feedback.received.useQuery({ limit: 50 });
  const [showGiveForm, setShowGiveForm] = useState(false);
  const [selectedTag, setSelectedTag] = useState<"Encouraging" | "Tactical" | "Question" | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const giveFeedbackMutation = trpc.feedback.give.useMutation({
    onSuccess: () => {
      toast.success("Feedback submitted!");
      setFeedbackText("");
      setSelectedTag(null);
      setShowGiveForm(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit feedback");
    },
  });

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTag) {
      toast.error("Please select a feedback type");
      return;
    }
    if (feedbackText.length < 100) {
      toast.error("Feedback must be at least 100 characters");
      return;
    }
    giveFeedbackMutation.mutate({
      updateId: 1,
      body: feedbackText,
      tag: selectedTag,
    });
  };

  const tags = [
    { value: "Encouraging" as const, label: "Encouraging", color: "encouraging" },
    { value: "Tactical" as const, label: "Tactical", color: "tactical" },
    { value: "Question" as const, label: "Question", color: "question" },
  ];

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
          <h1 className="text-4xl font-normal text-primary">Feedback</h1>
          <p className="text-muted-foreground">
            Feedback received • {receivedFeedback?.length || 0} total
          </p>
        </div>

        {/* Give Feedback Section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-normal">Give Feedback</h2>
            <Button
              onClick={() => setShowGiveForm(!showGiveForm)}
              className="btn-secondary"
            >
              {showGiveForm ? "Cancel" : "Write Feedback"}
            </Button>
          </div>

          {showGiveForm && (
            <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-4 border-t border-border">
              {/* Tag Selection */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium mb-2 block">Feedback Type</span>
                  <span className="text-xs text-muted-foreground">
                    Choose the type of feedback you are giving
                  </span>
                </label>
                <div className="flex gap-3">
                  {tags.map((tag) => (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => setSelectedTag(tag.value)}
                      className={`feedback-tag ${tag.color} ${
                        selectedTag === tag.value ? "ring-2 ring-offset-2" : ""
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium mb-2 block">Your Feedback</span>
                  <span className="text-xs text-muted-foreground">
                    Minimum 100 characters • Be specific and actionable
                  </span>
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or questions..."
                  minLength={100}
                  maxLength={1000}
                  className="input-field min-h-32 resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {feedbackText.length}/1000
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={giveFeedbackMutation.isPending || !selectedTag || feedbackText.length < 100}
                className="btn-primary w-full"
              >
                {giveFeedbackMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Received Feedback */}
        <div className="space-y-4">
          <h2 className="text-2xl font-normal">Feedback You have Received</h2>
          {receivedFeedback && receivedFeedback.length > 0 ? (
            <div className="space-y-4">
              {receivedFeedback.map((fb) => (
                <div key={fb.id} className="update-card p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">From: Anonymous</p>
                    </div>
                    <span className={`feedback-tag ${fb.tag.toLowerCase()}`}>
                      {fb.tag}
                    </span>
                  </div>
                  <p className="text-foreground leading-relaxed">{fb.body}</p>
                  {fb.rating && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Helpfulness: {"⭐".repeat(fb.rating)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No feedback yet. Submit an update to receive feedback from your group.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
