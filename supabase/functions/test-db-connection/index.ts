import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, port, database, user, password } = await req.json();
    
    console.log(`Testing connection to ${host}:${port}/${database}`);
    
    // Use the provided password or fall back to secret
    const dbPassword = password || Deno.env.get('EXTERNAL_DB_PASSWORD');
    
    if (!dbPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Database password not provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Import postgres client
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    
    const client = new Client({
      hostname: host,
      port: port,
      database: database,
      user: user,
      password: dbPassword,
      tls: { enabled: false },
    });

    await client.connect();
    
    // Test query
    const result = await client.queryObject("SELECT 1 as test");
    
    await client.end();
    
    console.log("Connection test successful");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Connection successful',
        result: result.rows 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Connection test error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
