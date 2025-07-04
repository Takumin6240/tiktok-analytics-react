import React, { useState, useMemo } from 'react';
import { 
  Diamond, 
  Heart, 
  Users, 
  Eye, 
  TrendingUp, 
  Download,
  Calendar,
  Activity,
  Clock
} from 'lucide-react';
import KPICard from './KPICard';
import AnalyticsChart from './AnalyticsChart';
import DataTable from './DataTable';
import DetailedStats from './DetailedStats';
import { calculateKPIMetrics, generateChartData, generateInsights } from '@/utils/analytics';
import { exportEnhancedPDF } from '@/utils/enhancedPdfExport';
import type { AnalyticsData, KPIMetrics, PerformanceInsight } from '@/types';

interface DashboardProps {
  data: AnalyticsData;
  isLoading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, isLoading = false }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('diamonds');


  // KPI計算
  const kpis: KPIMetrics = useMemo(() => {
    if (isLoading) return {} as KPIMetrics;
    return calculateKPIMetrics(data);
  }, [data, isLoading]);

  // パフォーマンス洞察
  const insights: PerformanceInsight[] = useMemo(() => {
    if (isLoading) return [];
    return generateInsights(data, kpis);
  }, [data, kpis, isLoading]);

  // チャートデータ
  const chartData = useMemo(() => {
    if (isLoading) return [];
    return generateChartData(data, selectedMetric);
  }, [data, selectedMetric, isLoading]);

  // PDF エクスポート
  const handleExportPDF = async () => {
    try {
      await exportEnhancedPDF(data, kpis, insights, {
        format: 'pdf',
        includeCharts: false,
        sections: {
          summary: true,
          engagement: true,
          revenue: true,
          activity: true,
          viewer: true,
          trends: true,
        }
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDFエクスポートに失敗しました。');
    }
  };

  // CSV エクスポート
  const handleExportCSV = () => {
    // CSV エクスポート実装
    const csvData = data.engagement.map((item, index) => ({
      date: item.dateString,
      diamonds: data.revenue[index]?.diamonds || 0,
      likes: item.likes,
      followers: item.newFollowers,
      views: data.viewer[index]?.viewCount || 0,
      liveTime: data.activity[index]?.liveTime || 0,
      liveCount: data.activity[index]?.liveCount || 0,
    }));

    const csvContent = [
      ['日付', 'ダイヤモンド', 'いいね', '新規フォロワー', '視聴数', '配信時間', '配信回数'],
      ...csvData.map(row => [
        row.date,
        row.diamonds,
        row.likes,
        row.followers,
        row.views,
        Math.round(row.liveTime / 3600), // 時間に変換
        row.liveCount,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tiktok-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* ローディング状態のKPIカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <KPICard
              key={index}
              title=""
              value=""
              icon={Diamond}
              color="primary"
              isLoading={true}
            />
          ))}
        </div>

        {/* ローディング状態のチャート */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TikTok ライブ分析</h1>
          <p className="text-gray-600 mt-1">
            総データ期間: {data.engagement.length} 日間
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-tiktok-primary text-white rounded-lg hover:bg-tiktok-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>PDF レポート</span>
          </button>
        </div>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="総ダイヤモンド"
          value={kpis.totalDiamonds}
          icon={Diamond}
          color="primary"
          subtitle="収益"
        />
        <KPICard
          title="総いいね"
          value={kpis.totalLikes}
          icon={Heart}
          color="secondary"
          subtitle="エンゲージメント"
        />
        <KPICard
          title="新規フォロワー"
          value={kpis.totalFollowers}
          icon={Users}
          color="success"
          subtitle="成長"
        />
        <KPICard
          title="総視聴数"
          value={kpis.totalViews}
          icon={Eye}
          color="info"
          subtitle="リーチ"
        />
        <KPICard
          title="アクティブ日数"
          value={kpis.activeDays}
          icon={Calendar}
          color="warning"
          subtitle="配信頻度"
        />
        <KPICard
          title="総配信時間"
          value={`${Math.floor(kpis.totalLiveTime / 3600)}時間`}
          icon={Clock}
          color="info"
          subtitle="配信量"
        />
        <KPICard
          title="エンゲージメント率"
          value={`${kpis.avgEngagementRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="success"
          subtitle="平均"
        />
        <KPICard
          title="最高同時視聴者数"
          value={kpis.peakConcurrentViewers}
          icon={Activity}
          color="primary"
          subtitle="ピーク"
        />
      </div>

      {/* 追加のKPI カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="ギフト贈呈者"
          value={kpis.totalGiftGivers}
          icon={Diamond}
          color="primary"
          subtitle="総計"
        />
        <KPICard
          title="コメント者"
          value={kpis.totalCommenters}
          icon={Users}
          color="secondary"
          subtitle="総計"
        />
        <KPICard
          title="シェア数"
          value={kpis.totalShares}
          icon={TrendingUp}
          color="success"
          subtitle="総計"
        />
        <KPICard
          title="配信回数"
          value={kpis.totalLiveCount}
          icon={Activity}
          color="info"
          subtitle="総計"
        />
        <KPICard
          title="ユニーク視聴者"
          value={kpis.totalUniqueViewers}
          icon={Eye}
          color="warning"
          subtitle="総計"
        />
        <KPICard
          title="平均視聴時間"
          value={`${Math.floor(kpis.avgViewTime / 60)}分`}
          icon={Clock}
          color="info"
          subtitle="平均"
        />
        <KPICard
          title="平均同時視聴者"
          value={Math.round(kpis.avgConcurrentViewers)}
          icon={Users}
          color="success"
          subtitle="平均"
        />
        <KPICard
          title="配信あたり時間"
          value={`${Math.floor(kpis.avgLiveTimePerStream / 3600)}:${Math.floor((kpis.avgLiveTimePerStream % 3600) / 60).toString().padStart(2, '0')}`}
          icon={Clock}
          color="primary"
          subtitle="平均"
        />
      </div>

      {/* パフォーマンス洞察 */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">パフォーマンス洞察</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'success' ? 'bg-green-50 border-green-400' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  insight.type === 'error' ? 'bg-red-50 border-red-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                {insight.recommendation && (
                  <p className="text-sm text-gray-500 italic">{insight.recommendation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* チャート選択 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">トレンド分析</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-transparent"
            >
              <option value="diamonds">ダイヤモンド</option>
              <option value="likes">いいね</option>
              <option value="followers">新規フォロワー</option>
              <option value="views">視聴数</option>
              <option value="liveTime">配信時間</option>
              <option value="concurrent">同時視聴者</option>
            </select>
          </div>
        </div>

        <AnalyticsChart
          title={`${selectedMetric === 'diamonds' ? 'ダイヤモンド' : 
                   selectedMetric === 'likes' ? 'いいね' :
                   selectedMetric === 'followers' ? '新規フォロワー' :
                   selectedMetric === 'views' ? '視聴数' :
                   selectedMetric === 'liveTime' ? '配信時間' :
                   '同時視聴者'} の推移`}
          data={chartData}
          type={selectedMetric === 'diamonds' ? 'bar' : 'line'}
          color={selectedMetric === 'diamonds' ? '#ff0050' : '#00f2ea'}
          height={400}
          data-chart="main-chart"
          data-chart-title={`${selectedMetric} trend`}
        />
      </div>

      {/* 詳細チャート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="エンゲージメント推移"
          data={generateChartData(data, 'likes')}
          type="area"
          color="#ff0050"
          height={300}
          data-chart="engagement-chart"
          data-chart-title="Engagement Trend"
        />
        <AnalyticsChart
          title="視聴者数推移"
          data={generateChartData(data, 'views')}
          type="line"
          color="#00f2ea"
          height={300}
          data-chart="viewer-chart"
          data-chart-title="Viewer Trend"
        />
      </div>

      {/* データテーブル */}
      <DataTable 
        data={data} 
        onExport={handleExportCSV}
      />

      {/* 詳細統計 */}
      <DetailedStats 
        data={data}
        kpis={kpis}
        className="mt-6"
      />
    </div>
  );
};

export default Dashboard;