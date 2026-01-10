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
    
    // Check if this is AWS RDS (requires SSL)
    const isRDS = host.includes('rds.amazonaws.com');
    
    const client = new Client({
      hostname: host,
      port: port,
      database: database,
      user: user,
      password: dbPassword,
      tls: { 
        enabled: isRDS, // Enable TLS for RDS
        enforce: false, // Don't enforce certificate verification for RDS
      },
      connection: {
        attempts: 1, // Single attempt to avoid long waits
      },
    });

    console.log(`Connecting with TLS: ${isRDS}`);
    
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
    const errorName = error instanceof Error ? error.name : '';
    
    console.error('Connection test error:', error);
    
    // Provide more helpful error messages
    let helpfulMessage = errorMessage;
    if (errorName === 'TimedOut' || errorMessage.includes('timed out')) {
      helpfulMessage = 'Connection timed out. The database server may not be accessible from this network. For AWS RDS, ensure the security group allows inbound connections from 0.0.0.0/0 on port 5432, or the RDS instance is publicly accessible.';
    } else if (errorMessage.includes('password authentication failed')) {
      helpfulMessage = 'Password authentication failed. Please check your username and password.';
    } else if (errorMessage.includes('does not exist')) {
      helpfulMessage = 'Database does not exist. Please check the database name.';
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: helpfulMessage 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
