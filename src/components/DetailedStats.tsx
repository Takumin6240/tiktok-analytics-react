import React from 'react';
import { Calendar, Clock, Users, TrendingUp, DollarSign, Heart, Eye, UserPlus } from 'lucide-react';
import type { AnalyticsData, KPIMetrics } from '@/types';

interface DetailedStatsProps {
  data: AnalyticsData;
  kpis: KPIMetrics;
  className?: string;
}

const DetailedStats: React.FC<DetailedStatsProps> = ({ data, kpis, className = '' }) => {
  // 追加の統計計算
  const totalDays = data.engagement.length;
  const inactiveDays = totalDays - kpis.activeDays;
  const avgDiamondsPerDay = kpis.activeDays > 0 ? kpis.totalDiamonds / kpis.activeDays : 0;
  const avgLikesPerDay = kpis.activeDays > 0 ? kpis.totalLikes / kpis.activeDays : 0;
  const avgViewsPerDay = kpis.activeDays > 0 ? kpis.totalViews / kpis.activeDays : 0;
  const avgLiveTimePerDay = kpis.activeDays > 0 ? (kpis.totalLiveTime / 3600) / kpis.activeDays : 0;
  const revenuePerHour = kpis.totalLiveTime > 0 ? kpis.totalDiamonds / (kpis.totalLiveTime / 3600) : 0;
  const avgFollowersPerDay = kpis.activeDays > 0 ? kpis.totalFollowers / kpis.activeDays : 0;
  
  // 配信頻度
  const weeklyFrequency = (kpis.activeDays / (totalDays / 7));
  const monthlyFrequency = (kpis.activeDays / (totalDays / 30));
  
  // 成長率計算（前半・後半比較）
  const midPoint = Math.floor(data.engagement.length / 2);
  const firstHalf = data.engagement.slice(0, midPoint);
  const secondHalf = data.engagement.slice(midPoint);
  const firstHalfRevenue = data.revenue.slice(0, midPoint);
  const secondHalfRevenue = data.revenue.slice(midPoint);
  const firstHalfViewer = data.viewer.slice(0, midPoint);
  const secondHalfViewer = data.viewer.slice(midPoint);
  
  const likesGrowth = firstHalf.reduce((sum, item) => sum + item.likes, 0) > 0 
    ? ((secondHalf.reduce((sum, item) => sum + item.likes, 0) - firstHalf.reduce((sum, item) => sum + item.likes, 0)) / firstHalf.reduce((sum, item) => sum + item.likes, 0)) * 100
    : 0;
  
  const diamondsGrowth = firstHalfRevenue.reduce((sum, item) => sum + item.diamonds, 0) > 0
    ? ((secondHalfRevenue.reduce((sum, item) => sum + item.diamonds, 0) - firstHalfRevenue.reduce((sum, item) => sum + item.diamonds, 0)) / firstHalfRevenue.reduce((sum, item) => sum + item.diamonds, 0)) * 100
    : 0;
  
  const viewsGrowth = firstHalfViewer.reduce((sum, item) => sum + item.viewCount, 0) > 0
    ? ((secondHalfViewer.reduce((sum, item) => sum + item.viewCount, 0) - firstHalfViewer.reduce((sum, item) => sum + item.viewCount, 0)) / firstHalfViewer.reduce((sum, item) => sum + item.viewCount, 0)) * 100
    : 0;

  // 追加統計の計算
  const avgGiftGiversPerDay = kpis.activeDays > 0 ? data.engagement.reduce((sum, item) => sum + (item.giftGivers || 0), 0) / kpis.activeDays : 0;
  const avgCommentersPerDay = kpis.activeDays > 0 ? data.engagement.reduce((sum, item) => sum + (item.commenters || 0), 0) / kpis.activeDays : 0;
  const avgSharesPerDay = kpis.activeDays > 0 ? data.engagement.reduce((sum, item) => sum + (item.shares || 0), 0) / kpis.activeDays : 0;
  const avgUniqueViewersPerDay = data.viewer.length > 0 ? data.viewer.reduce((sum, item) => sum + (item.uniqueViewers || 0), 0) / data.viewer.length : 0;
  const avgAvgViewTime = data.viewer.length > 0 ? data.viewer.reduce((sum, item) => sum + (item.avgViewTime || 0), 0) / data.viewer.length : 0;
  const avgAvgConcurrent = data.viewer.length > 0 ? data.viewer.reduce((sum, item) => sum + (item.avgConcurrent || 0), 0) / data.viewer.length : 0;

  const StatCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    color = 'blue',
    description,
    growth 
  }: {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ComponentType<any>;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'pink';
    description?: string;
    growth?: number;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      teal: 'bg-teal-50 text-teal-600 border-teal-200',
      pink: 'bg-pink-50 text-pink-600 border-pink-200',
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          {growth !== undefined && (
            <div className={`flex items-center space-x-1 text-sm ${
              growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              <TrendingUp className={`w-4 h-4 ${growth < 0 ? 'rotate-180' : ''}`} />
              <span>{growth > 0 ? '+' : ''}{growth.toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-tiktok-primary/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-tiktok-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">詳細統計</h3>
            <p className="text-sm text-gray-500">包括的なパフォーマンス指標</p>
          </div>
        </div>

        {/* 基本統計 */}
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">基本統計</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="分析期間"
              value={totalDays}
              unit="日間"
              icon={Calendar}
              color="blue"
              description="データ収集期間"
            />
            <StatCard
              title="配信実施日"
              value={kpis.activeDays}
              unit="日"
              icon={Calendar}
              color="green"
              description={`${((kpis.activeDays / totalDays) * 100).toFixed(1)}% の稼働率`}
            />
            <StatCard
              title="配信休止日"
              value={inactiveDays}
              unit="日"
              icon={Calendar}
              color="orange"
              description={`${((inactiveDays / totalDays) * 100).toFixed(1)}% の休止率`}
            />
            <StatCard
              title="総配信時間"
              value={Math.round(kpis.totalLiveTime / 3600)}
              unit="時間"
              icon={Clock}
              color="purple"
              description="累計ライブ配信時間"
            />
          </div>
        </div>

        {/* 収益統計 */}
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">収益統計</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="日平均ダイヤモンド"
              value={Math.round(avgDiamondsPerDay)}
              icon={DollarSign}
              color="green"
              description="配信日あたりの平均収益"
              growth={diamondsGrowth}
            />
            <StatCard
              title="時間あたり収益"
              value={Math.round(revenuePerHour)}
              unit="ダイヤ/時"
              icon={DollarSign}
              color="teal"
              description="配信時間あたりの効率"
            />
            <StatCard
              title="1配信あたり収益"
              value={Math.round(kpis.avgRevenuePerStream)}
              unit="ダイヤ"
              icon={DollarSign}
              color="purple"
              description="配信セッションあたりの平均"
            />
            <StatCard
              title="収益日数"
              value={data.revenue.filter(r => r.diamonds > 0).length}
              unit="日"
              icon={DollarSign}
              color="orange"
              description="収益が発生した日数"
            />
          </div>
        </div>

        {/* エンゲージメント統計 */}
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">エンゲージメント統計</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="日平均ギフト贈呈者"
              value={Math.round(avgGiftGiversPerDay)}
              icon={UserPlus}
              color="teal"
              description="配信日あたりのギフト贈呈者"
            />
            <StatCard
              title="日平均コメント視聴者"
              value={Math.round(avgCommentersPerDay)}
              icon={Users}
              color="orange"
              description="配信日あたりのコメントした視聴者"
            />
            <StatCard
              title="日平均シェア"
              value={Math.round(avgSharesPerDay)}
              icon={TrendingUp}
              color="blue"
              description="配信日あたりのシェア数"
            />
            <StatCard
              title="日平均いいね"
              value={Math.round(avgLikesPerDay)}
              icon={Heart}
              color="red"
              description="配信日あたりの平均いいね"
              growth={likesGrowth}
            />
            <StatCard
              title="日平均フォロワー"
              value={avgFollowersPerDay.toFixed(1)}
              icon={UserPlus}
              color="blue"
              description="配信日あたりの新規フォロワー"
            />
            <StatCard
              title="エンゲージメント率"
              value={kpis.avgEngagementRate.toFixed(1)}
              unit="%"
              icon={TrendingUp}
              color="purple"
              description="視聴者のエンゲージメント度"
            />
            <StatCard
              title="いいね効率"
              value={kpis.totalLiveTime > 0 ? Math.round(kpis.totalLikes / (kpis.totalLiveTime / 3600)) : 0}
              unit="いいね/時"
              icon={Heart}
              color="pink"
              description="時間あたりのいいね数"
            />
          </div>
        </div>

        {/* 視聴者統計 */}
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">視聴者統計</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="日平均視聴数"
              value={Math.round(avgViewsPerDay)}
              icon={Eye}
              color="blue"
              description="配信日あたりの平均視聴数"
              growth={viewsGrowth}
            />
            <StatCard
              title="平均ユニーク視聴者"
              value={Math.round(avgUniqueViewersPerDay)}
              icon={Users}
              color="green"
              description="配信あたりのユニーク視聴者"
            />
            <StatCard
              title="平均同時視聴者"
              value={Math.round(avgAvgConcurrent)}
              icon={Users}
              color="purple"
              description="配信中の平均同時視聴者数"
            />
            <StatCard
              title="平均視聴時間"
              value={Math.round(avgAvgViewTime / 60)}
              unit="分"
              icon={Clock}
              color="orange"
              description="視聴者あたりの平均視聴時間"
            />
            <StatCard
              title="最高同時視聴者数"
              value={Math.max(...data.viewer.map(v => v.maxConcurrent || 0))}
              icon={Users}
              color="teal"
              description="期間中の最高同時視聴者数"
            />
          </div>
        </div>

        {/* 配信頻度統計 */}
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">配信頻度統計</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="週平均配信頻度"
              value={weeklyFrequency.toFixed(1)}
              unit="日/週"
              icon={Calendar}
              color="blue"
              description="週あたりの配信日数"
            />
            <StatCard
              title="月平均配信頻度"
              value={monthlyFrequency.toFixed(1)}
              unit="日/月"
              icon={Calendar}
              color="green"
              description="月あたりの配信日数"
            />
            <StatCard
              title="日平均配信時間"
              value={avgLiveTimePerDay.toFixed(1)}
              unit="時間/日"
              icon={Clock}
              color="purple"
              description="配信日あたりの平均時間"
            />
            <StatCard
              title="最長配信時間"
              value={Math.round(Math.max(...data.activity.map(a => a.liveTime)) / 3600)}
              unit="時間"
              icon={Clock}
              color="orange"
              description="単日の最長配信時間"
            />
          </div>
        </div>

        {/* 成長率統計 */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">成長率統計（前半 vs 後半）</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="いいね成長率"
              value={likesGrowth.toFixed(1)}
              unit="%"
              icon={Heart}
              color={likesGrowth > 0 ? 'green' : likesGrowth < 0 ? 'red' : 'blue'}
              description="期間後半の成長率"
            />
            <StatCard
              title="ダイヤモンド成長率"
              value={diamondsGrowth.toFixed(1)}
              unit="%"
              icon={DollarSign}
              color={diamondsGrowth > 0 ? 'green' : diamondsGrowth < 0 ? 'red' : 'blue'}
              description="期間後半の成長率"
            />
            <StatCard
              title="視聴数成長率"
              value={viewsGrowth.toFixed(1)}
              unit="%"
              icon={Eye}
              color={viewsGrowth > 0 ? 'green' : viewsGrowth < 0 ? 'red' : 'blue'}
              description="期間後半の成長率"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedStats;