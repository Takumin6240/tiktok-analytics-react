import React from 'react';
import { TrendingUp, Award, Star, Target } from 'lucide-react';
import { AdvancedAnalytics } from '@/utils/enhancedPdfExport';
import type { AnalyticsData, KPIMetrics } from '@/types';

interface PerformanceScoreProps {
  data: AnalyticsData;
  kpis: KPIMetrics;
  className?: string;
}

const PerformanceScore: React.FC<PerformanceScoreProps> = ({ data, kpis, className = '' }) => {
  const performance = AdvancedAnalytics.evaluateStreamPerformance(data, kpis);
  const growthTrend = AdvancedAnalytics.analyzeGrowthTrend(data);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'from-purple-500 to-pink-500';
      case 'A': return 'from-green-500 to-emerald-500';
      case 'B': return 'from-blue-500 to-cyan-500';
      case 'C': return 'from-yellow-500 to-orange-500';
      case 'D': return 'from-orange-500 to-red-500';
      case 'F': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'stable': return <Target className="w-5 h-5 text-blue-500" />;
      case 'declining': return <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />;
      default: return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'growing': return '成長中';
      case 'stable': return '安定';
      case 'declining': return '下降中';
      default: return '不明';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'growing': return 'text-green-600 bg-green-50';
      case 'stable': return 'text-blue-600 bg-blue-50';
      case 'declining': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-tiktok-primary/10 rounded-lg">
            <Award className="w-5 h-5 text-tiktok-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">パフォーマンス評価</h3>
            <p className="text-sm text-gray-500">配信活動の総合評価</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* パフォーマンススコア */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getGradeColor(performance.grade)} text-white mb-4`}>
              <div className="text-center">
                <div className="text-2xl font-bold">{performance.grade}</div>
                <div className="text-xs opacity-90">{performance.score}/100</div>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">総合評価</h4>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${getGradeColor(performance.grade)}`}
                style={{ width: `${performance.score}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{performance.score}点 / 100点</p>
          </div>

          {/* 成長トレンド */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getTrendColor(growthTrend.trend)} mb-4`}>
              {getTrendIcon(growthTrend.trend)}
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">成長トレンド</h4>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(growthTrend.trend)}`}>
                {getTrendLabel(growthTrend.trend)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {growthTrend.growthRate > 0 ? '+' : ''}{growthTrend.growthRate.toFixed(1)}% 成長率
            </p>
          </div>
        </div>

        {/* 詳細フィードバック */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">詳細フィードバック</h4>
          <div className="space-y-3">
            {performance.feedback.map((feedback, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {feedback.startsWith('✅') && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  {feedback.startsWith('⚠️') && <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>}
                  {feedback.startsWith('❌') && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                </div>
                <p className="text-sm text-gray-700">{feedback.replace(/^[\u2705\u26A0\u274C]\s*/, '')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 成長分析 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">成長分析</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">最も成長した指標</span>
              </div>
              <p className="text-lg font-semibold text-green-900">{growthTrend.bestMetric}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">改善が必要な指標</span>
              </div>
              <p className="text-lg font-semibold text-orange-900">{growthTrend.worstMetric}</p>
            </div>
          </div>
        </div>

        {/* 推奨アクション */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">推奨アクション</h4>
          <div className="space-y-2">
            {performance.score < 70 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 パフォーマンス向上のため、エンゲージメント戦略の見直しをお勧めします
                </p>
              </div>
            )}
            {growthTrend.trend === 'declining' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ 成長率が低下しています。コンテンツ戦略の再検討が必要です
                </p>
              </div>
            )}
            {performance.score >= 80 && growthTrend.trend === 'growing' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  🎉 素晴らしいパフォーマンスです！現在の戦略を継続してください
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceScore;