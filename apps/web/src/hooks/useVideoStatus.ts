'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface VideoUpdate {
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  progress?: number;
  error?: string;
  thumbnailUrl?: string;
  manifestUrl?: string;
}

interface UseVideoStatusOptions {
  videoId: string;
  enabled?: boolean;
  onUpdate?: (update: VideoUpdate) => void;
}

export function useVideoStatus({ videoId, enabled = true, onUpdate }: UseVideoStatusOptions) {
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || !videoId) {
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found for WebSocket connection');
      return;
    }

    // Connect to realtime server
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4001';
    const socket = io(wsUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected for video:', videoId);
      // Subscribe to video processing updates
      socket.emit('video:subscribe', videoId);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    socket.on('error', (err) => {
      console.error('WebSocket error:', err);
      setError(err.message || 'Connection error');
    });

    // Listen for video processing updates
    socket.on('video:processing_update', (update: VideoUpdate) => {
      console.log('Video update received:', update);

      if (update.status) {
        setStatus(update.status);
      }

      if (update.progress !== undefined) {
        setProgress(update.progress);
      }

      if (update.error) {
        setError(update.error);
      }

      // Call custom callback if provided
      if (onUpdate) {
        onUpdate(update);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('video:unsubscribe', videoId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [videoId, enabled, onUpdate]);

  return {
    status,
    progress,
    error,
    isConnected: socketRef.current?.connected || false,
  };
}
