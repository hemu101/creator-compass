export interface Creator {
  id: number;
  username: string;
  full_name: string;
  profile_url: string;
  pk: string;
  follower_count: number;
  following_count: number;
  media_count: number;
  is_verified: boolean;
  is_business: boolean;
  is_private: boolean;
  category: string;
  bio: string;
  external_url: string;
  profile_pic_url: string;
  profile_pic_local: string;
  bio_hashtags: string;
  bio_mentions: string;
  engagement_rate: number;
  source_keyword: string;
  search_score: number;
  profile_type: string;
  scraped_at: string;
  last_updated: string;
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
}

export interface SearchPrompt {
  creatorNature: string;
  followerSize: string;
  creatorType: string;
  contentRequirement: string;
  priority: string;
}

export interface SessionConfig {
  id: string;
  sessionId: string;
  isActive: boolean;
  lastUsed: string;
  successRate: number;
  totalRequests: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}
