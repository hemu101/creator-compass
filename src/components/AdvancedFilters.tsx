import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SearchFilters } from "@/domain/entities/Creator";
import { 
  PLATFORMS, 
  NICHES, 
  CONTENT_TYPES, 
  GENDERS, 
  AGE_RANGES, 
  LANGUAGES, 
  ETHNICITIES 
} from "@/domain/constants/filters";
import { 
  Hash, 
  Search, 
  X, 
  Filter, 
  ChevronDown, 
  MapPin, 
  Globe, 
  Users, 
  DollarSign, 
  Languages,
  Sparkles
} from "lucide-react";

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

const DEFAULT_FILTERS: SearchFilters = {
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

export function AdvancedFilters({ filters, onFiltersChange, onSearch }: AdvancedFiltersProps) {
  const [hashtagInput, setHashtagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const addHashtag = () => {
    if (hashtagInput.trim() && !filters.hashtags.includes(hashtagInput.trim())) {
      onFiltersChange({
        ...filters,
        hashtags: [...filters.hashtags, hashtagInput.trim().replace('#', '')]
      });
      setHashtagInput("");
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

  const clearAllFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  // Helper to ensure value is never empty string for SelectItem
  const getSelectValue = (value: string | undefined, placeholder: string) => {
    return value || placeholder;
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Search Filters</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
          Clear All
        </Button>
      </div>

      {/* Basic Filters */}
      <div className="space-y-4">
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
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Follower Range
          </Label>
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

        {/* Platform */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Platform
          </Label>
          <Select 
            value={filters.platform || "all"} 
            onValueChange={(value) => onFiltersChange({ ...filters, platform: value === "all" ? "" : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {PLATFORMS.filter(p => p !== "Any").map(platform => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Niche/Category */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Niche / Category
          </Label>
          <Select 
            value={filters.niche || "all"} 
            onValueChange={(value) => onFiltersChange({ ...filters, niche: value === "all" ? "" : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All niches" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              <SelectItem value="all">All niches</SelectItem>
              {NICHES.map(niche => (
                <SelectItem key={niche} value={niche}>{niche}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters Collapsible */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={filters.country || ""}
                onChange={(e) => onFiltersChange({ ...filters, country: e.target.value })}
                placeholder="Country"
                className="input-glow"
              />
              <Input
                value={filters.state || ""}
                onChange={(e) => onFiltersChange({ ...filters, state: e.target.value })}
                placeholder="State"
                className="input-glow"
              />
              <Input
                value={filters.city || ""}
                onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
                placeholder="City"
                className="input-glow col-span-2"
              />
            </div>
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Content Type</Label>
            <Select 
              value={filters.contentType || "all"} 
              onValueChange={(value) => onFiltersChange({ ...filters, contentType: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All content types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All content types</SelectItem>
                {CONTENT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gender</Label>
            <Select 
              value={filters.gender || "all"} 
              onValueChange={(value) => onFiltersChange({ ...filters, gender: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any gender</SelectItem>
                {GENDERS.filter(g => g !== "Any").map(gender => (
                  <SelectItem key={gender} value={gender}>
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Age Range</Label>
            <Select 
              value={filters.ageRange || "all"} 
              onValueChange={(value) => onFiltersChange({ ...filters, ageRange: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any age</SelectItem>
                {AGE_RANGES.filter(a => a !== "Any").map(age => (
                  <SelectItem key={age} value={age}>
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Language
            </Label>
            <Select 
              value={filters.language || "all"} 
              onValueChange={(value) => onFiltersChange({ ...filters, language: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any language</SelectItem>
                {LANGUAGES.filter(l => l !== "Any").map(lang => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ethnicity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ethnicity</Label>
            <Select 
              value={filters.ethnicity || "all"} 
              onValueChange={(value) => onFiltersChange({ ...filters, ethnicity: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any ethnicity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any ethnicity</SelectItem>
                {ETHNICITIES.filter(e => e !== "Any").map(eth => (
                  <SelectItem key={eth} value={eth}>
                    {eth}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Price Range (per post)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Min</span>
                <Input
                  type="number"
                  value={filters.minPrice || ""}
                  onChange={(e) => onFiltersChange({ ...filters, minPrice: Number(e.target.value) })}
                  placeholder="$0"
                  className="input-glow"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Max</span>
                <Input
                  type="number"
                  value={filters.maxPrice || ""}
                  onChange={(e) => onFiltersChange({ ...filters, maxPrice: Number(e.target.value) })}
                  placeholder="$100,000"
                  className="input-glow"
                />
              </div>
            </div>
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
            <div className="flex items-center justify-between">
              <Label className="text-sm">Premium Creators</Label>
              <Switch
                checked={filters.isPremium === true}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, isPremium: checked ? true : null })}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Button onClick={onSearch} className="w-full" size="lg">
        <Search className="w-4 h-4 mr-2" />
        Search Creators
      </Button>
    </div>
  );
}
