import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Loader2, Mic, Square } from "lucide-react";

export default function Submit() {
  const { user } = useAuth();
  const [mood, setMood] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [formData, setFormData] = useState({
    win: "",
    blocker: "",
    target: "",
    reflection: "",
    metricValue: "",
  });

  const submitMutation = trpc.updates.submit.useMutation({
    onSuccess: () => {
      toast.success("Update submitted successfully!");
      setFormData({ win: "", blocker: "", target: "", reflection: "", metricValue: "" });
      setMood(3);
      setVoiceNoteUrl(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit update");
    },
  });

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setVoiceNoteUrl(url);
        toast.success("Voice note recorded");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("Failed to access microphone");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      win: formData.win,
      blocker: formData.blocker,
      target: formData.target,
      reflection: formData.reflection,
      mood,
      metricValue: formData.metricValue ? parseFloat(formData.metricValue) : undefined,
      groupId: 1,
      weekId: 1,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const moodOptions = [
    { value: 1, emoji: "😞", label: "Struggling" },
    { value: 2, emoji: "😐", label: "Okay" },
    { value: 3, emoji: "🙂", label: "Good" },
    { value: 4, emoji: "😊", label: "Great" },
    { value: 5, emoji: "🎉", label: "Excellent" },
  ];

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-normal text-primary">Weekly Update</h1>
          <p className="text-muted-foreground">
            Submit your progress for Week 12 • Deadline: Wednesday 23:59 UTC
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Win */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-lg font-normal text-secondary mb-2 block">
                What's your win this week?
              </span>
              <span className="text-sm text-muted-foreground">
                One concrete thing that moved forward (max 300 chars)
              </span>
            </label>
            <textarea
              name="win"
              value={formData.win}
              onChange={handleChange}
              placeholder="e.g., Shipped authentication flow, hit $5k MRR, onboarded first 10 users..."
              maxLength={300}
              required
              className="input-field min-h-24 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.win.length}/300
            </p>
          </div>

          {/* Blocker */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-lg font-normal text-destructive mb-2 block">
                What's blocking you?
              </span>
              <span className="text-sm text-muted-foreground">
                What's actually hard right now (max 300 chars)
              </span>
            </label>
            <textarea
              name="blocker"
              value={formData.blocker}
              onChange={handleChange}
              placeholder="e.g., Database scaling issues, can't find product-market fit, burnout..."
              maxLength={300}
              required
              className="input-field min-h-24 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.blocker.length}/300
            </p>
          </div>

          {/* Target */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-lg font-normal text-accent mb-2 block">
                Next week's target
              </span>
              <span className="text-sm text-muted-foreground">
                One specific, measurable goal (optional)
              </span>
            </label>
            <input
              type="text"
              name="target"
              value={formData.target}
              onChange={handleChange}
              placeholder="e.g., Launch v2 API, reach 100 users, fix payment bug..."
              className="input-field"
            />
          </div>

          {/* Metric */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-lg font-normal text-primary mb-2 block">
                Progress metric
              </span>
              <span className="text-sm text-muted-foreground">
                Your MRR, users, or custom metric (optional)
              </span>
            </label>
            <input
              type="number"
              name="metricValue"
              value={formData.metricValue}
              onChange={handleChange}
              placeholder="e.g., 5000"
              step="0.01"
              className="input-field"
            />
          </div>

          {/* Mood Selector */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-lg font-normal mb-2 block">How are you feeling?</span>
              <span className="text-sm text-muted-foreground">
                Your emotional state this week
              </span>
            </label>
            <div className="mood-selector">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`mood-button ${mood === option.value ? "selected" : ""}`}
                  title={option.label}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-lg font-normal mb-2 block">Reflection</span>
              <span className="text-sm text-muted-foreground">
                Open thoughts, lessons, mindset (optional)
              </span>
            </label>
            <textarea
              name="reflection"
              value={formData.reflection}
              onChange={handleChange}
              placeholder="What did you learn? How are you thinking about the work differently?"
              className="input-field min-h-32 resize-none"
            />
          </div>

          {/* Voice Note */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-lg font-normal mb-2 block">Voice note</span>
              <span className="text-sm text-muted-foreground">
                Record up to 3 minutes (optional)
              </span>
            </label>
            {voiceNoteUrl ? (
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Voice note recorded</p>
                  <button
                    type="button"
                    onClick={() => setVoiceNoteUrl(null)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <audio src={voiceNoteUrl} controls className="w-full" />
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {isRecording ? (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="w-4 h-4 bg-destructive rounded-full animate-pulse" />
                    </div>
                    <p className="text-sm font-medium">Recording...</p>
                    <Button
                      type="button"
                      onClick={handleStopRecording}
                      className="btn-secondary w-full"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                ) : (
                  <>
                    <Mic className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Click to record your voice note
                    </p>
                    <Button
                      type="button"
                      onClick={handleStartRecording}
                      className="btn-secondary w-full"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={submitMutation.isPending || !formData.win || !formData.blocker}
              className="btn-primary flex-1"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Update"
              )}
            </Button>
            <Button type="button" className="btn-secondary">
              Save as Draft
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
