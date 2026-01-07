import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Server,
  Users,
  Clock
} from "lucide-react";

interface DatabaseStatusProps {
  isConnected: boolean;
  totalRecords: number;
  lastSync: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DatabaseStatus({ 
  isConnected, 
  totalRecords, 
  lastSync, 
  onRefresh,
  isRefreshing 
}: DatabaseStatusProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <Card className="glass-panel rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Database Status</h2>
        </div>
        <Badge 
          variant={isConnected ? "default" : "destructive"}
          className={isConnected ? "status-badge status-success" : ""}
        >
          {isConnected ? (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Disconnected
            </>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-secondary/50 rounded-lg">
          <Server className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">PostgreSQL</p>
          <p className="text-sm font-medium">AWS RDS</p>
        </div>
        <div className="text-center p-3 bg-secondary/50 rounded-lg">
          <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">Total Records</p>
          <p className="text-lg font-bold">{totalRecords.toLocaleString()}</p>
        </div>
        <div className="text-center p-3 bg-secondary/50 rounded-lg">
          <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Last Sync</p>
          <p className="text-xs font-medium">{formatDate(lastSync)}</p>
        </div>
      </div>

      <Button 
        onClick={onRefresh} 
        variant="outline" 
        className="w-full"
        disabled={isRefreshing}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
      </Button>
    </Card>
  );
}
