import { format, differenceInDays } from 'date-fns';
import type { 
  AnalyticsData, 
  KPIMetrics, 
  TrendData, 
  PerformanceInsight,
  ChartDataPoint,
  ComparisonPeriod 
} from '@/types';

/**
 * KPI指標を計算
 */
export function calculateKPIMetrics(data: AnalyticsData): KPIMetrics {
  const { engagement, revenue, activity, viewer } = data;

  // 基本集計
  const totalDiamonds = revenue.reduce((sum, item) => sum + item.diamonds, 0);
  const totalLikes = engagement.reduce((sum, item) => sum + item.likes, 0);
  const totalFollowers = engagement.reduce((sum, item) => sum + item.newFollowers, 0);
  const totalViews = viewer.reduce((sum, item) => sum + item.viewCount, 0);
  
  // 新規追加項目の集計
  const totalGiftGivers = engagement.reduce((sum, item) => sum + (item.giftGivers || 0), 0);
  const totalCommenters = engagement.reduce((sum, item) => sum + (item.commenters || 0), 0);
  const totalShares = engagement.reduce((sum, item) => sum + (item.shares || 0), 0);
  const totalLiveCount = activity.reduce((sum, item) => sum + item.liveCount, 0);
  const totalUniqueViewers = viewer.reduce((sum, item) => sum + item.uniqueViewers, 0);
  
  // アクティブ日数（配信があった日）
  const activeDays = activity.filter(item => item.liveCount > 0).length;
  
  // 総配信時間（秒）
  const totalLiveTime = activity.reduce((sum, item) => sum + item.liveTime, 0);
  
  // 平均値の計算
  const avgViewTime = viewer.length > 0 ? 
    viewer.reduce((sum, item) => sum + item.avgViewTime, 0) / viewer.length : 0;
  
  const avgConcurrentViewers = viewer.length > 0 ? 
    viewer.reduce((sum, item) => sum + item.avgConcurrent, 0) / viewer.length : 0;
  
  const avgLiveTimePerStream = totalLiveCount > 0 ? totalLiveTime / totalLiveCount : 0;
  
  // エンゲージメント率の計算
  const totalEngagements = engagement.reduce((sum, item) => 
    sum + item.likes + (item.commenters || 0) + (item.giftGivers || 0) + (item.shares || 0), 0);
  const avgEngagementRate = totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0;
  
  // 配信あたりの平均収益
  const avgRevenuePerStream = activeDays > 0 ? totalDiamonds / activeDays : 0;
  
  // 配信あたりの平均視聴者数
  const avgViewersPerStream = activeDays > 0 ? totalViews / activeDays : 0;
  
  // 最高同時視聴者数
  const peakConcurrentViewers = Math.max(...viewer.map(item => item.maxConcurrent), 0);

  return {
    totalDiamonds,
    totalLikes,
    totalFollowers,
    totalViews,
    activeDays,
    totalLiveTime,
    avgEngagementRate,
    avgRevenuePerStream,
    avgViewersPerStream,
    peakConcurrentViewers,
    // 新規追加項目
    totalGiftGivers,
    totalCommenters,
    totalShares,
    totalLiveCount,
    totalUniqueViewers,
    avgViewTime,
    avgConcurrentViewers,
    avgLiveTimePerStream,
  };
}

/**
 * トレンド分析を計算
 */
export function calculateTrends(data: AnalyticsData): TrendData[] {
  const trends: TrendData[] = [];
  
  // 各指標のトレンドを計算
  const metrics = [
    { key: 'diamonds', data: data.revenue.map(item => item.diamonds), label: 'ダイヤモンド' },
    { key: 'likes', data: data.engagement.map(item => item.likes), label: 'いいね数' },
    { key: 'followers', data: data.engagement.map(item => item.newFollowers), label: '新規フォロワー' },
    { key: 'views', data: data.viewer.map(item => item.viewCount), label: '視聴数' },
  ];

  for (const metric of metrics) {
    const trend = calculateTrendDirection(metric.data);
    trends.push({
      metric: metric.label,
      direction: trend.direction,
      percentage: trend.percentage,
      period: '期間全体',
    });
  }

  return trends;
}

/**
 * トレンド方向を計算
 */
function calculateTrendDirection(values: number[]): { direction: 'up' | 'down' | 'stable'; percentage: number } {
  if (values.length < 2) return { direction: 'stable', percentage: 0 };
  
  const midPoint = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, midPoint);
  const secondHalf = values.slice(midPoint);
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  if (firstAvg === 0) return { direction: 'stable', percentage: 0 };
  
  const changePercentage = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  let direction: 'up' | 'down' | 'stable';
  if (changePercentage > 5) direction = 'up';
  else if (changePercentage < -5) direction = 'down';
  else direction = 'stable';
  
  return {
    direction,
    percentage: Math.abs(changePercentage)
  };
}

/**
 * パフォーマンス洞察を生成
 */
export function generateInsights(_data: AnalyticsData, kpis: KPIMetrics): PerformanceInsight[] {
  const insights: PerformanceInsight[] = [];

  // エンゲージメント率の分析
  if (kpis.avgEngagementRate > 10) {
    insights.push({
      type: 'success',
      title: '高いエンゲージメント率',
      description: `平均エンゲージメント率が${kpis.avgEngagementRate.toFixed(1)}%と優秀です。`,
      metric: 'engagement',
      value: kpis.avgEngagementRate,
      recommendation: '現在の配信スタイルを継続し、さらなる向上を目指しましょう。'
    });
  } else if (kpis.avgEngagementRate < 3) {
    insights.push({
      type: 'warning',
      title: 'エンゲージメント率の改善が必要',
      description: `エンゲージメント率が${kpis.avgEngagementRate.toFixed(1)}%と低めです。`,
      metric: 'engagement',
      value: kpis.avgEngagementRate,
      recommendation: 'コメントへの積極的な返答や視聴者との交流を増やすことをお勧めします。'
    });
  }

  // 配信頻度の分析
  if (kpis.activeDays < 10) {
    insights.push({
      type: 'info',
      title: '配信頻度の向上機会',
      description: `月間${kpis.activeDays}日の配信でした。`,
      metric: 'frequency',
      value: kpis.activeDays,
      recommendation: '定期的な配信スケジュールを設定することで、視聴者の定着率向上が期待できます。'
    });
  }

  // 収益効率の分析
  if (kpis.avgRevenuePerStream > 10000) {
    insights.push({
      type: 'success',
      title: '高い収益効率',
      description: `配信あたり平均${Math.round(kpis.avgRevenuePerStream)}ダイヤモンドの収益です。`,
      metric: 'revenue',
      value: kpis.avgRevenuePerStream,
      recommendation: 'この調子で質の高いコンテンツを継続してください。'
    });
  }

  return insights;
}

/**
 * チャート用データを生成
 */
export function generateChartData(data: AnalyticsData, metric: string): ChartDataPoint[] {
  switch (metric) {
    case 'diamonds':
      return data.revenue.map(item => ({
        date: item.dateString,
        value: item.diamonds,
        label: `${item.diamonds}ダイヤモンド`
      }));
    
    case 'likes':
      return data.engagement.map(item => ({
        date: item.dateString,
        value: item.likes,
        label: `${item.likes}いいね`
      }));
    
    case 'followers':
      return data.engagement.map(item => ({
        date: item.dateString,
        value: item.newFollowers,
        label: `${item.newFollowers}新規フォロワー`
      }));
    
    case 'views':
      return data.viewer.map(item => ({
        date: item.dateString,
        value: item.viewCount,
        label: `${item.viewCount}視聴数`
      }));
    
    case 'liveTime':
      return data.activity.map(item => ({
        date: item.dateString,
        value: Math.round(item.liveTime / 3600), // 時間に変換
        label: `${Math.round(item.liveTime / 3600)}時間`
      }));
    
    case 'concurrent':
      return data.viewer.map(item => ({
        date: item.dateString,
        value: item.maxConcurrent,
        label: `最高${item.maxConcurrent}人同時視聴`
      }));
    
    default:
      return [];
  }
}

/**
 * 期間比較データを生成
 */
export function generateComparisonData(data: AnalyticsData, periods: number = 2): ComparisonPeriod[] {
  const allDates = [
    ...data.engagement.map(item => item.date),
    ...data.revenue.map(item => item.date),
    ...data.activity.map(item => item.date),
    ...data.viewer.map(item => item.date),
  ].sort((a, b) => a.getTime() - b.getTime());

  if (allDates.length === 0) return [];

  const startDate = allDates[0];
  const endDate = allDates[allDates.length - 1];
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const periodDays = Math.floor(totalDays / periods);

  const comparisonPeriods: ComparisonPeriod[] = [];

  for (let i = 0; i < periods; i++) {
    const periodStart = new Date(startDate.getTime() + (i * periodDays * 24 * 60 * 60 * 1000));
    const periodEnd = new Date(startDate.getTime() + ((i + 1) * periodDays * 24 * 60 * 60 * 1000) - 1);
    
    // 期間内のデータをフィルタリング
    const periodEngagement = data.engagement.filter(item => 
      item.date >= periodStart && item.date <= periodEnd
    );
    const periodRevenue = data.revenue.filter(item => 
      item.date >= periodStart && item.date <= periodEnd
    );
    const periodActivity = data.activity.filter(item => 
      item.date >= periodStart && item.date <= periodEnd
    );
    const periodViewer = data.viewer.filter(item => 
      item.date >= periodStart && item.date <= periodEnd
    );

    const periodData = {
      engagement: periodEngagement,
      revenue: periodRevenue,
      activity: periodActivity,
      viewer: periodViewer,
    };

    const periodKPIs = calculateKPIMetrics(periodData);

    comparisonPeriods.push({
      label: `期間${i + 1} (${format(periodStart, 'MM/dd')} - ${format(periodEnd, 'MM/dd')})`,
      startDate: periodStart,
      endDate: periodEnd,
      data: periodKPIs,
    });
  }

  return comparisonPeriods;
}

/**
 * データを日付でソート
 */
export function sortDataByDate<T extends { date: Date }>(data: T[]): T[] {
  return [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * データの統計情報を計算
 */
export function calculateStatistics(values: number[]): {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
} {
  if (values.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return { mean, median, min, max, stdDev };
}

/**
 * 成長率を計算
 */
export function calculateGrowthRate(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * 移動平均を計算
 */
export function calculateMovingAverage(values: number[], window: number): number[] {
  if (values.length < window) return values;
  
  const result: number[] = [];
  for (let i = 0; i <= values.length - window; i++) {
    const windowValues = values.slice(i, i + window);
    const average = windowValues.reduce((sum, val) => sum + val, 0) / window;
    result.push(average);
  }
  
  return result;
}

/**
 * 相関係数を計算
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * 秒を時間:分:秒の形式でフォーマット
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return '0:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 秒を時間:分の形式でフォーマット（簡略版）
 */
export function formatDurationShort(seconds: number): string {
  if (seconds === 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * 秒を分単位でフォーマット
 */
export function formatMinutes(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (minutes === 0) return `${remainingSeconds}秒`;
  if (remainingSeconds === 0) return `${minutes}分`;
  
  return `${minutes}分${remainingSeconds}秒`;
}