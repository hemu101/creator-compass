import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchFilters } from "@/types/creator";
import { Hash, AtSign, Search, X, Filter } from "lucide-react";

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

export function SearchFiltersPanel({ filters, onFiltersChange, onSearch }: SearchFiltersPanelProps) {
  const [hashtagInput, setHashtagInput] = useState("");
  const [mentionInput, setMentionInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const addHashtag = () => {
    if (hashtagInput.trim() && !filters.hashtags.includes(hashtagInput.trim())) {
      onFiltersChange({
        ...filters,
        hashtags: [...filters.hashtags, hashtagInput.trim().replace('#', '')]
      });
      setHashtagInput("");
    }
  };

  const addMention = () => {
    if (mentionInput.trim() && !filters.mentions.includes(mentionInput.trim())) {
      onFiltersChange({
        ...filters,
        mentions: [...filters.mentions, mentionInput.trim().replace('@', '')]
      });
      setMentionInput("");
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !filters.keywords.includes(keywordInput.trim())) {
      onFiltersChange({
        ...filters,
        keywords: [...filters.keywords, keywordInput.trim()]
      });
      setKeywordInput("");
    }
  };

  const removeItem = (type: 'hashtags' | 'mentions' | 'keywords', value: string) => {
    onFiltersChange({
      ...filters,
      [type]: filters[type].filter(item => item !== value)
    });
  };

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Search Filters</h2>
      </div>

      {/* Hashtags */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Hash className="w-4 h-4 text-accent" />
          Hashtags
        </Label>
        <div className="flex gap-2">
          <Input
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
            placeholder="Add hashtag..."
            className="flex-1 input-glow"
          />
          <Button onClick={addHashtag} size="icon" variant="secondary">
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.hashtags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              #{tag}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" 
                onClick={() => removeItem('hashtags', tag)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Mentions */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <AtSign className="w-4 h-4 text-info" />
          Mentions
        </Label>
        <div className="flex gap-2">
          <Input
            value={mentionInput}
            onChange={(e) => setMentionInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMention()}
            placeholder="Add mention..."
            className="flex-1 input-glow"
          />
          <Button onClick={addMention} size="icon" variant="secondary">
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.mentions.map(mention => (
            <Badge key={mention} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              @{mention}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" 
                onClick={() => removeItem('mentions', mention)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Keywords</Label>
        <div className="flex gap-2">
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
            placeholder="Add keyword..."
            className="flex-1 input-glow"
          />
          <Button onClick={addKeyword} size="icon" variant="secondary">
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.keywords.map(kw => (
            <Badge key={kw} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              {kw}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" 
                onClick={() => removeItem('keywords', kw)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Follower Range */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Follower Range</Label>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatFollowerCount(filters.minFollowers)}</span>
            <span>{formatFollowerCount(filters.maxFollowers)}</span>
          </div>
          <Slider
            value={[filters.minFollowers, filters.maxFollowers]}
            onValueChange={([min, max]) => onFiltersChange({ ...filters, minFollowers: min, maxFollowers: max })}
            min={0}
            max={10000000}
            step={1000}
            className="w-full"
          />
        </div>
      </div>

      {/* Profile Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Profile Type</Label>
        <Select 
          value={filters.profileType} 
          onValueChange={(value) => onFiltersChange({ ...filters, profileType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            <SelectItem value="creator">Creator</SelectItem>
            <SelectItem value="brand">Brand</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Category</Label>
        <Input
          value={filters.category}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
          placeholder="e.g., Technology, Fashion..."
          className="input-glow"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Verified Only</Label>
          <Switch
            checked={filters.isVerified === true}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, isVerified: checked ? true : null })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Business Accounts</Label>
          <Switch
            checked={filters.isBusiness === true}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, isBusiness: checked ? true : null })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Public Only</Label>
          <Switch
            checked={filters.isPrivate === false}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, isPrivate: checked ? false : null })}
          />
        </div>
      </div>

      <Button onClick={onSearch} className="w-full" size="lg">
        <Search className="w-4 h-4 mr-2" />
        Search Creators
      </Button>
    </div>
  );
}
