import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { User } from "../drizzle/schema";

interface AuthenticatedSocket {
  user?: User;
  userId?: number;
}

export function setupRealtime(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "production" 
        ? undefined 
        : ["http://localhost:3000", "http://localhost:5173"],
      credentials: true,
    },
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    // TODO: Validate JWT token and attach user to socket
    next();
  });

  // Connection handlers
  io.on("connection", (socket: any) => {
    const authenticatedSocket = socket as AuthenticatedSocket;
    console.log(`[Realtime] User connected: ${authenticatedSocket.userId}`);

    // Join user to their personal room
    if (authenticatedSocket.userId) {
      socket.join(`user:${authenticatedSocket.userId}`);
      socket.join("updates");
      socket.join("feedback");
    }

    // Handle update submission events
    socket.on("update:submitted", (data: any) => {
      io.to("updates").emit("update:new", {
        userId: authenticatedSocket.userId,
        timestamp: new Date(),
        ...data,
      });
    });

    // Handle feedback events
    socket.on("feedback:given", (data: any) => {
      io.to(`user:${data.targetUserId}`).emit("feedback:received", {
        fromUserId: authenticatedSocket.userId,
        timestamp: new Date(),
        ...data,
      });
    });

    // Handle streak milestone events
    socket.on("streak:milestone", (data: any) => {
      io.to("updates").emit("streak:achieved", {
        userId: authenticatedSocket.userId,
        weeks: data.weeks,
        timestamp: new Date(),
      });
    });

    // Handle group updates
    socket.on("group:join", (groupId: number) => {
      socket.join(`group:${groupId}`);
    });

    socket.on("group:leave", (groupId: number) => {
      socket.leave(`group:${groupId}`);
    });

    socket.on("group:member-update", (data: any) => {
      io.to(`group:${data.groupId}`).emit("group:member-changed", {
        timestamp: new Date(),
        ...data,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`[Realtime] User disconnected: ${authenticatedSocket.userId}`);
    });

    // Error handling
    socket.on("error", (error: any) => {
      console.error(`[Realtime] Socket error:`, error);
    });
  });

  return io;
}

// Helper functions for emitting events from server code
export function emitUpdateSubmitted(
  io: SocketIOServer,
  userId: number,
  updateData: any
) {
  io.to("updates").emit("update:new", {
    userId,
    timestamp: new Date(),
    ...updateData,
  });
}

export function emitFeedbackReceived(
  io: SocketIOServer,
  targetUserId: number,
  feedbackData: any
) {
  io.to(`user:${targetUserId}`).emit("feedback:received", {
    timestamp: new Date(),
    ...feedbackData,
  });
}

export function emitStreakMilestone(
  io: SocketIOServer,
  userId: number,
  weeks: number
) {
  io.to("updates").emit("streak:achieved", {
    userId,
    weeks,
    timestamp: new Date(),
  });
}

export function emitGroupUpdate(
  io: SocketIOServer,
  groupId: number,
  eventData: any
) {
  io.to(`group:${groupId}`).emit("group:updated", {
    groupId,
    timestamp: new Date(),
    ...eventData,
  });
}
