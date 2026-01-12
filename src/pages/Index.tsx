import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { FreeTools } from "@/components/FreeTools";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Creator, SearchFilters, SessionConfig } from "@/domain/entities/Creator";
import { 
  creatorRepository, 
  sessionRepository 
} from "@/adapters/repositories/SupabaseCreatorRepository";
import { DatabaseStats } from "@/ports/repositories/CreatorRepository";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Filter, 
  Zap,
  Database,
  Settings,
  Plus,
  LogOut,
  User,
  Calculator,
  BarChart3
} from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

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
  category: "",
  location: "",
  city: "",
  country: "",
  state: "",
  gender: "",
  ageRange: "",
  language: "",
  ethnicity: "",
  minPrice: 0,
  maxPrice: 100000,
  platform: "",
  niche: "",
  contentType: "",
  isPremium: null
};

// Legacy Creator type for UI components that still use snake_case
interface LegacyCreator {
  id: number;
  username: string;
  full_name: string;
  profile_url: string;
  pk: string;
  follower_count: number;
  following_count: number;
  media_count: number;
  is_verified: boolean;
  is_business: boolean;
  is_private: boolean;
  category: string;
  bio: string;
  external_url: string;
  profile_pic_url: string;
  profile_pic_local: string;
  bio_hashtags: string;
  bio_mentions: string;
  engagement_rate: number;
  source_keyword: string;
  search_score: number;
  profile_type: string;
  scraped_at: string;
  last_updated: string;
  location?: string;
  city?: string;
  country?: string;
  state?: string;
  gender?: string;
  age_range?: string;
  language?: string;
  ethnicity?: string;
  price_range?: string;
  platform?: string;
  niche?: string;
  content_type?: string;
  is_premium?: boolean;
}

// Map domain Creator to legacy format for UI components
const mapToLegacy = (c: Creator): LegacyCreator => ({
  id: parseInt(c.id) || 0,
  username: c.username,
  full_name: c.fullName,
  profile_url: c.profileUrl,
  pk: c.pk,
  follower_count: c.followerCount,
  following_count: c.followingCount,
  media_count: c.mediaCount,
  is_verified: c.isVerified,
  is_business: c.isBusiness,
  is_private: c.isPrivate,
  category: c.category,
  bio: c.bio,
  external_url: c.externalUrl,
  profile_pic_url: c.profilePicUrl,
  profile_pic_local: c.profilePicLocal,
  bio_hashtags: c.bioHashtags,
  bio_mentions: c.bioMentions,
  engagement_rate: c.engagementRate,
  source_keyword: c.sourceKeyword,
  search_score: c.searchScore,
  profile_type: c.profileType,
  scraped_at: c.scrapedAt,
  last_updated: c.lastUpdated,
  location: c.location,
  city: c.city,
  country: c.country,
  state: c.state,
  gender: c.gender,
  age_range: c.ageRange,
  language: c.language,
  ethnicity: c.ethnicity,
  price_range: c.priceRange,
  platform: c.platform,
  niche: c.niche,
  content_type: c.contentType,
  is_premium: c.isPremium,
});

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [creators, setCreators] = useState<LegacyCreator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionConfig[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<LegacyCreator | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  // Auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
    loadCreators();
  }, []);

  const loadSessions = async () => {
    const loadedSessions = await sessionRepository.getAll();
    setSessions(loadedSessions);
  };

  const loadCreators = async () => {
    setIsLoading(true);
    try {
      const result = await creatorRepository.search(defaultFilters);
      if (result.success) {
        setCreators(result.creators.map(mapToLegacy));
      }
    } catch (error) {
      console.error('Failed to load creators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSearch = async () => {
    setIsLoading(true);
    try {
      const result = await creatorRepository.search(filters);
      if (result.success) {
        setCreators(result.creators.map(mapToLegacy));
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
      
      const result = await creatorRepository.search(promptFilters);
      if (result.success) {
        setCreators(result.creators.map(mapToLegacy));
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

  const handleSelectCreator = (creator: LegacyCreator) => {
    setSelectedCreator(creator);
    setIsDetailModalOpen(true);
  };

  const handleScrapeComplete = () => {
    loadCreators();
  };

  const handleSessionsChange = async (newSessions: SessionConfig[]) => {
    setSessions(newSessions);
  };

  const getActiveSessionId = (): string | undefined => {
    const active = sessions.find(s => s.isActive);
    return active?.sessionId;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
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
              <ThemeToggle />
              <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Creator
              </Button>
              <ExportPanel creators={creators as any} />
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden md:inline">
                    {user.email}
                  </span>
                  <Button onClick={handleLogout} variant="ghost" size="icon">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => navigate("/auth")} variant="default">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="scraping" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Sessions & Scraping
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database Config
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Free Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar */}
              <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
                {/* Database Status */}
                <DatabaseSetup onStatsUpdate={setDbStats} />

                <Tabs defaultValue="filters" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-4">
                    <TabsTrigger value="filters" className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </TabsTrigger>
                    <TabsTrigger value="prompt" className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Prompt
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="filters" className="mt-0">
                    <AdvancedFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      onSearch={handleFilterSearch}
                    />
                  </TabsContent>

                  <TabsContent value="prompt" className="mt-0">
                    <PromptSearch 
                      onSearch={handlePromptSearch}
                      isLoading={isLoading}
                    />
                  </TabsContent>
                </Tabs>
              </aside>

              {/* Main Content Area */}
              <section className="lg:col-span-8 xl:col-span-9">
                <CreatorResults
                  creators={creators as any}
                  isLoading={isLoading}
                  onSelect={handleSelectCreator as any}
                  onRefresh={loadCreators}
                />
              </section>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="scraping">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sessions */}
              <div className="space-y-6">
                <SessionManager
                  sessions={sessions}
                  onSessionsChange={handleSessionsChange}
                />
              </div>
              
              {/* Scraping + CSV Import */}
              <div className="space-y-6">
                <ScrapePanel 
                  activeSessionId={getActiveSessionId()} 
                  onScrapeComplete={handleScrapeComplete}
                />
                <DataImporter onImportComplete={loadCreators} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="database">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DatabaseConfigPanel />
              <DuplicateDetector onRefresh={loadCreators} />
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="max-w-2xl mx-auto">
              <FreeTools />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Creator Detail Modal */}
      <CreatorDetailModal
        creator={selectedCreator as any}
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
