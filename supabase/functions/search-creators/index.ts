import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchFilters {
  hashtags?: string[];
  mentions?: string[];
  keywords?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  isVerified?: boolean | null;
  isBusiness?: boolean | null;
  isPrivate?: boolean | null;
  profileType?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const filters: SearchFilters = await req.json();
    console.log('Search filters:', filters);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('creators')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.minFollowers !== undefined && filters.minFollowers > 0) {
      query = query.gte('follower_count', filters.minFollowers);
    }

    if (filters.maxFollowers !== undefined && filters.maxFollowers < 10000000) {
      query = query.lte('follower_count', filters.maxFollowers);
    }

    if (filters.isVerified !== null && filters.isVerified !== undefined) {
      query = query.eq('is_verified', filters.isVerified);
    }

    if (filters.isBusiness !== null && filters.isBusiness !== undefined) {
      query = query.eq('is_business', filters.isBusiness);
    }

    if (filters.isPrivate !== null && filters.isPrivate !== undefined) {
      query = query.eq('is_private', filters.isPrivate);
    }

    if (filters.category && filters.category.trim() !== '') {
      query = query.ilike('category', `%${filters.category}%`);
    }

    if (filters.profileType && filters.profileType.trim() !== '') {
      query = query.ilike('profile_type', `%${filters.profileType}%`);
    }

    // Search by hashtags in bio
    if (filters.hashtags && filters.hashtags.length > 0) {
      const hashtagFilters = filters.hashtags.map(h => `bio_hashtags.ilike.%${h}%`).join(',');
      query = query.or(hashtagFilters);
    }

    // Search by mentions in bio
    if (filters.mentions && filters.mentions.length > 0) {
      const mentionFilters = filters.mentions.map(m => `bio_mentions.ilike.%${m}%`).join(',');
      query = query.or(mentionFilters);
    }

    // Search by keywords in bio, username, full_name
    if (filters.keywords && filters.keywords.length > 0) {
      const keywordConditions = filters.keywords.map(k => 
        `bio.ilike.%${k}%,username.ilike.%${k}%,full_name.ilike.%${k}%,category.ilike.%${k}%`
      ).join(',');
      query = query.or(keywordConditions);
    }

    // Pagination
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by follower count
    query = query.order('follower_count', { ascending: false });

    const { data: creators, error, count } = await query;

    if (error) {
      console.error('Search error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${creators?.length || 0} creators (total: ${count})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        creators: creators || [],
        total: count || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});