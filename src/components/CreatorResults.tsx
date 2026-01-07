import { useState } from "react";
import { Creator } from "@/types/creator";
import { CreatorCard } from "./CreatorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Grid3X3, 
  List, 
  Search, 
  SortAsc, 
  SortDesc,
  Users,
  Loader2
} from "lucide-react";

interface CreatorResultsProps {
  creators: Creator[];
  isLoading?: boolean;
  onSelect?: (creator: Creator) => void;
}

type SortField = 'follower_count' | 'engagement_rate' | 'media_count' | 'full_name';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export function CreatorResults({ creators, isLoading, onSelect }: CreatorResultsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>('follower_count');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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
            <CreatorCard 
              key={creator.id} 
              creator={creator} 
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
