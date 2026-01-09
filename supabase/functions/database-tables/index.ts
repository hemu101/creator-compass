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
    
    // Get active database config
    const { data: config } = await supabase
      .from('database_configs')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (!config) {
      return new Response(
        JSON.stringify({ success: false, error: 'No active database configuration', tables: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dbPassword = Deno.env.get('EXTERNAL_DB_PASSWORD');
    
    if (!dbPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Database password not configured', tables: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Import postgres client
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    
    const client = new Client({
      hostname: config.host,
      port: config.port,
      database: config.database_name,
      user: config.username,
      password: dbPassword,
      tls: { enabled: false },
    });

    await client.connect();
    
    // Get tables
    const tablesResult = await client.queryObject<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = [];
    
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      
      // Get row count
      const countResult = await client.queryObject<{ count: number }>(
        `SELECT COUNT(*)::int as count FROM "${tableName}"`
      );
      
      // Get columns
      const columnsResult = await client.queryObject<{ column_name: string }>(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      tables.push({
        name: tableName,
        rowCount: countResult.rows[0]?.count || 0,
        columns: columnsResult.rows.map(c => c.column_name),
      });
    }
    
    await client.end();
    
    console.log(`Found ${tables.length} tables`);
    
    return new Response(
      JSON.stringify({ success: true, tables }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database tables error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage, tables: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
