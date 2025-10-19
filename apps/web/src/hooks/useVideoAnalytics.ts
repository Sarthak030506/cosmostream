'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation, gql } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

const TRACK_VIDEO_VIEW = gql`
  mutation TrackVideoView($input: VideoViewInput!) {
    trackVideoView(input: $input)
  }
`;

const TRACK_VIDEO_EVENT = gql`
  mutation TrackVideoEvent($input: VideoEventInput!) {
    trackVideoEvent(input: $input)
  }
`;

interface VideoAnalyticsOptions {
  videoId: string;
  userId?: string | null;
  autoTrack?: boolean;
}

interface PlaybackEvent {
  type: 'play' | 'pause' | 'seek' | 'complete' | 'quality_change' | 'speed_change' | 'buffer';
  timestamp: number;  // Position in video (seconds)
  data?: Record<string, any>;
}

export function useVideoAnalytics({ videoId, userId, autoTrack = true }: VideoAnalyticsOptions) {
  const [sessionId] = useState(() => uuidv4());
  const [isTracking, setIsTracking] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [lastPosition, setLastPosition] = useState(0);
  const [completionMilestones, setCompletionMilestones] = useState({
    25: false,
    50: false,
    75: false,
    100: false,
  });

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const viewTrackedRef = useRef(false);

  const [trackViewMutation] = useMutation(TRACK_VIDEO_VIEW);
  const [trackEventMutation] = useMutation(TRACK_VIDEO_EVENT);

  // Get device and browser info
  const getDeviceInfo = useCallback(() => {
    const ua = navigator.userAgent;
    let deviceType = 'desktop';
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect device type
    if (/mobile/i.test(ua)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

    // Detect browser
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return {
      deviceType,
      browser,
      operatingSystem: os,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      userAgent: ua,
    };
  }, []);

  // Get traffic source from URL and referrer
  const getTrafficSource = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;

    let trafficSource = 'direct';
    let referrerUrl = referrer || null;
    let utmSource = urlParams.get('utm_source');
    let utmMedium = urlParams.get('utm_medium');
    let utmCampaign = urlParams.get('utm_campaign');

    // Determine traffic source
    if (utmSource) {
      trafficSource = utmMedium || 'external';
    } else if (referrer) {
      const referrerDomain = new URL(referrer).hostname;
      const currentDomain = window.location.hostname;

      if (referrerDomain !== currentDomain) {
        // Check for social media
        if (/facebook|twitter|linkedin|reddit|instagram/i.test(referrerDomain)) {
          trafficSource = 'social';
        } else if (/google|bing|yahoo|duckduckgo/i.test(referrerDomain)) {
          trafficSource = 'search';
        } else {
          trafficSource = 'external';
        }
      } else {
        // Internal referrer
        if (referrer.includes('/search')) trafficSource = 'search';
        else if (referrer.includes('/browse') || referrer.includes('/category')) trafficSource = 'browse';
        else if (referrer.includes('/recommended')) trafficSource = 'recommended';
      }
    }

    return {
      trafficSource,
      referrerUrl,
      utmSource,
      utmMedium,
      utmCampaign,
    };
  }, []);

  // Track initial view
  const trackView = useCallback(async () => {
    if (viewTrackedRef.current || !autoTrack) return;

    const deviceInfo = getDeviceInfo();
    const trafficInfo = getTrafficSource();

    try {
      await trackViewMutation({
        variables: {
          input: {
            videoId,
            sessionId,
            userId,
            ...deviceInfo,
            ...trafficInfo,
          },
        },
      });
      viewTrackedRef.current = true;
    } catch (error) {
      console.error('Error tracking video view:', error);
    }
  }, [videoId, sessionId, userId, autoTrack, trackViewMutation, getDeviceInfo, getTrafficSource]);

  // Track event
  const trackEvent = useCallback(async (event: PlaybackEvent) => {
    if (!autoTrack) return;

    try {
      await trackEventMutation({
        variables: {
          input: {
            videoId,
            sessionId,
            userId,
            eventType: event.type,
            videoTimestamp: Math.floor(event.timestamp),
            eventData: event.data || {},
          },
        },
      });
    } catch (error) {
      console.error('Error tracking video event:', error);
    }
  }, [videoId, sessionId, userId, autoTrack, trackEventMutation]);

  // Handle playback events
  const onPlay = useCallback((currentTime: number) => {
    setWatchStartTime(Date.now());
    setIsTracking(true);
    trackEvent({ type: 'play', timestamp: currentTime });

    // Start heartbeat (every 10 seconds)
    if (!heartbeatIntervalRef.current) {
      heartbeatIntervalRef.current = setInterval(() => {
        // Update watch time
        setTotalWatchTime(prev => prev + 10);
      }, 10000);
    }
  }, [trackEvent]);

  const onPause = useCallback((currentTime: number) => {
    if (watchStartTime) {
      const watchedDuration = (Date.now() - watchStartTime) / 1000;
      setTotalWatchTime(prev => prev + watchedDuration);
    }
    setWatchStartTime(null);
    setIsTracking(false);
    trackEvent({ type: 'pause', timestamp: currentTime });

    // Stop heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, [watchStartTime, trackEvent]);

  const onSeek = useCallback((fromTime: number, toTime: number) => {
    trackEvent({
      type: 'seek',
      timestamp: toTime,
      data: { from: fromTime, to: toTime },
    });
    setLastPosition(toTime);
  }, [trackEvent]);

  const onTimeUpdate = useCallback((currentTime: number, duration: number) => {
    setLastPosition(currentTime);

    // Track completion milestones
    if (duration > 0) {
      const completion = (currentTime / duration) * 100;

      Object.entries(completionMilestones).forEach(([milestone, reached]) => {
        const milestonePercent = parseInt(milestone);
        if (!reached && completion >= milestonePercent) {
          setCompletionMilestones(prev => ({ ...prev, [milestone]: true }));
          trackEvent({
            type: completion === 100 ? 'complete' : 'milestone',
            timestamp: currentTime,
            data: { milestone: milestonePercent },
          });
        }
      });
    }
  }, [completionMilestones, trackEvent]);

  const onQualityChange = useCallback((quality: string, currentTime: number) => {
    trackEvent({
      type: 'quality_change',
      timestamp: currentTime,
      data: { quality },
    });
  }, [trackEvent]);

  const onSpeedChange = useCallback((speed: number, currentTime: number) => {
    trackEvent({
      type: 'speed_change',
      timestamp: currentTime,
      data: { speed },
    });
  }, [trackEvent]);

  const onBuffer = useCallback((currentTime: number) => {
    trackEvent({ type: 'buffer', timestamp: currentTime });
  }, [trackEvent]);

  // Track view on mount
  useEffect(() => {
    if (autoTrack) {
      trackView();
    }

    // Cleanup on unmount
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Send final update with total watch time
      if (viewTrackedRef.current && totalWatchTime > 0) {
        // Note: This won't wait for the request to complete, but it's better than nothing
        trackEventMutation({
          variables: {
            input: {
              videoId,
              sessionId,
              userId,
              eventType: 'session_end',
              videoTimestamp: Math.floor(lastPosition),
              eventData: {
                totalWatchTime,
                completionPercentage: (lastPosition / 1) * 100,  // Would need actual duration
              },
            },
          },
        }).catch(() => {});
      }
    };
  }, [autoTrack, trackView, totalWatchTime, lastPosition, videoId, sessionId, userId, trackEventMutation]);

  return {
    sessionId,
    isTracking,
    totalWatchTime,
    onPlay,
    onPause,
    onSeek,
    onTimeUpdate,
    onQualityChange,
    onSpeedChange,
    onBuffer,
    trackEvent,
    trackView,
  };
}
