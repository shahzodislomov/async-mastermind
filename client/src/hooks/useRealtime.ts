import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface RealtimeEvent {
  type: "update" | "feedback" | "streak" | "group";
  data: any;
}

export function useRealtime(userId?: number) {
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Set<Function>>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    // Create socket connection
    const socket = io(window.location.origin, {
      auth: {
        token: localStorage.getItem("auth_token") || "",
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("[Realtime] Connected");
      socket.emit("user:online", { userId });
    });

    socket.on("disconnect", () => {
      console.log("[Realtime] Disconnected");
    });

    socket.on("error", (error: any) => {
      console.error("[Realtime] Error:", error);
    });

    // Handle all incoming events
    socket.on("update:new", (data: any) => {
      triggerListeners("update:new", data);
    });

    socket.on("feedback:received", (data: any) => {
      triggerListeners("feedback:received", data);
    });

    socket.on("streak:achieved", (data: any) => {
      triggerListeners("streak:achieved", data);
    });

    socket.on("group:updated", (data: any) => {
      triggerListeners("group:updated", data);
    });

    socket.on("group:member-changed", (data: any) => {
      triggerListeners("group:member-changed", data);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const triggerListeners = useCallback((eventName: string, data: any) => {
    const listeners = listenersRef.current.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }, []);

  const subscribe = useCallback(
    (eventName: string, callback: (data: any) => void) => {
      if (!listenersRef.current.has(eventName)) {
        listenersRef.current.set(eventName, new Set());
      }
      listenersRef.current.get(eventName)?.add(callback);

      return () => {
        listenersRef.current.get(eventName)?.delete(callback);
      };
    },
    []
  );

  const emit = useCallback((eventName: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(eventName, data);
    }
  }, []);

  const joinGroup = useCallback((groupId: number) => {
    if (socketRef.current) {
      socketRef.current.emit("group:join", groupId);
    }
  }, []);

  const leaveGroup = useCallback((groupId: number) => {
    if (socketRef.current) {
      socketRef.current.emit("group:leave", groupId);
    }
  }, []);

  return {
    subscribe,
    emit,
    joinGroup,
    leaveGroup,
    isConnected: socketRef.current?.connected || false,
  };
}

// Hook for subscribing to specific events
export function useRealtimeEvent(
  eventName: string,
  callback: (data: any) => void,
  userId?: number
) {
  const { subscribe } = useRealtime(userId);

  useEffect(() => {
    const unsubscribe = subscribe(eventName, callback);
    return unsubscribe;
  }, [eventName, callback, subscribe]);
}
