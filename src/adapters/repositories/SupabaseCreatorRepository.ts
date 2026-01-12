// Adapter: Supabase Creator Repository Implementation
import { supabase } from "@/integrations/supabase/client";
import { Creator, SearchFilters, SessionConfig, ScrapingJob } from "@/domain/entities/Creator";
import { 
  ICreatorRepository, 
  ISessionRepository, 
  IAnalyticsRepository,
  SearchResult, 
  ScrapeResult, 
  DatabaseStats 
} from "@/ports/repositories/CreatorRepository";

// Mapper functions
const mapDbToCreator = (db: any): Creator => ({
  id: db.id,
  username: db.username || '',
  fullName: db.full_name || '',
  profileUrl: db.profile_url || '',
  pk: db.pk || '',
  followerCount: db.follower_count || 0,
  followingCount: db.following_count || 0,
  mediaCount: db.media_count || 0,
  isVerified: db.is_verified || false,
  isBusiness: db.is_business || false,
  isPrivate: db.is_private || false,
  category: db.category || '',
  bio: db.bio || '',
  externalUrl: db.external_url || '',
  profilePicUrl: db.profile_pic_url || '',
  profilePicLocal: db.profile_pic_local || '',
  bioHashtags: db.bio_hashtags || '',
  bioMentions: db.bio_mentions || '',
  engagementRate: Number(db.engagement_rate) || 0,
  sourceKeyword: db.source_keyword || '',
  searchScore: db.search_score || 0,
  profileType: db.profile_type || '',
  scrapedAt: db.scraped_at || '',
  lastUpdated: db.last_updated || '',
  location: db.location,
  city: db.city,
  country: db.country,
  state: db.state,
  gender: db.gender,
  ageRange: db.age_range,
  language: db.language,
  ethnicity: db.ethnicity,
  priceRange: db.price_range,
  minPrice: db.min_price,
  maxPrice: db.max_price,
  platform: db.platform || 'Instagram',
  niche: db.niche,
  contentType: db.content_type,
  isPremium: db.is_premium || false,
});

const mapCreatorToDb = (creator: Partial<Creator>): Record<string, any> => ({
  username: creator.username,
  full_name: creator.fullName,
  profile_url: creator.profileUrl,
  pk: creator.pk,
  follower_count: creator.followerCount,
  following_count: creator.followingCount,
  media_count: creator.mediaCount,
  is_verified: creator.isVerified,
  is_business: creator.isBusiness,
  is_private: creator.isPrivate,
  category: creator.category,
  bio: creator.bio,
  external_url: creator.externalUrl,
  profile_pic_url: creator.profilePicUrl,
  profile_pic_local: creator.profilePicLocal,
  bio_hashtags: creator.bioHashtags,
  bio_mentions: creator.bioMentions,
  engagement_rate: creator.engagementRate,
  source_keyword: creator.sourceKeyword,
  search_score: creator.searchScore,
  profile_type: creator.profileType,
  location: creator.location,
  city: creator.city,
  country: creator.country,
  state: creator.state,
  gender: creator.gender,
  age_range: creator.ageRange,
  language: creator.language,
  ethnicity: creator.ethnicity,
  price_range: creator.priceRange,
  min_price: creator.minPrice,
  max_price: creator.maxPrice,
  platform: creator.platform,
  niche: creator.niche,
  content_type: creator.contentType,
  is_premium: creator.isPremium,
});

export class SupabaseCreatorRepository implements ICreatorRepository {
  async search(filters: SearchFilters): Promise<SearchResult> {
    const { data, error } = await supabase.functions.invoke('search-creators', {
      body: filters
    });

    if (error) {
      console.error('Search error:', error);
      return { success: false, creators: [], total: 0, error: error.message };
    }

    return {
      success: data.success,
      creators: (data.creators || []).map(mapDbToCreator),
      total: data.total || 0,
      error: data.error
    };
  }

