import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFiltersPanel } from "@/components/SearchFiltersPanel";
import { PromptSearch, ExtractedFilters } from "@/components/PromptSearch";
import { SessionManager } from "@/components/SessionManager";
import { DatabaseStatus } from "@/components/DatabaseStatus";
import { CreatorResults } from "@/components/CreatorResults";
import { Creator, SearchFilters, SessionConfig } from "@/types/creator";
import { searchCreators, mockCreators } from "@/lib/database";
import { toast } from "sonner";
import { 
  Sparkles, 
  Filter, 
  Database,
  Zap
} from "lucide-react";

const defaultFilters: SearchFilters = {
  hashtags: [],
  mentions: [],
  keywords: [],
  minFollowers: 0,
  maxFollowers: 10000000,
  isVerified: null,
  isBusiness: null,
  isPrivate: null,
  profileType: "",
  category: ""
};

export default function Index() {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionConfig[]>([]);
  const [isDbConnected] = useState(true); // Mock connection status
  const [totalRecords] = useState(125847); // Mock total
  const [lastSync] = useState(new Date().toISOString());

  const handleFilterSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchCreators(filters);
      setCreators(results);
      toast.success(`Found ${results.length} creators`);
    } catch (error) {
      toast.error("Failed to search creators");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSearch = async (prompt: string, extracted: ExtractedFilters) => {
    setIsLoading(true);
    try {
      // Convert extracted filters to SearchFilters
      const promptFilters: SearchFilters = {
        ...defaultFilters,
        keywords: extracted.creatorTypes,
        minFollowers: extracted.followerRange.min,
        maxFollowers: extracted.followerRange.max,
      };
      
      const results = await searchCreators(promptFilters);
      setCreators(results);
      toast.success(`AI found ${results.length} creators matching your criteria`);
    } catch (error) {
      toast.error("Failed to process AI search");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCreator = (creator: Creator) => {
    toast.success(`Selected ${creator.full_name}`);
  };

  const handleRefreshDb = () => {
    toast.success("Database status refreshed");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Creator Discovery</h1>
                <p className="text-xs text-muted-foreground">Hexagonal Architecture • PostgreSQL</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <DatabaseStatus
                isConnected={isDbConnected}
                totalRecords={totalRecords}
                lastSync={lastSync}
                onRefresh={handleRefreshDb}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <Tabs defaultValue="prompt" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="prompt" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Prompt
                </TabsTrigger>
                <TabsTrigger value="filters" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </TabsTrigger>
              </TabsList>

              <TabsContent value="prompt" className="mt-0">
                <PromptSearch 
                  onSearch={handlePromptSearch}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="filters" className="mt-0">
                <SearchFiltersPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  onSearch={handleFilterSearch}
                />
              </TabsContent>
            </Tabs>

            {/* Session Manager */}
            <SessionManager
              sessions={sessions}
              onSessionsChange={setSessions}
            />
          </aside>

          {/* Main Content Area */}
          <section className="lg:col-span-8 xl:col-span-9">
            <CreatorResults
              creators={creators.length > 0 ? creators : mockCreators}
              isLoading={isLoading}
              onSelect={handleSelectCreator}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
