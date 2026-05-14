import { describe, it, expect, beforeEach, vi } from "vitest";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import { setupRealtime, emitUpdateSubmitted, emitFeedbackReceived, emitStreakMilestone } from "./realtime";

describe("Real-time Updates", () => {
  let io: SocketIOServer;
  let httpServer: any;

  beforeEach(() => {
    httpServer = createServer();
    io = setupRealtime(httpServer);
  });

  it("should initialize Socket.io server", () => {
    expect(io).toBeDefined();
    expect(io.engine).toBeDefined();
  });

  it("should emit update submitted event", (done) => {
    const updateData = {
      id: 1,
      win: "Shipped feature",
      blocker: "Database scaling",
      mood: 4,
      metricValue: 5000,
    };

    io.on("connection", (socket) => {
      socket.on("update:new", (data) => {
        expect(data).toMatchObject(updateData);
        expect(data.timestamp).toBeDefined();
        done();
      });
    });

    emitUpdateSubmitted(io, 1, updateData);
  });

  it("should emit feedback received event", (done) => {
    const feedbackData = {
      id: 1,
      content: "Great work this week!",
      tag: "Encouraging",
      fromUserId: 2,
    };

    io.on("connection", (socket) => {
      socket.on("feedback:received", (data) => {
        expect(data).toMatchObject(feedbackData);
        expect(data.timestamp).toBeDefined();
        done();
      });
    });

    emitFeedbackReceived(io, 1, feedbackData);
  });

  it("should emit streak milestone event", (done) => {
    io.on("connection", (socket) => {
      socket.on("streak:achieved", (data) => {
        expect(data.userId).toBe(1);
        expect(data.weeks).toBe(50);
        expect(data.timestamp).toBeDefined();
        done();
      });
    });

    emitStreakMilestone(io, 1, 50);
  });

  it("should handle group join event", (done) => {
    io.on("connection", (socket) => {
      socket.emit("group:join", 1);
      expect(socket.rooms.has("group:1")).toBe(true);
      done();
    });
  });

  it("should handle group leave event", (done) => {
    io.on("connection", (socket) => {
      socket.emit("group:join", 1);
      socket.emit("group:leave", 1);
      expect(socket.rooms.has("group:1")).toBe(false);
      done();
    });
  });

  it("should handle disconnect gracefully", (done) => {
    const consoleSpy = vi.spyOn(console, "log");
    
    io.on("connection", (socket) => {
      socket.disconnect();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("disconnected"));
      done();
    });
  });
});

describe("Notification Events", () => {
  let io: SocketIOServer;
  let httpServer: any;

  beforeEach(() => {
    httpServer = createServer();
    io = setupRealtime(httpServer);
  });

  it("should emit late submission notification", (done) => {
    const notificationData = {
      title: "Late Submission Alert",
      memberName: "Sarah Chen",
    };

    io.on("connection", (socket) => {
      socket.on("notification:late-submission", (data) => {
        expect(data.title).toBe(notificationData.title);
        done();
      });
    });

    io.emit("notification:late-submission", notificationData);
  });

  it("should emit achievement unlocked notification", (done) => {
    const achievementData = {
      userId: 1,
      achievement: "50-week streak",
      icon: "🔥",
    };

    io.on("connection", (socket) => {
      socket.on("achievement:unlocked", (data) => {
        expect(data.achievement).toBe(achievementData.achievement);
        done();
      });
    });

    io.emit("achievement:unlocked", achievementData);
  });
});

describe("Group Collaboration Events", () => {
  let io: SocketIOServer;
  let httpServer: any;

  beforeEach(() => {
    httpServer = createServer();
    io = setupRealtime(httpServer);
  });

  it("should broadcast member update to group", (done) => {
    const memberUpdate = {
      groupId: 1,
      memberId: 2,
      action: "promoted",
      role: "captain",
    };

    io.on("connection", (socket) => {
      socket.join("group:1");
      socket.on("group:member-update", (data) => {
        expect(data.action).toBe("promoted");
        done();
      });
    });

    io.to("group:1").emit("group:member-update", memberUpdate);
  });

  it("should handle multiple group subscriptions", (done) => {
    io.on("connection", (socket) => {
      socket.emit("group:join", 1);
      socket.emit("group:join", 2);
      
      expect(socket.rooms.has("group:1")).toBe(true);
      expect(socket.rooms.has("group:2")).toBe(true);
      done();
    });
  });
});
