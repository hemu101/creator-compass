// Domain Entity: Creator
export interface Creator {
  id: string;
  username: string;
  fullName: string;
  profileUrl: string;
  pk: string;
  followerCount: number;
  followingCount: number;
  mediaCount: number;
  isVerified: boolean;
  isBusiness: boolean;
  isPrivate: boolean;
  category: string;
  bio: string;
  externalUrl: string;
  profilePicUrl: string;
  profilePicLocal: string;
  bioHashtags: string;
  bioMentions: string;
  engagementRate: number;
  sourceKeyword: string;
  searchScore: number;
  profileType: string;
  scrapedAt: string;
  lastUpdated: string;
  // Extended fields
  location?: string;
  city?: string;
  country?: string;
  state?: string;
  gender?: string;
  ageRange?: string;
  language?: string;
  ethnicity?: string;
  priceRange?: string;
  minPrice?: number;
  maxPrice?: number;
  platform?: string;
  niche?: string;
  contentType?: string;
  isPremium?: boolean;
}

export interface SearchFilters {
  hashtags: string[];
  mentions: string[];
  keywords: string[];
  minFollowers: number;
  maxFollowers: number;
  isVerified: boolean | null;
  isBusiness: boolean | null;
  isPrivate: boolean | null;
  profileType: string;
  category: string;
  location?: string;
  city?: string;
  country?: string;
  state?: string;
  gender?: string;
  ageRange?: string;
  language?: string;
  ethnicity?: string;
  minPrice?: number;
  maxPrice?: number;
  platform?: string;
  niche?: string;
  contentType?: string;
  isPremium?: boolean | null;
}

export interface SessionConfig {
  id: string;
  sessionId: string;
  isActive: boolean;
  lastUsed: string;
  successRate: number;
  totalRequests: number;
}

export interface ScrapingJob {
  id: string;
  searchQuery: string;
  status: string;
  totalFound: number;
  totalSaved: number;
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
}

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  eventData: Record<string, unknown>;
  createdAt: string;
}
