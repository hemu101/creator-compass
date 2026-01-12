import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsRepository } from "@/adapters/repositories/SupabaseCreatorRepository";
import { ScrapingJob } from "@/domain/entities/Creator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  Users, 
  CheckCircle, 
  Briefcase, 
  TrendingUp,
  Activity,
  Clock
} from "lucide-react";

const COLORS = [
  'hsl(262, 83%, 58%)',
  'hsl(172, 66%, 50%)',
  'hsl(38, 92%, 50%)',
  'hsl(199, 89%, 48%)',
  'hsl(142, 71%, 45%)',
  'hsl(0, 84%, 60%)',
  'hsl(280, 80%, 65%)',
  'hsl(190, 70%, 55%)'
];

interface CreatorStats {
  totalCreators: number;
  verifiedCount: number;
  businessCount: number;
  avgFollowers: number;
  platformDistribution: Record<string, number>;
  nicheDistribution: Record<string, number>;
}

interface EngagementTrend {
  date: string;
  avgEngagement: number;
  totalCreators: number;
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [trends, setTrends] = useState<EngagementTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, jobsData, trendsData] = await Promise.all([
        analyticsRepository.getCreatorStats(),
        analyticsRepository.getScrapingHistory(),
        analyticsRepository.getEngagementTrends()
      ]);
      setStats(statsData);
      setJobs(jobsData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const platformData = stats ? Object.entries(stats.platformDistribution).map(([name, value]) => ({
    name,
    value
  })) : [];

  const nicheData = stats ? Object.entries(stats.nicheDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.slice(0, 15) + '...' : name,
      fullName: name,
      value
    })) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-panel">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats?.totalCreators || 0)}</p>
                <p className="text-sm text-muted-foreground">Total Creators</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats?.verifiedCount || 0)}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[hsl(var(--warning))]/10">
                <Briefcase className="h-6 w-6 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats?.businessCount || 0)}</p>
                <p className="text-sm text-muted-foreground">Business</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[hsl(var(--info))]/10">
                <TrendingUp className="h-6 w-6 text-[hsl(var(--info))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats?.avgFollowers || 0)}</p>
                <p className="text-sm text-muted-foreground">Avg Followers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Platform Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {platformData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No platform data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Niche Distribution */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Top Niches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nicheData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={nicheData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100} 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                    formatter={(value, name, props) => [value, props.payload.fullName]}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No niche data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Engagement Trends (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avgEngagement" 
                  name="Avg Engagement %"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="totalCreators" 
                  name="Creators Added"
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scraping Jobs */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Scraping Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.slice(0, 10).map(job => (
                <div 
                  key={job.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}
                    >
                      {job.status}
                    </Badge>
                    <span className="font-medium">{job.searchQuery}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Found: {job.totalFound}</span>
                    <span>Saved: {job.totalSaved}</span>
                    <span>{new Date(job.startedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              No scraping history available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