  async getById(id: string): Promise<Creator | null> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapDbToCreator(data);
  }

  async create(creator: Partial<Creator>): Promise<Creator | null> {
    const dbData = mapCreatorToDb(creator);
    const { data, error } = await supabase
      .from('creators')
      .insert(dbData as any)
      .select()
      .single();

    if (error || !data) return null;
    return mapDbToCreator(data);
  }

  async update(id: string, data: Partial<Creator>): Promise<boolean> {
    const dbData = mapCreatorToDb(data);
    const { error } = await supabase
      .from('creators')
      .update(dbData)
      .eq('id', id);

    return !error;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('creators')
      .delete()
      .eq('id', id);

    return !error;
  }

  async bulkDelete(ids: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('creators')
      .delete()
      .in('id', ids);

    return !error;
  }

  async getStats(): Promise<DatabaseStats> {
    const { data, error } = await supabase.functions.invoke('database-stats', {
      body: {}
    });

    if (error) {
      return {
        totalCreators: 0,
        lastSync: null,
        activeSessions: 0,
        recentJobs: [],
        isConnected: false
      };
    }

    return data.stats;
  }

  async scrape(query: string, sessionId?: string, limit = 50): Promise<ScrapeResult> {
    const { data, error } = await supabase.functions.invoke('scrape-instagram', {
      body: { searchQuery: query, sessionId, limit }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data;
  }
}

export class SupabaseSessionRepository implements ISessionRepository {
  async getAll(): Promise<SessionConfig[]> {
    const { data, error } = await supabase
      .from('session_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map(s => ({
      id: s.id,
      sessionId: s.session_id,
      isActive: s.is_active,
      lastUsed: s.last_used,
      successRate: Number(s.success_rate),
      totalRequests: s.total_requests
    }));
  }

  async add(sessionId: string): Promise<SessionConfig | null> {
    const { data, error } = await supabase
      .from('session_configs')
      .insert({ session_id: sessionId })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      sessionId: data.session_id,
      isActive: data.is_active,
      lastUsed: data.last_used,
      successRate: Number(data.success_rate),
      totalRequests: data.total_requests
    };
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('session_configs')
      .delete()
      .eq('id', id);

    return !error;
  }

  async toggle(id: string, isActive: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('session_configs')
      .update({ is_active: isActive })
      .eq('id', id);

    return !error;
  }
}

export class SupabaseAnalyticsRepository implements IAnalyticsRepository {
  async trackEvent(eventType: string, eventData: Record<string, unknown>): Promise<void> {
    await supabase
      .from('analytics_events')
      .insert({ event_type: eventType, event_data: eventData } as any);
  }

  async getCreatorStats(): Promise<{
    totalCreators: number;
    verifiedCount: number;
    businessCount: number;
    avgFollowers: number;
    platformDistribution: Record<string, number>;
    nicheDistribution: Record<string, number>;
  }> {
    const { data: creators } = await supabase
      .from('creators')
      .select('is_verified, is_business, follower_count, platform, niche');

    if (!creators) {
      return {
        totalCreators: 0,
        verifiedCount: 0,
        businessCount: 0,
        avgFollowers: 0,
        platformDistribution: {},
        nicheDistribution: {}
      };
    }

    const platformDist: Record<string, number> = {};
    const nicheDist: Record<string, number> = {};
    let totalFollowers = 0;
    let verifiedCount = 0;
    let businessCount = 0;

    creators.forEach(c => {
      if (c.is_verified) verifiedCount++;
      if (c.is_business) businessCount++;
      totalFollowers += c.follower_count || 0;
      
      const platform = c.platform || 'Instagram';
      platformDist[platform] = (platformDist[platform] || 0) + 1;
      
      if (c.niche) {
        nicheDist[c.niche] = (nicheDist[c.niche] || 0) + 1;
      }
    });

    return {
      totalCreators: creators.length,
      verifiedCount,
      businessCount,
      avgFollowers: creators.length > 0 ? Math.round(totalFollowers / creators.length) : 0,
      platformDistribution: platformDist,
      nicheDistribution: nicheDist
    };
  }

  async getScrapingHistory(): Promise<ScrapingJob[]> {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];

    return data.map(job => ({
      id: job.id,
      searchQuery: job.search_query,
      status: job.status,
      totalFound: job.total_found,
      totalSaved: job.total_saved,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      errorMessage: job.error_message
    }));
  }

  async getEngagementTrends(): Promise<{ date: string; avgEngagement: number; totalCreators: number; }[]> {
    const { data: creators } = await supabase
      .from('creators')
      .select('scraped_at, engagement_rate')
      .order('scraped_at', { ascending: true });

    if (!creators) return [];

    // Group by date
    const dateMap: Record<string, { total: number; count: number }> = {};
    creators.forEach(c => {
      if (!c.scraped_at) return;
      const date = new Date(c.scraped_at).toISOString().split('T')[0];
      if (!dateMap[date]) {
        dateMap[date] = { total: 0, count: 0 };
      }
      dateMap[date].total += Number(c.engagement_rate) || 0;
      dateMap[date].count++;
    });

    return Object.entries(dateMap).map(([date, { total, count }]) => ({
      date,
      avgEngagement: count > 0 ? Number((total / count).toFixed(2)) : 0,
      totalCreators: count
    })).slice(-30); // Last 30 days
  }
}

// Singleton instances
export const creatorRepository = new SupabaseCreatorRepository();
export const sessionRepository = new SupabaseSessionRepository();
export const analyticsRepository = new SupabaseAnalyticsRepository();
