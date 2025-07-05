import React, { useState, useMemo } from 'react';
import { 
  Diamond, 
  Heart, 
  Users, 
  Eye, 
  TrendingUp, 
  Calendar,
  Activity,
  Clock,
  Download,
  Camera
} from 'lucide-react';
import KPICard from './KPICard';
import AnalyticsChart from './AnalyticsChart';
import DataTable from './DataTable';
import DetailedStats from './DetailedStats';
import { calculateKPIMetrics, generateChartData, generateInsights } from '@/utils/analytics';
import { exportEnhancedExcel } from '@/utils/enhancedExcelExport';
import ScreenshotExportModal from './ScreenshotExportModal';
import type { AnalyticsData, KPIMetrics, PerformanceInsight } from '@/types';

interface DashboardProps {
  data: AnalyticsData;
  isLoading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, isLoading = false }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('diamonds');
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);


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



  // スクリーンショットPDFエクスポート
  const handleScreenshotPdf = () => {
    setShowScreenshotModal(true);
  };

  // XLSX エクスポート
  const handleExportXLSX = async () => {
    try {
      const result = await exportEnhancedExcel(data, {
        includeCharts: true,
        includeAnalysis: true
      });
      
      if (result.success) {
        // 成功時のメッセージ
        alert('エクスポートが完了しました！ダウンロードフォルダをご確認ください。');
      } else {
        // エラー時のメッセージ
        alert(`エクスポートエラー: ${result.error || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('Excel export error:', error);
      alert('エクスポートに失敗しました。');
    }
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
            onClick={handleScreenshotPdf}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold shadow-lg"
          >
            <Camera className="w-5 h-5" />
            <span>スクリーンショットPDF</span>
          </button>
          <button
            onClick={handleExportXLSX}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span>xlsx出力</span>
          </button>
        </div>
      </div>

      {/* KPI カード */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">KPI指標</h2>
        </div>
        <div className="space-y-6" data-kpi-section="true">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="総ダイヤモンド"
          value={kpis.totalDiamonds}
          icon={Diamond}
          color="primary"
          subtitle="収益"
          data-kpi-card="diamonds"
        />
        <KPICard
          title="総いいね"
          value={kpis.totalLikes}
          icon={Heart}
          color="secondary"
          subtitle="エンゲージメント"
          data-kpi-card="likes"
        />
        <KPICard
          title="新規フォロワー"
          value={kpis.totalFollowers}
          icon={Users}
          color="success"
          subtitle="成長"
          data-kpi-card="followers"
        />
        <KPICard
          title="総視聴数"
          value={kpis.totalViews}
          icon={Eye}
          color="info"
          subtitle="リーチ"
          data-kpi-card="views"
        />
        <KPICard
          title="アクティブ日数"
          value={kpis.activeDays}
          icon={Calendar}
          color="warning"
          subtitle="配信頻度"
          data-kpi-card="active-days"
        />
        <KPICard
          title="総配信時間"
          value={`${Math.floor(kpis.totalLiveTime / 3600)}時間`}
          icon={Clock}
          color="info"
          subtitle="配信量"
          data-kpi-card="live-time"
        />
        <KPICard
          title="エンゲージメント率"
          value={`${kpis.avgEngagementRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="success"
          subtitle="平均"
          data-kpi-card="engagement-rate"
        />
        <KPICard
          title="最高同時視聴者数"
          value={kpis.peakConcurrentViewers}
          icon={Activity}
          color="primary"
          subtitle="ピーク"
          data-kpi-card="peak-viewers"
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
          data-kpi-card="gift-givers"
        />
        <KPICard
          title="コメント者"
          value={kpis.totalCommenters}
          icon={Users}
          color="secondary"
          subtitle="総計"
          data-kpi-card="commenters"
        />
        <KPICard
          title="シェア数"
          value={kpis.totalShares}
          icon={TrendingUp}
          color="success"
          subtitle="総計"
          data-kpi-card="shares"
        />
        <KPICard
          title="配信回数"
          value={kpis.totalLiveCount}
          icon={Activity}
          color="info"
          subtitle="総計"
          data-kpi-card="live-count"
        />
        <KPICard
          title="ユニーク視聴者"
          value={kpis.totalUniqueViewers}
          icon={Eye}
          color="warning"
          subtitle="総計"
          data-kpi-card="unique-viewers"
        />
        <KPICard
          title="平均視聴時間"
          value={`${Math.floor(kpis.avgViewTime / 60)}分`}
          icon={Clock}
          color="info"
          subtitle="平均"
          data-kpi-card="avg-view-time"
        />
        <KPICard
          title="平均同時視聴者"
          value={Math.round(kpis.avgConcurrentViewers)}
          icon={Users}
          color="success"
          subtitle="平均"
          data-kpi-card="avg-concurrent"
        />
        <KPICard
          title="配信あたり時間"
          value={`${Math.floor(kpis.avgLiveTimePerStream / 3600)}:${Math.floor((kpis.avgLiveTimePerStream % 3600) / 60).toString().padStart(2, '0')}`}
          icon={Clock}
          color="primary"
          subtitle="平均"
          data-kpi-card="avg-stream-time"
        />
        </div>
        </div>
      </div>

      {/* パフォーマンス洞察 */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" data-insight="container">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">パフォーマンス洞察</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                data-insight={`item-${index}`}
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">トレンド分析</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" data-chart="main-chart">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">メインチャート</h3>
            <div className="flex items-center space-x-4">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-transparent"
                data-metric-selector="true"
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
          />
        </div>
      </div>

      {/* 詳細チャート */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">詳細チャート</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" data-chart="engagement-chart">
          <AnalyticsChart
            title="エンゲージメント推移"
            data={generateChartData(data, 'likes')}
            type="area"
            color="#ff0050"
            height={300}
          />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" data-chart="viewer-chart">
          <AnalyticsChart
            title="視聴者数推移"
            data={generateChartData(data, 'views')}
            type="line"
            color="#00f2ea"
            height={300}
          />
        </div>
        </div>
      </div>

      {/* データテーブル */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">データテーブル</h2>
        </div>
        <DataTable 
          data={data}
        />
      </div>

      {/* 詳細統計 */}
      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">詳細統計</h2>
        </div>
        <DetailedStats 
          data={data}
          kpis={kpis}
        />
      </div>

      {/* スクリーンショットエクスポートモーダル */}
      <ScreenshotExportModal
        isOpen={showScreenshotModal}
        onClose={() => setShowScreenshotModal(false)}
      />
    </div>
  );
};

export default Dashboard;