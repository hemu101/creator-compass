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
  // Extended fields
  location?: string;
  city?: string;
  country?: string;
  state?: string;
  gender?: string;
  age_range?: string;
  language?: string;
  ethnicity?: string;
  price_range?: string;
  platform?: string;
  niche?: string;
  content_type?: string;
  is_premium?: boolean;
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

export interface AdvancedSearchFilters extends SearchFilters {
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

export const PLATFORMS = [
  "Any",
  "Instagram",
  "TikTok",
  "User Generated Content",
  "YouTube",
  "Twitter",
  "Twitch",
  "Amazon"
] as const;

export const NICHES = [
  "Popular",
  "Lifestyle",
  "Beauty",
  "Fashion",
  "Travel",
  "Health & Fitness",
  "Food & Drink",
  "Family & Children",
  "Comedy & Entertainment",
  "Art & Photography",
  "Music & Dance",
  "Model",
  "Animals & Pets",
  "Adventure & Outdoors",
  "Education",
  "Entrepreneur & Business",
  "Athlete & Sports",
  "Gaming",
  "Technology",
  "LGBTQ2+",
  "Healthcare",
  "Actor",
  "Automotive",
  "Vegan",
  "Celebrity & Public Figure",
  "Skilled Trades",
  "Cannabis"
] as const;

export const CONTENT_TYPES = [
  "Photos",
  "Videos",
  "Reels",
  "Stories",
  "Live",
  "Mixed"
] as const;

export const GENDERS = ["Any", "Male", "Female", "Non-binary"] as const;

export const AGE_RANGES = [
  "Any",
  "13-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+"
] as const;

export const LANGUAGES = [
  "Any",
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Russian"
] as const;

export const ETHNICITIES = [
  "Any",
  "Asian",
  "Black",
  "Caucasian",
  "Hispanic",
  "Middle Eastern",
  "Mixed",
  "Other"
] as const;
