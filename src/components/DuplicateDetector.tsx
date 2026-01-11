import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { 
  Copy, 
  Loader2, 
  Merge, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  Search,
  User
} from "lucide-react";
import { toast } from "sonner";
import { Creator } from "@/types/creator";

interface DuplicateGroup {
  key: string;
  creators: Creator[];
  similarity: string;
}

interface DuplicateDetectorProps {
  onRefresh?: () => void;
}

export function DuplicateDetector({ onRefresh }: DuplicateDetectorProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [isMerging, setIsMerging] = useState(false);

  const scanForDuplicates = async () => {
    setIsScanning(true);
    try {
      // Fetch all creators
      const { data: creators, error } = await supabase
        .from('creators')
        .select('*')
        .order('username');

      if (error) throw error;

      // Group by username (exact match)
      const usernameGroups = new Map<string, Creator[]>();
      creators?.forEach((c: any) => {
        const key = c.username?.toLowerCase().trim();
        if (key) {
          if (!usernameGroups.has(key)) {
            usernameGroups.set(key, []);
          }
          usernameGroups.get(key)!.push(mapCreator(c));
        }
      });

      // Group by pk (Instagram user ID)
      const pkGroups = new Map<string, Creator[]>();
      creators?.forEach((c: any) => {
        const key = c.pk?.trim();
        if (key) {
          if (!pkGroups.has(key)) {
            pkGroups.set(key, []);
          }
          pkGroups.get(key)!.push(mapCreator(c));
        }
      });

      const duplicateGroups: DuplicateGroup[] = [];

      // Find username duplicates
      usernameGroups.forEach((group, key) => {
        if (group.length > 1) {
          duplicateGroups.push({
            key: `username-${key}`,
            creators: group,
            similarity: `Same username: @${key}`
          });
        }
      });

      // Find pk duplicates (that aren't already in username groups)
      pkGroups.forEach((group, key) => {
        if (group.length > 1) {
          const existingUsernames = new Set(
            duplicateGroups.flatMap(g => g.creators.map(c => c.username))
          );
          const uniqueInGroup = group.filter(c => !existingUsernames.has(c.username));
          if (uniqueInGroup.length > 1) {
            duplicateGroups.push({
              key: `pk-${key}`,
              creators: group,
              similarity: `Same Instagram ID: ${key.slice(0, 10)}...`
            });
          }
        }
      });

      setDuplicates(duplicateGroups);
      
      if (duplicateGroups.length === 0) {
        toast.success("No duplicates found!");
      } else {
        toast.info(`Found ${duplicateGroups.length} duplicate groups`);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error("Failed to scan for duplicates");
    } finally {
      setIsScanning(false);
    }
  };

  const mapCreator = (c: any): Creator => ({
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

  const toggleGroupSelection = (key: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedGroups(newSelected);
  };

  const mergeSelected = async () => {
    if (selectedGroups.size === 0) {
      toast.error("Select duplicate groups to merge");
      return;
    }

    setIsMerging(true);
    try {
      let totalMerged = 0;

      for (const key of selectedGroups) {
        const group = duplicates.find(d => d.key === key);
        if (!group || group.creators.length < 2) continue;

        // Keep the one with most followers or most recent update
        const sorted = [...group.creators].sort((a, b) => {
          // Prioritize by follower count, then by last_updated
          if (b.follower_count !== a.follower_count) {
            return b.follower_count - a.follower_count;
          }
          return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
        });

        const keepCreator = sorted[0];
        const deleteIds = sorted.slice(1).map(c => String(c.id));

        // Delete duplicates
        const { error } = await supabase
          .from('creators')
          .delete()
          .in('id', deleteIds);

        if (error) throw error;

        totalMerged += deleteIds.length;
      }

      toast.success(`Merged ${totalMerged} duplicate profiles`);
      setSelectedGroups(new Set());
      scanForDuplicates();
      onRefresh?.();
    } catch (error) {
      console.error('Merge error:', error);
      toast.error("Failed to merge duplicates");
    } finally {
      setIsMerging(false);
    }
  };

  const selectAll = () => {
    setSelectedGroups(new Set(duplicates.map(d => d.key)));
  };

  const deselectAll = () => {
    setSelectedGroups(new Set());
  };

  return (
    <Card className="glass-panel rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Copy className="w-5 h-5 text-warning" />
          <h3 className="font-semibold">Duplicate Detection</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {duplicates.length} Groups
        </Badge>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={scanForDuplicates} 
          className="w-full"
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Scan for Duplicates
            </>
          )}
        </Button>

        {duplicates.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={mergeSelected}
                disabled={selectedGroups.size === 0 || isMerging}
              >
                {isMerging ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Merge className="w-4 h-4 mr-2" />
                )}
                Merge Selected ({selectedGroups.size})
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {duplicates.map((group) => (
                  <div 
                    key={group.key}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedGroups.has(group.key) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-secondary/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedGroups.has(group.key)}
                        onCheckedChange={() => toggleGroupSelection(group.key)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          <span className="text-sm font-medium">{group.similarity}</span>
                          <Badge variant="secondary" className="text-xs">
                            {group.creators.length} duplicates
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {group.creators.map((creator, idx) => (
                            <div 
                              key={creator.id}
                              className={`flex items-center gap-3 p-2 rounded ${
                                idx === 0 ? 'bg-success/10 border border-success/20' : 'bg-muted/50'
                              }`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={creator.profile_pic_url} />
                                <AvatarFallback>
                                  <User className="w-4 h-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  @{creator.username}
                                  {idx === 0 && (
                                    <span className="ml-2 text-xs text-success">
                                      (will keep)
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {creator.follower_count.toLocaleString()} followers • 
                                  Updated: {new Date(creator.last_updated).toLocaleDateString()}
                                </p>
                              </div>
                              {idx > 0 && (
                                <Trash2 className="w-4 h-4 text-destructive/50" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {duplicates.length === 0 && !isScanning && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-success/50" />
            <p className="text-sm">No duplicates detected</p>
            <p className="text-xs">Click "Scan" to check for duplicate profiles</p>
          </div>
        )}
      </div>
    </Card>
  );
}
