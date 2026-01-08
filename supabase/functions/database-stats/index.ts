import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get total creators count
    const { count: totalCreators, error: countError } = await supabase
      .from('creators')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Get latest creator to determine last sync
    const { data: latestCreator, error: latestError } = await supabase
      .from('creators')
      .select('last_updated')
      .order('last_updated', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get active sessions count
    const { count: activeSessions, error: sessionsError } = await supabase
      .from('session_configs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get recent scraping jobs
    const { data: recentJobs, error: jobsError } = await supabase
      .from('scraping_jobs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5);

    return new Response(
      JSON.stringify({ 
        success: true,
        stats: {
          totalCreators: totalCreators || 0,
          lastSync: latestCreator?.last_updated || null,
          activeSessions: activeSessions || 0,
          recentJobs: recentJobs || [],
          isConnected: true
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        stats: {
          totalCreators: 0,
          lastSync: null,
          activeSessions: 0,
          recentJobs: [],
          isConnected: false
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});