import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Clock,
  HardDrive,
  Activity
} from "lucide-react";
import { api, DatabaseStats } from "@/lib/api";

interface DatabaseSetupProps {
  onStatsUpdate?: (stats: DatabaseStats['stats']) => void;
}

export function DatabaseSetup({ onStatsUpdate }: DatabaseSetupProps) {
  const [stats, setStats] = useState<DatabaseStats['stats'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const result = await api.getDatabaseStats();
      setStats(result.stats);
      onStatsUpdate?.(result.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Card className="glass-panel rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Database Status</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchStats}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Connection</span>
          {stats?.isConnected ? (
            <Badge className="bg-success/20 text-success border-success/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Disconnected
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <HardDrive className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{stats?.totalCreators?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground">Total Records</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Activity className="w-4 h-4 mx-auto mb-1 text-accent" />
            <p className="text-xl font-bold">{stats?.activeSessions || 0}</p>
            <p className="text-xs text-muted-foreground">Active Sessions</p>
          </div>
        </div>

        {/* Last Sync */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Last sync: {formatDate(stats?.lastSync || null)}</span>
        </div>

        {/* Recent Jobs */}
        {stats?.recentJobs && stats.recentJobs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Recent Jobs</p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {stats.recentJobs.slice(0, 3).map((job: any) => (
                <div key={job.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                  <span className="truncate flex-1">{job.search_query}</span>
                  <Badge variant="outline" className="text-[10px] ml-2">
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}