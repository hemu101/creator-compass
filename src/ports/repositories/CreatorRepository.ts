// Port: Creator Repository Interface
import { Creator, SearchFilters, SessionConfig, ScrapingJob } from "@/domain/entities/Creator";

export interface SearchResult {
  success: boolean;
  creators: Creator[];
  total: number;
  error?: string;
}

export interface ScrapeResult {
  success: boolean;
  profiles?: Creator[];
  totalFound?: number;
  totalSaved?: number;
  jobId?: string;
  error?: string;
}

export interface DatabaseStats {
  totalCreators: number;
  lastSync: string | null;
  activeSessions: number;
  recentJobs: ScrapingJob[];
  isConnected: boolean;
}

export interface ICreatorRepository {
  search(filters: SearchFilters): Promise<SearchResult>;
  getById(id: string): Promise<Creator | null>;
  create(creator: Partial<Creator>): Promise<Creator | null>;
  update(id: string, data: Partial<Creator>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  bulkDelete(ids: string[]): Promise<boolean>;
  getStats(): Promise<DatabaseStats>;
  scrape(query: string, sessionId?: string, limit?: number): Promise<ScrapeResult>;
}

export interface ISessionRepository {
  getAll(): Promise<SessionConfig[]>;
  add(sessionId: string): Promise<SessionConfig | null>;
  delete(id: string): Promise<boolean>;
  toggle(id: string, isActive: boolean): Promise<boolean>;
}

export interface IAnalyticsRepository {
  trackEvent(eventType: string, eventData: Record<string, unknown>): Promise<void>;
  getCreatorStats(): Promise<{
    totalCreators: number;
    verifiedCount: number;
    businessCount: number;
    avgFollowers: number;
    platformDistribution: Record<string, number>;
    nicheDistribution: Record<string, number>;
  }>;
  getScrapingHistory(): Promise<ScrapingJob[]>;
  getEngagementTrends(): Promise<{
    date: string;
    avgEngagement: number;
    totalCreators: number;
  }[]>;
}
