import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Loader2, Lightbulb } from "lucide-react";

interface PromptSearchProps {
  onSearch: (prompt: string, extractedFilters: ExtractedFilters) => void;
  isLoading?: boolean;
}

export interface ExtractedFilters {
  creatorNature: string;
  followerRange: { min: number; max: number };
  creatorTypes: string[];
  contentType: string;
  priority: string;
}

const examplePrompts = [
  "UGC creators with less than 5k followers who talk about tech startups",
  "Verified fashion influencers with 10k-50k followers for product reviews",
  "Business coaches with strong storytelling skills under 10k followers",
  "Video creators specializing in product walkthroughs and demos"
];

export function PromptSearch({ onSearch, isLoading }: PromptSearchProps) {
  const [prompt, setPrompt] = useState("");

  const parsePrompt = (text: string): ExtractedFilters => {
    const lowered = text.toLowerCase();
    
    // Extract follower range
    let followerRange = { min: 0, max: 10000000 };
    const followerPatterns = [
      /less than (\d+)k/i,
      /under (\d+)k/i,
      /(\d+)k?\s*-\s*(\d+)k/i,
      /(\d+)k followers/i
    ];
    
    for (const pattern of followerPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (pattern.source.includes('-')) {
          followerRange.min = parseInt(match[1]) * 1000;
          followerRange.max = parseInt(match[2]) * 1000;
        } else if (pattern.source.includes('less') || pattern.source.includes('under')) {
          followerRange.max = parseInt(match[1]) * 1000;
        } else {
          followerRange.min = parseInt(match[1]) * 1000;
          followerRange.max = parseInt(match[1]) * 1000 + 5000;
        }
        break;
      }
    }

    // Extract creator types
    const creatorTypes: string[] = [];
    const typeKeywords = ['ugc', 'tech', 'fashion', 'beauty', 'fitness', 'food', 'travel', 'business', 'marketing', 'video', 'lifestyle'];
    for (const keyword of typeKeywords) {
      if (lowered.includes(keyword)) {
        creatorTypes.push(keyword);
      }
    }

    // Extract creator nature
    let creatorNature = '';
    if (lowered.includes('ugc')) creatorNature = 'UGC Creator';
    else if (lowered.includes('influencer')) creatorNature = 'Influencer';
    else if (lowered.includes('creator')) creatorNature = 'Content Creator';
    else if (lowered.includes('coach')) creatorNature = 'Coach';

    // Extract content type
    let contentType = '';
    if (lowered.includes('walkthrough')) contentType = 'Walkthroughs';
    else if (lowered.includes('review')) contentType = 'Reviews';
    else if (lowered.includes('tutorial')) contentType = 'Tutorials';
    else if (lowered.includes('promo')) contentType = 'Promotional';

    // Extract priority
    let priority = '';
    if (lowered.includes('storytelling')) priority = 'Good storytelling';
    else if (lowered.includes('engagement')) priority = 'High engagement';
    else if (lowered.includes('authentic')) priority = 'Authenticity';

    return {
      creatorNature,
      followerRange,
      creatorTypes,
      contentType,
      priority
    };
  };

  const handleSearch = () => {
    if (!prompt.trim()) return;
    const extracted = parsePrompt(prompt);
    onSearch(prompt, extracted);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <Card className="glass-panel rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">AI Prompt Search</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Describe the type of creators you're looking for in natural language
      </p>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Example: UGC creators with less than 5-6k followers who talk about tech startups and business ventures, make video walkthroughs explaining features, with good storytelling skills..."
        className="min-h-[120px] resize-none input-glow"
      />

      {/* Example prompts */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lightbulb className="w-4 h-4" />
          <span>Try these examples:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example, i) => (
            <Badge 
              key={i} 
              variant="outline" 
              className="cursor-pointer hover:bg-secondary transition-colors text-xs py-1"
              onClick={() => handleExampleClick(example)}
            >
              {example.length > 50 ? example.slice(0, 50) + '...' : example}
            </Badge>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleSearch} 
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        size="lg"
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4 mr-2" />
        )}
        Search with AI
      </Button>
    </Card>
  );
}
