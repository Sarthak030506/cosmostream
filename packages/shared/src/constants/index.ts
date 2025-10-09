export const VIDEO_CATEGORIES = [
  'Astrophysics',
  'Cosmology',
  'Planetary Science',
  'Observational Astronomy',
  'Space Exploration',
  'Telescopes & Equipment',
  'Education & Tutorials',
  'Documentary',
  'Live Events',
  'News & Updates',
] as const;

export const FORUM_CATEGORIES = [
  'General Discussion',
  'Astrophysics',
  'Observing Tips',
  'Equipment & Gear',
  'Education',
  'News & Announcements',
  'Q&A',
] as const;

export const VIDEO_QUALITIES = ['240p', '360p', '480p', '720p', '1080p', '1440p', '4K'] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

export const API_ENDPOINTS = {
  NASA_APOD: 'https://api.nasa.gov/planetary/apod',
  NASA_HORIZONS: 'https://ssd.jpl.nasa.gov/api/horizons.api',
  SPACE_LAUNCHES: 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/',
} as const;
