import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Plus, Trash2, RefreshCw, Check, X, Settings } from "lucide-react";

interface DatabaseConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  is_active: boolean;
  last_connected: string | null;
  created_at: string;
}

interface TableInfo {
  name: string;
  rowCount: number;
  columns: string[];
}

export function DatabaseConfigPanel() {
  const [configs, setConfigs] = useState<DatabaseConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "External PostgreSQL",
    host: "",
    port: 5432,
    database_name: "",
    username: "postgres",
    password: "",
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("database_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
      
      // If we have an active config, fetch tables
      const activeConfig = data?.find(c => c.is_active);
      if (activeConfig) {
        fetchTables();
      }
    } catch (error) {
      console.error("Error fetching configs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTables = async () => {
    setIsLoadingTables(true);
    setTableError(null);
    try {
      const { data, error } = await supabase.functions.invoke("database-tables", {
        body: {},
      });

      if (error) throw error;
      if (data?.success === false) {
        setTableError(data.error || "Failed to fetch tables");
        setTables([]);
      } else if (data?.tables) {
        setTables(data.tables);
      }
    } catch (error: any) {
      console.error("Error fetching tables:", error);
      setTableError(error.message || "Failed to connect to database");
    } finally {
      setIsLoadingTables(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("test-db-connection", {
        body: {
          host: formData.host,
          port: formData.port,
          database: formData.database_name,
          user: formData.username,
          password: formData.password,
        },
      });

      if (error) throw error;
      if (data?.success) {
        setTestResult({ success: true, message: "Connection successful!" });
        toast.success("Connection successful!");
      } else {
        setTestResult({ success: false, message: data?.error || "Connection failed" });
        toast.error(data?.error || "Connection failed");
      }
    } catch (error: any) {
      console.error("Test connection error:", error);
      const message = error.message || "Connection test failed";
      setTestResult({ success: false, message });
      toast.error("Connection test failed: " + message);
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfig = async () => {
    try {
      // Deactivate other configs first
      await supabase
        .from("database_configs")
        .update({ is_active: false })
        .eq("is_active", true);

      const { error } = await supabase.from("database_configs").insert({
        name: formData.name,
        host: formData.host,
        port: formData.port,
        database_name: formData.database_name,
        username: formData.username,
        password_encrypted: formData.password, // In production, encrypt this
        is_active: true,
      });

      if (error) throw error;
      toast.success("Database configuration saved");
      setIsDialogOpen(false);
      fetchConfigs();
    } catch (error: any) {
      console.error("Save config error:", error);
      toast.error("Failed to save configuration: " + error.message);
    }
  };

  const deleteConfig = async (id: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return;
    try {
      const { error } = await supabase.from("database_configs").delete().eq("id", id);
      if (error) throw error;
      toast.success("Configuration deleted");
      fetchConfigs();
    } catch (error) {
      console.error("Delete config error:", error);
      toast.error("Failed to delete configuration");
    }
  };

  const setActiveConfig = async (id: string) => {
    try {
      // Deactivate all first
      await supabase
        .from("database_configs")
        .update({ is_active: false })
        .neq("id", "");

      // Activate selected
      const { error } = await supabase
        .from("database_configs")
        .update({ is_active: true, last_connected: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast.success("Database activated");
      fetchConfigs();
    } catch (error) {
      console.error("Set active error:", error);
      toast.error("Failed to activate database");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            External Database Configuration
          </CardTitle>
          <CardDescription>
            Connect to your PostgreSQL database for creator data
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Database Connection</DialogTitle>
              <DialogDescription>
                Configure your external PostgreSQL database connection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Connection Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Database"
                />
              </div>
              <div>
                <Label>Host</Label>
                <Input
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  placeholder="localhost"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Port</Label>
                  <Input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Database</Label>
                  <Input
                    value={formData.database_name}
                    onChange={(e) => setFormData({ ...formData, database_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Username</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={testConnection} disabled={isTesting || !formData.host || !formData.password}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isTesting ? "animate-spin" : ""}`} />
                  Test Connection
                </Button>
                <Button onClick={saveConfig} className="flex-1" disabled={!formData.host || !formData.password}>
                  Save Configuration
                </Button>
              </div>
              {testResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                  {testResult.success ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      {testResult.message}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading configurations...</p>
        ) : configs.length === 0 ? (
          <p className="text-muted-foreground">No database configurations yet. Add one to get started.</p>
        ) : (
          <div className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Database</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">{config.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {config.host}:{config.port}
                    </TableCell>
                    <TableCell>{config.database_name}</TableCell>
                    <TableCell>
                      {config.is_active ? (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!config.is_active && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveConfig(config.id)}
                          >
                            Activate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteConfig(config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Table Mapping */}
            {isLoadingTables ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading tables from external database...
              </div>
            ) : tableError ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-destructive mb-2">Connection Error</h4>
                <p className="text-sm text-destructive/80">{tableError}</p>
                <Button variant="outline" size="sm" onClick={fetchTables} className="mt-3">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : tables.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Database Tables
                  </h4>
                  <Button variant="ghost" size="sm" onClick={fetchTables}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tables.map((table) => (
                    <div key={table.name} className="bg-muted rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{table.name}</span>
                        <Badge variant="secondary">{table.rowCount} rows</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {table.columns.slice(0, 5).map((col) => (
                          <Badge key={col} variant="outline" className="text-xs">
                            {col}
                          </Badge>
                        ))}
                        {table.columns.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{table.columns.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
