import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts';
import { BarChart3, Filter } from 'lucide-react';
import type { ChartDataPoint } from '@/types';

interface AnalyticsChartProps {
  title: string;
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'area' | 'composed';
  color?: string;
  secondaryData?: ChartDataPoint[];
  secondaryColor?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  className?: string;
  'data-chart'?: string;
  'data-chart-title'?: string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  data,
  type,
  color = '#ff0050',
  secondaryData,
  secondaryColor = '#00f2ea',
  height = 300,
  showLegend = true,
  showGrid = true,
  animate = true,
  className = '',
  'data-chart': dataChart,
  'data-chart-title': dataChartTitle,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'all'>('all');

  const getFilteredData = () => {
    if (selectedPeriod === 'all') return data;
    
    const days = selectedPeriod === '7d' ? 7 : 30;
    return data.slice(-days);
  };

  const filteredData = getFilteredData();

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const formatTooltipLabel = (label: string) => {
    const date = new Date(label);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };



  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">
            {formatTooltipLabel(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = (): React.ReactElement | null => {
    const commonProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              fontSize={12}
            />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              animationDuration={animate ? 1000 : 0}
            />
            {secondaryData && (
              <Line
                type="monotone"
                dataKey="secondaryValue"
                stroke={secondaryColor}
                strokeWidth={2}
                dot={{ fill: secondaryColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: secondaryColor, strokeWidth: 2 }}
                animationDuration={animate ? 1000 : 0}
              />
            )}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              fontSize={12}
            />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar
              dataKey="value"
              fill={color}
              radius={[4, 4, 0, 0]}
              animationDuration={animate ? 1000 : 0}
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              fontSize={12}
            />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={animate ? 1000 : 0}
            />
          </AreaChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              fontSize={12}
            />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar
              dataKey="value"
              fill={color}
              radius={[4, 4, 0, 0]}
              animationDuration={animate ? 1000 : 0}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              animationDuration={animate ? 1000 : 0}
            />
          </ComposedChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`} data-chart={dataChart} data-chart-title={dataChartTitle}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-tiktok-primary/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-tiktok-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {filteredData.length} 件のデータポイント
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | 'all')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-transparent"
          >
            <option value="7d">過去7日</option>
            <option value="30d">過去30日</option>
            <option value="all">全期間</option>
          </select>
        </div>
      </div>

      {/* チャート */}
      <div className="w-full" style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() || <div>データがありません</div>}
        </ResponsiveContainer>
      </div>

      {/* 統計情報 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">最大値</p>
            <p className="font-semibold text-gray-900">
              {Math.max(...filteredData.map(d => d.value)).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">最小値</p>
            <p className="font-semibold text-gray-900">
              {Math.min(...filteredData.map(d => d.value)).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">平均値</p>
            <p className="font-semibold text-gray-900">
              {Math.round(filteredData.reduce((sum, d) => sum + d.value, 0) / filteredData.length).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">合計</p>
            <p className="font-semibold text-gray-900">
              {filteredData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;