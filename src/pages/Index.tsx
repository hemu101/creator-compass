import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFiltersPanel } from "@/components/SearchFiltersPanel";
import { PromptSearch, ExtractedFilters } from "@/components/PromptSearch";
import { SessionManager } from "@/components/SessionManager";
import { DatabaseSetup } from "@/components/DatabaseSetup";
import { DatabaseConfigPanel } from "@/components/DatabaseConfigPanel";
import { ScrapePanel } from "@/components/ScrapePanel";
import { CreatorResults } from "@/components/CreatorResults";
import { CreatorDetailModal } from "@/components/CreatorDetailModal";
import { AddCreatorModal } from "@/components/AddCreatorModal";
import { ExportPanel } from "@/components/ExportPanel";
import { DuplicateDetector } from "@/components/DuplicateDetector";
import { DataImporter } from "@/components/DataImporter";
import { Creator, SearchFilters, SessionConfig } from "@/types/creator";
import { api, DatabaseStats } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Filter, 
  Zap,
  Database,
  Settings,
  Plus,
  Upload
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
  const [dbStats, setDbStats] = useState<DatabaseStats['stats'] | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
    loadCreators();
  }, []);

  const loadSessions = async () => {
    const loadedSessions = await api.getSessions();
    setSessions(loadedSessions);
  };

  const loadCreators = async () => {
    setIsLoading(true);
    try {
      const result = await api.searchCreators(defaultFilters);
      if (result.success) {
        setCreators(result.creators.map(mapCreatorFromDb));
      }
    } catch (error) {
      console.error('Failed to load creators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapCreatorFromDb = (c: any): Creator => ({
    id: c.id,
    username: c.username || '',
    full_name: c.full_name || '',
    profile_url: c.profile_url || '',
    pk: c.pk || '',
    follower_count: c.follower_count || 0,
    following_count: c.following_count || 0,
    media_count: c.media_count || 0,
    is_verified: c.is_verified || false,
    is_business: c.is_business || false,
    is_private: c.is_private || false,
    category: c.category || '',
    bio: c.bio || '',
    external_url: c.external_url || '',
    profile_pic_url: c.profile_pic_url || '',
    profile_pic_local: c.profile_pic_local || '',
    bio_hashtags: c.bio_hashtags || '',
    bio_mentions: c.bio_mentions || '',
    engagement_rate: Number(c.engagement_rate) || 0,
    source_keyword: c.source_keyword || '',
    search_score: c.search_score || 0,
    profile_type: c.profile_type || '',
    scraped_at: c.scraped_at || '',
    last_updated: c.last_updated || ''
  });

  const handleFilterSearch = async () => {
    setIsLoading(true);
    try {
      const result = await api.searchCreators(filters);
      if (result.success) {
        const mappedCreators = result.creators.map(mapCreatorFromDb);
        setCreators(mappedCreators);
        toast.success(`Found ${result.total} creators`);
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
      toast.error("Failed to search creators");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSearch = async (prompt: string, extracted: ExtractedFilters) => {
    setIsLoading(true);
    try {
      const promptFilters: SearchFilters = {
        ...defaultFilters,
        keywords: extracted.creatorTypes,
        minFollowers: extracted.followerRange.min,
        maxFollowers: extracted.followerRange.max,
      };
      
      const result = await api.searchCreators(promptFilters);
      if (result.success) {
        const mappedCreators = result.creators.map(mapCreatorFromDb);
        setCreators(mappedCreators);
        toast.success(`AI found ${result.total} creators matching your criteria`);
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
      toast.error("Failed to process AI search");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCreator = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsDetailModalOpen(true);
  };

  const handleScrapeComplete = () => {
    // Reload creators after scrape
    loadCreators();
  };

  const handleSessionsChange = async (newSessions: SessionConfig[]) => {
    setSessions(newSessions);
  };

  const getActiveSessionId = (): string | undefined => {
    const active = sessions.find(s => s.isActive);
    return active?.sessionId;
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
                <p className="text-xs text-muted-foreground">Real-time Instagram Scraping • Cloud Database</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Creator
              </Button>
              <ExportPanel creators={creators} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Search & Scrape
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database Config
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar */}
              <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
                {/* Database Status */}
                <DatabaseSetup onStatsUpdate={setDbStats} />

                {/* Scrape Panel */}
                <ScrapePanel 
                  activeSessionId={getActiveSessionId()} 
                  onScrapeComplete={handleScrapeComplete}
                />

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
              </aside>

              {/* Main Content Area */}
              <section className="lg:col-span-8 xl:col-span-9">
                <CreatorResults
                  creators={creators}
                  isLoading={isLoading}
                  onSelect={handleSelectCreator}
                  onRefresh={loadCreators}
                />
              </section>
            </div>
          </TabsContent>

          <TabsContent value="database">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DatabaseConfigPanel />
              <div className="space-y-6">
                <DataImporter onImportComplete={loadCreators} />
                <DuplicateDetector onRefresh={loadCreators} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl">
              <SessionManager
                sessions={sessions}
                onSessionsChange={handleSessionsChange}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Creator Detail Modal */}
      <CreatorDetailModal
        creator={selectedCreator}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onUpdate={loadCreators}
      />

      {/* Add Creator Modal */}
      <AddCreatorModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onCreated={loadCreators}
      />
    </div>
  );
}
