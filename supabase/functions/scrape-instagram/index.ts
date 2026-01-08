import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InstagramProfile {
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
  bio_hashtags: string;
  bio_mentions: string;
  engagement_rate: number;
  source_keyword: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchQuery, sessionId, limit = 50 } = await req.json();

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ success: false, error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting scrape for query: ${searchQuery}, limit: ${limit}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create scraping job
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .insert({
        search_query: searchQuery,
        status: 'running'
      })
      .select()
      .single();

    if (jobError) {
      console.error('Failed to create job:', jobError);
    }

    // Use Instagram's web API for searching
    const searchUrl = `https://www.instagram.com/web/search/topsearch/?context=blended&query=${encodeURIComponent(searchQuery)}&rank_token=0.${Date.now()}&include_reel=true`;

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://www.instagram.com/',
    };

    if (sessionId) {
      headers['Cookie'] = `sessionid=${sessionId}`;
    }

    console.log('Fetching from Instagram...');
    const response = await fetch(searchUrl, { headers });

    if (!response.ok) {
      console.error('Instagram API error:', response.status);
      
      // Update job status
      if (job) {
        await supabase
          .from('scraping_jobs')
          .update({ 
            status: 'failed', 
            error_message: `Instagram API returned ${response.status}`,
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Instagram API error: ${response.status}. Try adding a valid session ID.` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Instagram response received, processing users...');

    const profiles: InstagramProfile[] = [];
    const users = data.users || [];

    for (const item of users.slice(0, limit)) {
      const user = item.user;
      if (!user) continue;

      // Extract hashtags and mentions from bio
      const bio = user.biography || '';
      const hashtags = (bio.match(/#\w+/g) || []).join(', ');
      const mentions = (bio.match(/@\w+/g) || []).join(', ');

      const profile: InstagramProfile = {
        username: user.username || '',
        full_name: user.full_name || '',
        profile_url: `https://instagram.com/${user.username}`,
        pk: user.pk?.toString() || '',
        follower_count: user.follower_count || 0,
        following_count: user.following_count || 0,
        media_count: user.media_count || 0,
        is_verified: user.is_verified || false,
        is_business: user.is_business_account || false,
        is_private: user.is_private || false,
        category: user.category || '',
        bio: bio,
        external_url: user.external_url || '',
        profile_pic_url: user.profile_pic_url || '',
        bio_hashtags: hashtags,
        bio_mentions: mentions,
        engagement_rate: 0,
        source_keyword: searchQuery,
      };

      profiles.push(profile);
    }

    console.log(`Found ${profiles.length} profiles, saving to database...`);

    // Save profiles to database
    let savedCount = 0;
    for (const profile of profiles) {
      const { error } = await supabase
        .from('creators')
        .upsert({
          username: profile.username,
          full_name: profile.full_name,
          profile_url: profile.profile_url,
          pk: profile.pk,
          follower_count: profile.follower_count,
          following_count: profile.following_count,
          media_count: profile.media_count,
          is_verified: profile.is_verified,
          is_business: profile.is_business,
          is_private: profile.is_private,
          category: profile.category,
          bio: profile.bio,
          external_url: profile.external_url,
          profile_pic_url: profile.profile_pic_url,
          bio_hashtags: profile.bio_hashtags,
          bio_mentions: profile.bio_mentions,
          engagement_rate: profile.engagement_rate,
          source_keyword: profile.source_keyword,
        }, {
          onConflict: 'username',
          ignoreDuplicates: false
        });

      if (!error) {
        savedCount++;
      } else {
        console.error(`Failed to save ${profile.username}:`, error);
      }
    }

    console.log(`Saved ${savedCount} profiles to database`);

    // Update job status
    if (job) {
      await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'completed', 
          total_found: profiles.length,
          total_saved: savedCount,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        profiles,
        totalFound: profiles.length,
        totalSaved: savedCount,
        jobId: job?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scraping error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});