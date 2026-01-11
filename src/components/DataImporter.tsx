import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  File
} from "lucide-react";
import { toast } from "sonner";

interface DataImporterProps {
  onImportComplete?: () => void;
}

interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: number;
  errorMessages: string[];
}

export function DataImporter({ onImportComplete }: DataImporterProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jsonData, setJsonData] = useState("");
  const [csvData, setCsvData] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("json");

  const parseCSV = (csv: string): any[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const record: any = {};
        headers.forEach((header, idx) => {
          record[header] = values[idx];
        });
        records.push(record);
      }
    }

    return records;
  };

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const normalizeCreatorData = (data: any): any => {
    return {
      username: data.username || data.Username || '',
      full_name: data.full_name || data.fullName || data.name || data.Name || '',
      profile_url: data.profile_url || data.profileUrl || data.url || '',
      pk: data.pk || data.instagram_id || data.id?.toString() || '',
      follower_count: parseInt(data.follower_count || data.followers || data.followerCount || 0),
      following_count: parseInt(data.following_count || data.following || data.followingCount || 0),
      media_count: parseInt(data.media_count || data.posts || data.mediaCount || 0),
      is_verified: Boolean(data.is_verified || data.verified || data.isVerified),
      is_business: Boolean(data.is_business || data.business || data.isBusiness),
      is_private: Boolean(data.is_private || data.private || data.isPrivate),
      category: data.category || data.Category || '',
      bio: data.bio || data.biography || data.Bio || '',
      external_url: data.external_url || data.website || data.externalUrl || '',
      profile_pic_url: data.profile_pic_url || data.avatar || data.profilePicUrl || '',
      bio_hashtags: data.bio_hashtags || data.hashtags || '',
      bio_mentions: data.bio_mentions || data.mentions || '',
      engagement_rate: parseFloat(data.engagement_rate || data.engagementRate || 0),
      source_keyword: data.source_keyword || data.source || 'import',
      profile_type: data.profile_type || data.type || '',
    };
  };

  const importData = async (records: any[]) => {
    if (records.length === 0) {
      toast.error("No valid records to import");
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setResult(null);

    const importResult: ImportResult = {
      success: true,
      imported: 0,
      updated: 0,
      errors: 0,
      errorMessages: []
    };

    const batchSize = 50;
    const totalBatches = Math.ceil(records.length / batchSize);

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const normalizedBatch = batch.map(normalizeCreatorData).filter(r => r.username);

      try {
        const { data, error } = await supabase
          .from('creators')
          .upsert(normalizedBatch, { 
            onConflict: 'username',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          importResult.errors += batch.length;
          importResult.errorMessages.push(`Batch ${Math.floor(i/batchSize) + 1}: ${error.message}`);
        } else {
          importResult.imported += data?.length || 0;
        }
      } catch (err: any) {
        importResult.errors += batch.length;
        importResult.errorMessages.push(`Batch ${Math.floor(i/batchSize) + 1}: ${err.message}`);
      }

      setProgress(Math.round(((i + batchSize) / records.length) * 100));
    }

    importResult.success = importResult.errors === 0;
    setResult(importResult);
    setIsImporting(false);

    if (importResult.imported > 0) {
      toast.success(`Imported ${importResult.imported} creators`);
      onImportComplete?.();
    }

    if (importResult.errors > 0) {
      toast.error(`${importResult.errors} records failed to import`);
    }
  };

  const handleJSONImport = async () => {
    try {
      const data = JSON.parse(jsonData);
      const records = Array.isArray(data) ? data : [data];
      await importData(records);
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  };

  const handleCSVImport = async () => {
    try {
      const records = parseCSV(csvData);
      await importData(records);
    } catch (error) {
      toast.error("Invalid CSV format");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      
      if (file.name.endsWith('.json')) {
        setJsonData(content);
        setActiveTab('json');
      } else if (file.name.endsWith('.csv')) {
        setCsvData(content);
        setActiveTab('csv');
      } else {
        toast.error("Unsupported file type. Use JSON or CSV.");
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="glass-panel rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Data Import</h3>
        </div>
      </div>

      <div className="space-y-4">
        {/* File Upload */}
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            variant="ghost" 
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <File className="w-5 h-5 mr-2" />
            Upload JSON or CSV File
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Or paste data directly below
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">JSON Data</Label>
              <Textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder={`[
  {
    "username": "example_user",
    "full_name": "Example User",
    "follower_count": 10000,
    "bio": "Content creator"
  }
]`}
                className="min-h-[150px] font-mono text-xs"
              />
            </div>
            <Button 
              onClick={handleJSONImport} 
              className="w-full"
              disabled={isImporting || !jsonData.trim()}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="csv" className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">CSV Data</Label>
              <Textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder={`username,full_name,follower_count,bio
example_user,Example User,10000,Content creator
another_user,Another User,5000,Influencer`}
                className="min-h-[150px] font-mono text-xs"
              />
            </div>
            <Button 
              onClick={handleCSVImport} 
              className="w-full"
              disabled={isImporting || !csvData.trim()}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Progress */}
        {isImporting && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Importing... {progress}%
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`p-3 rounded-lg ${result.success ? 'bg-success/10' : 'bg-warning/10'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertCircle className="w-4 h-4 text-warning" />
              )}
              <span className="text-sm font-medium">
                Import {result.success ? 'Complete' : 'Completed with Errors'}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                Imported: {result.imported}
              </Badge>
              {result.errors > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Errors: {result.errors}
                </Badge>
              )}
            </div>
            {result.errorMessages.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground max-h-20 overflow-y-auto">
                {result.errorMessages.slice(0, 3).map((msg, i) => (
                  <p key={i}>{msg}</p>
                ))}
                {result.errorMessages.length > 3 && (
                  <p>...and {result.errorMessages.length - 3} more errors</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
