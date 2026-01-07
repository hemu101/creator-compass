import { Creator } from "@/types/creator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Image as ImageIcon, 
  ExternalLink, 
  CheckCircle2, 
  Briefcase,
  TrendingUp,
  Hash,
  AtSign
} from "lucide-react";

interface CreatorCardProps {
  creator: Creator;
  onSelect?: (creator: Creator) => void;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function CreatorCard({ creator, onSelect }: CreatorCardProps) {
  const hashtags = creator.bio_hashtags ? creator.bio_hashtags.split(',').filter(Boolean) : [];
  const mentions = creator.bio_mentions ? creator.bio_mentions.split(',').filter(Boolean) : [];

  return (
    <Card className="glass-panel rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] animate-slide-up">
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16 ring-2 ring-border">
          <AvatarImage src={creator.profile_pic_url} alt={creator.full_name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {creator.full_name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg truncate">{creator.full_name}</h3>
            {creator.is_verified && (
              <CheckCircle2 className="w-4 h-4 text-info flex-shrink-0" />
            )}
            {creator.is_business && (
              <Briefcase className="w-4 h-4 text-accent flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{creator.username}</p>
          
          {creator.category && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {creator.category}
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="flex-shrink-0"
          onClick={() => window.open(creator.profile_url, '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{creator.bio}</p>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-medium">{formatNumber(creator.follower_count)}</span>
          <span className="text-muted-foreground">followers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <UserPlus className="w-4 h-4 text-muted-foreground" />
          <span>{formatNumber(creator.following_count)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <span>{formatNumber(creator.media_count)}</span>
        </div>
      </div>

      {/* Engagement Rate */}
      <div className="mt-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-success" />
        <span className="text-sm font-medium text-success">{creator.engagement_rate.toFixed(1)}%</span>
        <span className="text-xs text-muted-foreground">engagement rate</span>
      </div>

      {/* Hashtags & Mentions */}
      <div className="mt-4 space-y-2">
        {hashtags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Hash className="w-3 h-3 text-accent" />
            {hashtags.slice(0, 4).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs py-0">
                {tag}
              </Badge>
            ))}
            {hashtags.length > 4 && (
              <span className="text-xs text-muted-foreground">+{hashtags.length - 4} more</span>
            )}
          </div>
        )}
        {mentions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <AtSign className="w-3 h-3 text-info" />
            {mentions.slice(0, 3).map(mention => (
              <Badge key={mention} variant="outline" className="text-xs py-0">
                {mention}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1"
          onClick={() => onSelect?.(creator)}
        >
          Select Creator
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(creator.profile_url, '_blank')}
        >
          View Profile
        </Button>
      </div>
    </Card>
  );
}
