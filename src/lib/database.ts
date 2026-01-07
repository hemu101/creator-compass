import { Creator, SearchFilters } from "@/types/creator";

// Since we can't directly connect to PostgreSQL from browser,
// this module provides the SQL query generation that would be used
// with a backend API. The actual database connection would need
// a Node.js backend or Edge function.

export function buildSearchQuery(filters: SearchFilters): string {
  const conditions: string[] = [];

  if (filters.hashtags.length > 0) {
    const hashtagConditions = filters.hashtags
      .map(h => `bio_hashtags ILIKE '%${h}%'`)
      .join(' OR ');
    conditions.push(`(${hashtagConditions})`);
  }

  if (filters.mentions.length > 0) {
    const mentionConditions = filters.mentions
      .map(m => `bio_mentions ILIKE '%${m}%'`)
      .join(' OR ');
    conditions.push(`(${mentionConditions})`);
  }

  if (filters.keywords.length > 0) {
    const keywordConditions = filters.keywords
      .map(k => `(bio ILIKE '%${k}%' OR full_name ILIKE '%${k}%' OR category ILIKE '%${k}%')`)
      .join(' OR ');
    conditions.push(`(${keywordConditions})`);
  }

  if (filters.minFollowers > 0) {
    conditions.push(`follower_count >= ${filters.minFollowers}`);
  }

  if (filters.maxFollowers > 0 && filters.maxFollowers < 10000000) {
    conditions.push(`follower_count <= ${filters.maxFollowers}`);
  }

  if (filters.isVerified !== null) {
    conditions.push(`is_verified = ${filters.isVerified}`);
  }

  if (filters.isBusiness !== null) {
    conditions.push(`is_business = ${filters.isBusiness}`);
  }

  if (filters.isPrivate !== null) {
    conditions.push(`is_private = ${filters.isPrivate}`);
  }

  if (filters.profileType) {
    conditions.push(`profile_type = '${filters.profileType}'`);
  }

  if (filters.category) {
    conditions.push(`category ILIKE '%${filters.category}%'`);
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  return `SELECT * FROM InstagramProfiles ${whereClause} ORDER BY follower_count DESC LIMIT 100`;
}

// Mock data for demonstration
export const mockCreators: Creator[] = [
  {
    id: 1,
    username: "tech_startup_mike",
    full_name: "Mike Johnson",
    profile_url: "https://instagram.com/tech_startup_mike",
    pk: "123456789",
    follower_count: 4500,
    following_count: 890,
    media_count: 234,
    is_verified: false,
    is_business: true,
    is_private: false,
    category: "Technology",
    bio: "🚀 Startup founder | Building the future | #tech #startup #entrepreneur",
    external_url: "https://techstartup.com",
    profile_pic_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    profile_pic_local: "",
    bio_hashtags: "tech,startup,entrepreneur",
    bio_mentions: "",
    engagement_rate: 5.2,
    source_keyword: "tech creator",
    search_score: 0.89,
    profile_type: "creator",
    scraped_at: "2024-01-15T10:30:00Z",
    last_updated: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    username: "ugc_sarah",
    full_name: "Sarah Chen",
    profile_url: "https://instagram.com/ugc_sarah",
    pk: "987654321",
    follower_count: 3200,
    following_count: 450,
    media_count: 156,
    is_verified: false,
    is_business: true,
    is_private: false,
    category: "UGC Creator",
    bio: "📹 UGC Creator | Product reviews & tutorials | DM for collabs #ugc #contentcreator",
    external_url: "https://sarahugc.com",
    profile_pic_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    profile_pic_local: "",
    bio_hashtags: "ugc,contentcreator",
    bio_mentions: "",
    engagement_rate: 7.8,
    source_keyword: "ugc creator",
    search_score: 0.95,
    profile_type: "creator",
    scraped_at: "2024-01-14T14:20:00Z",
    last_updated: "2024-01-14T14:20:00Z"
  },
  {
    id: 3,
    username: "marketing_guru_alex",
    full_name: "Alex Rivera",
    profile_url: "https://instagram.com/marketing_guru_alex",
    pk: "456789123",
    follower_count: 5800,
    following_count: 320,
    media_count: 445,
    is_verified: true,
    is_business: true,
    is_private: false,
    category: "Marketing",
    bio: "📈 Marketing strategist | Helping startups grow | Video content specialist #marketing #growth",
    external_url: "https://alexmarketing.io",
    profile_pic_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    profile_pic_local: "",
    bio_hashtags: "marketing,growth",
    bio_mentions: "",
    engagement_rate: 4.5,
    source_keyword: "marketing",
    search_score: 0.82,
    profile_type: "creator",
    scraped_at: "2024-01-13T09:15:00Z",
    last_updated: "2024-01-13T09:15:00Z"
  },
  {
    id: 4,
    username: "business_ventures_lisa",
    full_name: "Lisa Wong",
    profile_url: "https://instagram.com/business_ventures_lisa",
    pk: "789123456",
    follower_count: 2100,
    following_count: 180,
    media_count: 89,
    is_verified: false,
    is_business: true,
    is_private: false,
    category: "Business",
    bio: "💼 Venture builder | Startup advisor | Sharing the journey #business #ventures #startups",
    external_url: "https://lisawong.co",
    profile_pic_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    profile_pic_local: "",
    bio_hashtags: "business,ventures,startups",
    bio_mentions: "",
    engagement_rate: 8.1,
    source_keyword: "business",
    search_score: 0.91,
    profile_type: "creator",
    scraped_at: "2024-01-12T16:45:00Z",
    last_updated: "2024-01-12T16:45:00Z"
  },
  {
    id: 5,
    username: "promo_video_creator",
    full_name: "James Lee",
    profile_url: "https://instagram.com/promo_video_creator",
    pk: "321654987",
    follower_count: 4100,
    following_count: 560,
    media_count: 312,
    is_verified: false,
    is_business: true,
    is_private: false,
    category: "Video Production",
    bio: "🎬 Promo video specialist | Brand storytelling | Walkthroughs & demos #video #promo #storytelling",
    external_url: "https://jameslee.video",
    profile_pic_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    profile_pic_local: "",
    bio_hashtags: "video,promo,storytelling",
    bio_mentions: "",
    engagement_rate: 6.3,
    source_keyword: "video creator",
    search_score: 0.87,
    profile_type: "creator",
    scraped_at: "2024-01-11T11:30:00Z",
    last_updated: "2024-01-11T11:30:00Z"
  }
];

export async function searchCreators(filters: SearchFilters): Promise<Creator[]> {
  // This simulates filtering with mock data
  // In production, this would call your backend API
  let results = [...mockCreators];

  if (filters.keywords.length > 0) {
    results = results.filter(c => 
      filters.keywords.some(k => 
        c.bio.toLowerCase().includes(k.toLowerCase()) ||
        c.full_name.toLowerCase().includes(k.toLowerCase()) ||
        c.category.toLowerCase().includes(k.toLowerCase())
      )
    );
  }

  if (filters.hashtags.length > 0) {
    results = results.filter(c =>
      filters.hashtags.some(h => 
        c.bio_hashtags.toLowerCase().includes(h.toLowerCase())
      )
    );
  }

  if (filters.minFollowers > 0) {
    results = results.filter(c => c.follower_count >= filters.minFollowers);
  }

  if (filters.maxFollowers > 0 && filters.maxFollowers < 10000000) {
    results = results.filter(c => c.follower_count <= filters.maxFollowers);
  }

  if (filters.isVerified !== null) {
    results = results.filter(c => c.is_verified === filters.isVerified);
  }

  if (filters.isBusiness !== null) {
    results = results.filter(c => c.is_business === filters.isBusiness);
  }

  return results;
}
