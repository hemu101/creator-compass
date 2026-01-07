import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SessionConfig } from "@/types/creator";
import { 
  Key, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Activity,
  Clock,
  BarChart3
} from "lucide-react";

interface SessionManagerProps {
  sessions: SessionConfig[];
  onSessionsChange: (sessions: SessionConfig[]) => void;
}

export function SessionManager({ sessions, onSessionsChange }: SessionManagerProps) {
  const [newSessionId, setNewSessionId] = useState("");

  const addSession = () => {
    if (!newSessionId.trim() || newSessionId.length < 20) return;
    
    const newSession: SessionConfig = {
      id: crypto.randomUUID(),
      sessionId: newSessionId.trim(),
      isActive: true,
      lastUsed: new Date().toISOString(),
      successRate: 100,
      totalRequests: 0
    };
    
    onSessionsChange([...sessions, newSession]);
    setNewSessionId("");
  };

  const removeSession = (id: string) => {
    onSessionsChange(sessions.filter(s => s.id !== id));
  };

  const toggleSession = (id: string) => {
    onSessionsChange(
      sessions.map(s => 
        s.id === id ? { ...s, isActive: !s.isActive } : s
      )
    );
  };

  const activeSessions = sessions.filter(s => s.isActive).length;

  return (
    <Card className="glass-panel rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Session Manager</h2>
        </div>
        <Badge variant={activeSessions > 0 ? "default" : "destructive"} className="text-xs">
          {activeSessions}/{sessions.length} Active
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Manage Instagram session IDs for API requests
      </p>

      {/* Add new session */}
      <div className="flex gap-2">
        <Input
          value={newSessionId}
          onChange={(e) => setNewSessionId(e.target.value)}
          placeholder="Paste session ID..."
          className="flex-1 input-glow font-mono text-xs"
        />
        <Button 
          onClick={addSession} 
          size="icon"
          disabled={newSessionId.length < 20}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Session list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No sessions added yet</p>
            <p className="text-xs">Add Instagram session IDs to start scraping</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div 
              key={session.id}
              className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
            >
              <Switch
                checked={session.isActive}
                onCheckedChange={() => toggleSession(session.id)}
              />
              
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs truncate text-muted-foreground">
                  {session.sessionId.slice(0, 20)}...{session.sessionId.slice(-10)}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {session.totalRequests} requests
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {session.successRate.toFixed(0)}% success
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {session.isActive ? (
                  <Badge className="status-badge status-success">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <X className="w-3 h-3 mr-1" />
                    Inactive
                  </Badge>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeSession(session.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats summary */}
      {sessions.length > 0 && (
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{activeSessions}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                {sessions.reduce((acc, s) => acc + s.totalRequests, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
