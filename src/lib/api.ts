import { supabase } from "@/integrations/supabase/client";
import { Creator, SearchFilters, SessionConfig } from "@/types/creator";

export interface ScrapeResult {
  success: boolean;
  profiles?: Creator[];
  totalFound?: number;
  totalSaved?: number;
  jobId?: string;
  error?: string;
}

export interface SearchResult {
  success: boolean;
  creators: Creator[];
  total: number;
  error?: string;
}

export interface DatabaseStats {
  success: boolean;
  stats: {
    totalCreators: number;
    lastSync: string | null;
    activeSessions: number;
    recentJobs: any[];
    isConnected: boolean;
  };
  error?: string;
}

export const api = {
  // Scrape Instagram profiles
  async scrapeInstagram(searchQuery: string, sessionId?: string, limit = 50): Promise<ScrapeResult> {
    const { data, error } = await supabase.functions.invoke('scrape-instagram', {
      body: { searchQuery, sessionId, limit }
    });

    if (error) {
      console.error('Scrape error:', error);
      return { success: false, error: error.message };
    }

    return data;
  },

  // Search creators in database
  async searchCreators(filters: SearchFilters): Promise<SearchResult> {
    const { data, error } = await supabase.functions.invoke('search-creators', {
      body: filters
    });

    if (error) {
      console.error('Search error:', error);
      return { success: false, creators: [], total: 0, error: error.message };
    }

    return data;
  },

  // Get database stats
  async getDatabaseStats(): Promise<DatabaseStats> {
    const { data, error } = await supabase.functions.invoke('database-stats', {
      body: {}
    });

    if (error) {
      console.error('Stats error:', error);
      return { 
        success: false, 
        stats: {
          totalCreators: 0,
          lastSync: null,
          activeSessions: 0,
          recentJobs: [],
          isConnected: false
        },
        error: error.message 
      };
    }

    return data;
  },

  // Session management
  async getSessions(): Promise<SessionConfig[]> {
    const { data, error } = await supabase
      .from('session_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get sessions error:', error);
      return [];
    }

    return (data || []).map(s => ({
      id: s.id,
      sessionId: s.session_id,
      isActive: s.is_active,
      lastUsed: s.last_used,
      successRate: Number(s.success_rate),
      totalRequests: s.total_requests
    }));
  },

  async addSession(sessionId: string): Promise<SessionConfig | null> {
    const { data, error } = await supabase
      .from('session_configs')
      .insert({ session_id: sessionId })
      .select()
      .single();

    if (error) {
      console.error('Add session error:', error);
      return null;
    }

    return {
      id: data.id,
      sessionId: data.session_id,
      isActive: data.is_active,
      lastUsed: data.last_used,
      successRate: Number(data.success_rate),
      totalRequests: data.total_requests
    };
  },

  async deleteSession(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('session_configs')
      .delete()
      .eq('id', id);

    return !error;
  },

  async toggleSession(id: string, isActive: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('session_configs')
      .update({ is_active: isActive })
      .eq('id', id);

    return !error;
  }
};