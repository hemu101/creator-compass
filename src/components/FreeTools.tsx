import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Target,
  Users,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react";

export function FreeTools() {
  // Engagement Rate Calculator
  const [followers, setFollowers] = useState<number>(0);
  const [likes, setLikes] = useState<number>(0);
  const [comments, setComments] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [engagementRate, setEngagementRate] = useState<number | null>(null);

  // ROI Calculator
  const [campaignCost, setCampaignCost] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [roi, setRoi] = useState<number | null>(null);

  // CPM Calculator
  const [impressions, setImpressions] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [cpm, setCpm] = useState<number | null>(null);

  // Estimated Earnings
  const [creatorFollowers, setCreatorFollowers] = useState<number>(0);
  const [creatorER, setCreatorER] = useState<number>(0);
  const [estimatedEarnings, setEstimatedEarnings] = useState<{ min: number; max: number } | null>(null);

  const calculateEngagementRate = () => {
    if (followers > 0) {
      const totalEngagements = likes + comments + shares;
      const rate = (totalEngagements / followers) * 100;
      setEngagementRate(Number(rate.toFixed(2)));
    }
  };

  const calculateROI = () => {
    if (campaignCost > 0) {
      const roiValue = ((revenue - campaignCost) / campaignCost) * 100;
      setRoi(Number(roiValue.toFixed(2)));
    }
  };

  const calculateCPM = () => {
    if (impressions > 0) {
      const cpmValue = (cost / impressions) * 1000;
      setCpm(Number(cpmValue.toFixed(2)));
    }
  };

  const calculateEstimatedEarnings = () => {
    if (creatorFollowers > 0 && creatorER > 0) {
      // Base rate per 1000 followers, adjusted by engagement rate
      const baseRate = 10; // $10 per 1000 followers base
      const erMultiplier = Math.min(creatorER / 2, 3); // ER bonus capped at 3x
      
      const baseEarning = (creatorFollowers / 1000) * baseRate * erMultiplier;
      const minEarning = Math.round(baseEarning * 0.5);
      const maxEarning = Math.round(baseEarning * 2);
      
      setEstimatedEarnings({ min: minEarning, max: maxEarning });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num}`;
  };

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Free Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="engagement" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="engagement" className="text-xs px-2">
              <TrendingUp className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">ER</span>
            </TabsTrigger>
            <TabsTrigger value="roi" className="text-xs px-2">
              <Target className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">ROI</span>
            </TabsTrigger>
            <TabsTrigger value="cpm" className="text-xs px-2">
              <BarChart3 className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">CPM</span>
            </TabsTrigger>
            <TabsTrigger value="earnings" className="text-xs px-2">
              <DollarSign className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Earnings</span>
            </TabsTrigger>
          </TabsList>

          {/* Engagement Rate Calculator */}
          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Followers
                </Label>
                <Input
                  type="number"
                  value={followers || ""}
                  onChange={(e) => setFollowers(Number(e.target.value))}
                  placeholder="10000"
                  className="input-glow"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  Avg. Likes
                </Label>
                <Input
                  type="number"
                  value={likes || ""}
                  onChange={(e) => setLikes(Number(e.target.value))}
                  placeholder="500"
                  className="input-glow"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Avg. Comments
                </Label>
                <Input
                  type="number"
                  value={comments || ""}
                  onChange={(e) => setComments(Number(e.target.value))}
                  placeholder="50"
                  className="input-glow"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Share2 className="w-3 h-3" />
                  Avg. Shares
                </Label>
                <Input
                  type="number"
                  value={shares || ""}
                  onChange={(e) => setShares(Number(e.target.value))}
                  placeholder="10"
                  className="input-glow"
                />
              </div>
            </div>
            <Button onClick={calculateEngagementRate} className="w-full" size="sm">
              Calculate ER
            </Button>
            {engagementRate !== null && (
              <div className="p-3 rounded-lg bg-primary/10 text-center">
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold text-primary">{engagementRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {engagementRate < 1 ? "Low" : engagementRate < 3 ? "Average" : engagementRate < 6 ? "Good" : "Excellent"}
                </p>
              </div>
            )}
          </TabsContent>

          {/* ROI Calculator */}
          <TabsContent value="roi" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Campaign Cost ($)</Label>
                <Input
                  type="number"
                  value={campaignCost || ""}
                  onChange={(e) => setCampaignCost(Number(e.target.value))}
                  placeholder="1000"
                  className="input-glow"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Revenue Generated ($)</Label>
                <Input
                  type="number"
                  value={revenue || ""}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                  placeholder="2500"
                  className="input-glow"
                />
              </div>
            </div>
            <Button onClick={calculateROI} className="w-full" size="sm">
              Calculate ROI
            </Button>
            {roi !== null && (
              <div className={`p-3 rounded-lg text-center ${roi >= 0 ? 'bg-[hsl(var(--success)/0.1)]' : 'bg-destructive/10'}`}>
                <p className="text-sm text-muted-foreground">Return on Investment</p>
                <p className={`text-2xl font-bold ${roi >= 0 ? 'text-[hsl(var(--success))]' : 'text-destructive'}`}>
                  {roi >= 0 ? '+' : ''}{roi}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Net: ${(revenue - campaignCost).toLocaleString()}
                </p>
              </div>
            )}
          </TabsContent>

          {/* CPM Calculator */}
          <TabsContent value="cpm" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Total Cost ($)</Label>
                <Input
                  type="number"
                  value={cost || ""}
                  onChange={(e) => setCost(Number(e.target.value))}
                  placeholder="500"
                  className="input-glow"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Impressions</Label>
                <Input
                  type="number"
                  value={impressions || ""}
                  onChange={(e) => setImpressions(Number(e.target.value))}
                  placeholder="100000"
                  className="input-glow"
                />
              </div>
            </div>
            <Button onClick={calculateCPM} className="w-full" size="sm">
              Calculate CPM
            </Button>
            {cpm !== null && (
              <div className="p-3 rounded-lg bg-[hsl(var(--info)/0.1)] text-center">
                <p className="text-sm text-muted-foreground">Cost Per 1000 Impressions</p>
                <p className="text-2xl font-bold text-[hsl(var(--info))]">${cpm}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cpm < 5 ? "Excellent" : cpm < 10 ? "Good" : cpm < 20 ? "Average" : "High"}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Estimated Earnings */}
          <TabsContent value="earnings" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Follower Count</Label>
                <Input
                  type="number"
                  value={creatorFollowers || ""}
                  onChange={(e) => setCreatorFollowers(Number(e.target.value))}
                  placeholder="50000"
                  className="input-glow"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Engagement Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={creatorER || ""}
                  onChange={(e) => setCreatorER(Number(e.target.value))}
                  placeholder="3.5"
                  className="input-glow"
                />
              </div>
            </div>
            <Button onClick={calculateEstimatedEarnings} className="w-full" size="sm">
              Estimate Earnings
            </Button>
            {estimatedEarnings !== null && (
              <div className="p-3 rounded-lg bg-[hsl(var(--warning)/0.1)] text-center">
                <p className="text-sm text-muted-foreground">Est. Earnings Per Post</p>
                <p className="text-2xl font-bold text-[hsl(var(--warning))]">
                  {formatNumber(estimatedEarnings.min)} - {formatNumber(estimatedEarnings.max)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on industry averages
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
