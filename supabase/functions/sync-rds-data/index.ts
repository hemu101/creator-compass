import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RDSCreator {
  id?: string;
  username: string;
  full_name?: string;
  profile_url?: string;
  pk?: string;
  follower_count?: number;
  following_count?: number;
  media_count?: number;
  is_verified?: boolean;
  is_business?: boolean;
  is_private?: boolean;
  category?: string;
  bio?: string;
  external_url?: string;
  profile_pic_url?: string;
  profile_pic_local?: string;
  bio_hashtags?: string;
  bio_mentions?: string;
  engagement_rate?: number;
  source_keyword?: string;
  search_score?: number;
  profile_type?: string;
  scraped_at?: string;
  last_updated?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { limit = 100, offset = 0 } = await req.json();

    console.log(`Syncing RDS data with limit=${limit}, offset=${offset}`);

    // Get the active database config
    const { data: configData, error: configError } = await supabase
      .from('database_configs')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (configError) {
      console.error('Config error:', configError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get database config' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!configData) {
      return new Response(
        JSON.stringify({ success: false, error: 'No active database configuration found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Connect to external PostgreSQL
    const { Client } = await import("https://deno.land/x/postgres@v0.19.3/mod.ts");
    
    const isRDS = configData.host.includes('rds.amazonaws.com');
    const client = new Client({
      hostname: configData.host,
      port: configData.port || 5432,
      database: configData.database_name,
      user: configData.username,
      password: configData.password_encrypted,
      tls: isRDS ? { enabled: true, enforce: false } : undefined,
      connection: {
        attempts: 3,
      },
    });

    console.log(`Connecting to ${configData.host}:${configData.port}/${configData.database_name}`);
    await client.connect();

    // Get creators from external DB
    const result = await client.queryObject<RDSCreator>(`
      SELECT * FROM creators 
      ORDER BY scraped_at DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Get total count
    const countResult = await client.queryObject<{ count: string }>(`SELECT COUNT(*) as count FROM creators`);
    const totalCount = parseInt(countResult.rows[0]?.count || '0');

    await client.end();

    console.log(`Fetched ${result.rows.length} creators from RDS, total: ${totalCount}`);

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          imported: 0, 
          updated: 0, 
          total: totalCount,
          message: 'No creators found to sync' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert creators to Cloud database
    let imported = 0;
    let updated = 0;

    for (const creator of result.rows) {
      // Map field names and ensure proper types
      const creatorData = {
        username: creator.username,
        full_name: creator.full_name || null,
        profile_url: creator.profile_url || null,
        pk: creator.pk || null,
        follower_count: creator.follower_count || 0,
        following_count: creator.following_count || 0,
        media_count: creator.media_count || 0,
        is_verified: creator.is_verified || false,
        is_business: creator.is_business || false,
        is_private: creator.is_private || false,
        category: creator.category || null,
        bio: creator.bio || null,
        external_url: creator.external_url || null,
        profile_pic_url: creator.profile_pic_url || null,
        profile_pic_local: creator.profile_pic_local || null,
        bio_hashtags: creator.bio_hashtags || null,
        bio_mentions: creator.bio_mentions || null,
        engagement_rate: creator.engagement_rate || 0,
        source_keyword: creator.source_keyword || null,
        search_score: creator.search_score || 0,
        profile_type: creator.profile_type || null,
        scraped_at: creator.scraped_at || new Date().toISOString(),
        last_updated: new Date().toISOString(),
      };

      // Check if creator exists
      const { data: existing } = await supabase
        .from('creators')
        .select('id')
        .eq('username', creator.username)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('creators')
          .update(creatorData)
          .eq('username', creator.username);

        if (!updateError) {
          updated++;
        } else {
          console.error(`Failed to update ${creator.username}:`, updateError);
        }
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('creators')
          .insert(creatorData);

        if (!insertError) {
          imported++;
        } else {
          console.error(`Failed to insert ${creator.username}:`, insertError);
        }
      }
    }

    // Update last_connected timestamp
    await supabase
      .from('database_configs')
      .update({ last_connected: new Date().toISOString() })
      .eq('id', configData.id);

    console.log(`Sync complete: ${imported} imported, ${updated} updated`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported, 
        updated, 
        total: totalCount,
        hasMore: offset + result.rows.length < totalCount,
        message: `Successfully synced ${imported + updated} creators (${imported} new, ${updated} updated)`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Sync error:', error);
    
    let errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      errorMessage = 'Connection timeout. Ensure your RDS instance is publicly accessible and security group allows inbound connections.';
    } else if (errorMessage.includes('password authentication')) {
      errorMessage = 'Password authentication failed. Check your database credentials.';
    }
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
