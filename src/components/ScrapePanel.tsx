import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Download, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Zap
} from "lucide-react";
import { api, ScrapeResult } from "@/lib/api";
import { toast } from "sonner";

interface ScrapePanelProps {
  activeSessionId?: string;
  onScrapeComplete?: (result: ScrapeResult) => void;
}

export function ScrapePanel({ activeSessionId, onScrapeComplete }: ScrapePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ScrapeResult | null>(null);

  const handleScrape = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.scrapeInstagram(searchQuery, activeSessionId, limit);
      setLastResult(result);
      
      if (result.success) {
        toast.success(`Found ${result.totalFound} profiles, saved ${result.totalSaved} to database`);
        onScrapeComplete?.(result);
      } else {
        toast.error(result.error || "Scraping failed");
      }
    } catch (error) {
      console.error('Scrape error:', error);
      toast.error("Failed to scrape Instagram");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-panel rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Instagram Scraper</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Search Query</Label>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., tech startup, fitness coach..."
            className="input-glow"
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleScrape()}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Max Results</Label>
          <Input
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            min={1}
            max={100}
            className="input-glow"
          />
        </div>

        {!activeSessionId && (
          <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>Add a session ID for better results</span>
          </div>
        )}

        <Button 
          onClick={handleScrape} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Scrape & Save
            </>
          )}
        </Button>

        {lastResult && (
          <div className={`p-3 rounded-lg ${lastResult.success ? 'bg-success/10' : 'bg-destructive/10'}`}>
            <div className="flex items-center gap-2 mb-2">
              {lastResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm font-medium">
                {lastResult.success ? 'Scrape Complete' : 'Scrape Failed'}
              </span>
            </div>
            {lastResult.success && (
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  Found: {lastResult.totalFound}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Saved: {lastResult.totalSaved}
                </Badge>
              </div>
            )}
            {!lastResult.success && (
              <p className="text-xs text-muted-foreground">{lastResult.error}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}