// TikTok Analytics Types

export interface EngagementData {
  date: Date;
  dateString: string;
  giftGivers: number;        // ギフト贈呈者
  newFollowers: number;      // 新規フォロワー
  commenters: number;        // コメントした視聴者
  likes: number;             // いいね
  shares: number;            // シェア
}

export interface RevenueData {
  date: Date;
  dateString: string;
  diamonds: number;          // ダイヤモンド
}

export interface ActivityData {
  date: Date;
  dateString: string;
  liveTime: number;          // LIVE時間（秒）
  liveCount: number;         // LIVEの合計数
}

export interface ViewerData {
  date: Date;
  dateString: string;
  viewCount: number;         // 視聴数
  uniqueViewers: number;     // ユニーク視聴者数
  avgViewTime: number;       // 平均視聴時間（秒）
  maxConcurrent: number;     // 最高同時視聴者数
  avgConcurrent: number;     // 平均同時視聴者数
}

export interface AnalyticsData {
  engagement: EngagementData[];
  revenue: RevenueData[];
  activity: ActivityData[];
  viewer: ViewerData[];
}

export interface KPIMetrics {
  totalDiamonds: number;
  totalLikes: number;
  totalFollowers: number;
  totalViews: number;
  activeDays: number;
  totalLiveTime: number;
  avgEngagementRate: number;
  avgRevenuePerStream: number;
  avgViewersPerStream: number;
  peakConcurrentViewers: number;
  totalGiftGivers: number;        // 総ギフト贈呈者数
  totalCommenters: number;        // 総コメント者数
  totalShares: number;            // 総シェア数
  totalLiveCount: number;         // 総配信回数
  totalUniqueViewers: number;     // 総ユニーク視聴者数
  avgViewTime: number;            // 平均視聴時間（秒）
  avgConcurrentViewers: number;   // 平均同時視聴者数
  avgLiveTimePerStream: number;   // 配信あたりの平均配信時間（秒）
}

export interface TrendData {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
}

export interface FileUploadResult {
  file: File;
  type: CSVFileType;
  data: any[];
  error?: string;
}

export type CSVFileType = 'engagement' | 'revenue' | 'activity' | 'viewer' | 'unknown';

export interface CSVColumnMapping {
  engagement: {
    date: string;
    giftGivers: string;
    newFollowers: string;
    commenters: string;
    likes: string;
    shares: string;
  };
  revenue: {
    date: string;
    diamonds: string;
  };
  activity: {
    date: string;
    liveTime: string;
    liveCount: string;
  };
  viewer: {
    date: string;
    viewCount: string;
    uniqueViewers: string;
    avgViewTime: string;
    maxConcurrent: string;
    avgConcurrent: string;
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ComparisonPeriod {
  label: string;
  startDate: Date;
  endDate: Date;
  data: Partial<KPIMetrics>;
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  includeCharts: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sections: {
    summary: boolean;
    engagement: boolean;
    revenue: boolean;
    activity: boolean;
    viewer: boolean;
    trends: boolean;
  };
}

export interface PerformanceInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  metric?: string;
  value?: number;
  recommendation?: string;
}