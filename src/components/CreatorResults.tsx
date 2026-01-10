import { useState } from "react";
import { Creator } from "@/types/creator";
import { CreatorCard } from "./CreatorCard";
import { BulkActionsBar } from "./BulkActionsBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Grid3X3, 
  List, 
  Search, 
  SortAsc, 
  SortDesc,
  Users,
  Loader2,
  CheckSquare,
  Square
} from "lucide-react";

interface CreatorResultsProps {
  creators: Creator[];
  isLoading?: boolean;
  onSelect?: (creator: Creator) => void;
  onRefresh?: () => void;
}

type SortField = 'follower_count' | 'engagement_rate' | 'media_count' | 'full_name';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export function CreatorResults({ creators, isLoading, onSelect, onRefresh }: CreatorResultsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>('follower_count');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredCreators = creators
    .filter(c => 
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bio.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' 
        ? (aVal as number) - (bVal as number) 
        : (bVal as number) - (aVal as number);
    });

  const selectedCreators = creators.filter(c => selectedIds.has(String(c.id)));

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredCreators.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCreators.map(c => String(c.id))));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from('creators')
        .delete()
        .in('id', ids);

      if (error) throw error;
      toast.success(`Deleted ${ids.length} creators`);
      setSelectedIds(new Set());
      onRefresh?.();
    } catch (error: any) {
      toast.error("Failed to delete creators: " + error.message);
    }
  };

  const handleBulkExport = (format: 'csv' | 'excel' | 'json') => {
    const headers = [
      "Username", "Full Name", "Followers", "Following", "Posts",
      "Engagement Rate", "Category", "Bio", "Profile URL", "External URL",
      "Is Verified", "Is Business", "Is Private", "Bio Hashtags", "Bio Mentions", "Scraped At"
    ];

    const rows = selectedCreators.map((c) => [
      c.username, c.full_name, c.follower_count, c.following_count, c.media_count,
      (c.engagement_rate * 100).toFixed(2) + "%", c.category || "", c.bio?.replace(/[\n\r,]/g, " ") || "",
      c.profile_url, c.external_url || "", c.is_verified ? "Yes" : "No",
      c.is_business ? "Yes" : "No", c.is_private ? "Yes" : "No",
      c.bio_hashtags || "", c.bio_mentions || "", c.scraped_at
    ]);

    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === "csv") {
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      content = csvContent;
      mimeType = "text/csv";
      extension = "csv";
    } else if (format === "excel") {
      const tsvContent = [
        headers.join("\t"),
        ...rows.map((row) => row.map((cell) => String(cell).replace(/[\t\n\r]/g, " ")).join("\t"))
      ].join("\n");
      content = tsvContent;
      mimeType = "application/vnd.ms-excel";
      extension = "xls";
    } else {
      content = JSON.stringify(selectedCreators, null, 2);
      mimeType = "application/json";
      extension = "json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `creators-selected-${new Date().toISOString().split("T")[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedCreators.length} creators as ${format.toUpperCase()}`);
  };

  const handleBulkTag = async (category: string) => {
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from('creators')
        .update({ category })
        .in('id', ids);

      if (error) throw error;
      toast.success(`Updated category to "${category}" for ${ids.length} creators`);
      setSelectedIds(new Set());
      onRefresh?.();
    } catch (error: any) {
      toast.error("Failed to update category: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Searching creators...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAll}
            className="gap-2"
          >
            {selectedIds.size === filteredCreators.length && filteredCreators.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Select All
          </Button>
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Results</h2>
          <Badge variant="secondary">{filteredCreators.length} creators</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in results..."
            className="pl-9 input-glow"
          />
        </div>

        <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="follower_count">Followers</SelectItem>
            <SelectItem value="engagement_rate">Engagement</SelectItem>
            <SelectItem value="media_count">Posts</SelectItem>
            <SelectItem value="full_name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="w-4 h-4" />
          ) : (
            <SortDesc className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Results */}
      {filteredCreators.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">No creators found</p>
          <p className="text-sm text-muted-foreground/70">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
            : "space-y-4"
        }>
          {filteredCreators.map((creator) => (
            <div key={creator.id} className="relative">
              <div className="absolute top-3 left-3 z-10">
                <Checkbox
                  checked={selectedIds.has(String(creator.id))}
                  onCheckedChange={() => toggleSelection(String(creator.id))}
                  className="bg-background/80 backdrop-blur"
                />
              </div>
              <CreatorCard 
                creator={creator} 
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCreators={selectedCreators}
        onClearSelection={() => setSelectedIds(new Set())}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onTagUpdate={handleBulkTag}
      />
    </div>
  );
}
