import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  subtitle?: string;
  isLoading?: boolean;
  'data-kpi-card'?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  subtitle,
  isLoading = false,
  'data-kpi-card': dataKpiCard,
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-gradient-to-r from-tiktok-primary/10 to-tiktok-primary/5',
          icon: 'text-tiktok-primary',
          border: 'border-tiktok-primary/20',
        };
      case 'secondary':
        return {
          bg: 'bg-gradient-to-r from-tiktok-secondary/10 to-tiktok-secondary/5',
          icon: 'text-tiktok-secondary',
          border: 'border-tiktok-secondary/20',
        };
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-green-25',
          icon: 'text-green-600',
          border: 'border-green-200',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-yellow-25',
          icon: 'text-yellow-600',
          border: 'border-yellow-200',
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-blue-25',
          icon: 'text-blue-600',
          border: 'border-blue-200',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-gray-25',
          icon: 'text-gray-600',
          border: 'border-gray-200',
        };
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const colorClasses = getColorClasses(color);

  if (isLoading) {
    return (
      <div className={`p-6 rounded-xl border ${colorClasses.border} ${colorClasses.bg} animate-pulse`} data-kpi-card={dataKpiCard}>
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl border ${colorClasses.border} ${colorClasses.bg} hover:shadow-lg transition-all duration-200 group`} data-kpi-card={dataKpiCard}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {subtitle && (
            <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
          )}
          
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon(change)}
              <span className={`text-sm font-medium ${getTrendColor(change)}`}>
                {Math.abs(change).toFixed(1)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${colorClasses.icon} bg-white/50 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default KPICard;