import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Download, Search, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { AnalyticsData } from '@/types';

interface DataTableProps {
  data: AnalyticsData;
  className?: string;
}

interface TableRow {
  date: string;
  giftGivers: number;
  followers: number;
  commenters: number;
  likes: number;
  shares: number;
  liveTime: number;
  liveCount: number;
  views: number;
  uniqueViewers: number;
  avgViewTime: number;
  maxConcurrent: number;
  avgConcurrent: number;
  diamonds: number;
}

type SortKey = keyof TableRow;
type SortDirection = 'asc' | 'desc';

const DataTable: React.FC<DataTableProps> = ({ data, className = '' }) => {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // データを統合してテーブル行を作成
  const tableData = useMemo(() => {
    const dateMap = new Map<string, Partial<TableRow>>();

    // 全てのデータソースから日付を収集
    [...data.engagement, ...data.revenue, ...data.activity, ...data.viewer]
      .forEach(item => {
        const dateKey = item.dateString;
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { date: dateKey });
        }
      });

    // エンゲージメントデータを統合
    data.engagement.forEach(item => {
      const row = dateMap.get(item.dateString);
      if (row) {
        row.giftGivers = item.giftGivers;
        row.followers = item.newFollowers;
        row.commenters = item.commenters;
        row.likes = item.likes;
        row.shares = item.shares;
      }
    });

    // 収益データを統合
    data.revenue.forEach(item => {
      const row = dateMap.get(item.dateString);
      if (row) {
        row.diamonds = item.diamonds;
      }
    });

    // アクティビティデータを統合
    data.activity.forEach(item => {
      const row = dateMap.get(item.dateString);
      if (row) {
        row.liveTime = item.liveTime;
        row.liveCount = item.liveCount;
      }
    });

    // 視聴者データを統合
    data.viewer.forEach(item => {
      const row = dateMap.get(item.dateString);
      if (row) {
        row.views = item.viewCount;
        row.uniqueViewers = item.uniqueViewers;
        row.avgViewTime = item.avgViewTime;
        row.maxConcurrent = item.maxConcurrent;
        row.avgConcurrent = item.avgConcurrent;
      }
    });

    // 完全なテーブル行を作成
    const rows: TableRow[] = [];
    dateMap.forEach((row, date) => {
      rows.push({
        date,
        giftGivers: row.giftGivers || 0,
        followers: row.followers || 0,
        commenters: row.commenters || 0,
        likes: row.likes || 0,
        shares: row.shares || 0,
        liveTime: row.liveTime || 0,
        liveCount: row.liveCount || 0,
        views: row.views || 0,
        uniqueViewers: row.uniqueViewers || 0,
        avgViewTime: row.avgViewTime || 0,
        maxConcurrent: row.maxConcurrent || 0,
        avgConcurrent: row.avgConcurrent || 0,
        diamonds: row.diamonds || 0,
      });
    });

    return rows;
  }, [data]);

  // ソート関数
  const sortedData = useMemo(() => {
    const sorted = [...tableData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (sortKey === 'date') {
        const aDate = new Date(aValue as string);
        const bDate = new Date(bValue as string);
        const comparison = aDate.getTime() - bDate.getTime();
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [tableData, sortKey, sortDirection]);

  // フィルタリング
  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    return sortedData.filter(row => 
      row.date.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedData, searchTerm]);

  // ページネーション
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // ソート処理
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // 値のフォーマット
  const formatValue = (value: number | string, type: 'number' | 'time' | 'currency' | 'string' = 'number') => {
    if (type === 'string') return value;
    if (typeof value !== 'number') return value;
    
    switch (type) {
      case 'time': {
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        return `${hours}h ${minutes}m`;
      }
      case 'currency':
        return `${value.toLocaleString()}💎`;
      default:
        return value.toLocaleString();
    }
  };

  // XLSX エクスポート
  const handleExportXLSX = () => {
    const exportData = filteredData.map(row => ({
      '日付': row.date,
      'ギフト贈呈者': row.giftGivers,
      '新規フォロワー': row.followers,
      'コメントした視聴者': row.commenters,
      'いいね': row.likes,
      'シェア': row.shares,
      'LIVE時間': formatValue(row.liveTime, 'time'),
      'LIVEの合計数': row.liveCount,
      '視聴数': row.views,
      'ユニーク視聴者数': row.uniqueViewers,
      '平均視聴時間': formatValue(row.avgViewTime, 'time'),
      '最高同時視聴者数': row.maxConcurrent,
      '平均同時視聴者数': row.avgConcurrent,
      'ダイヤモンド': row.diamonds
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TikTokAnalytics');
    
    const filename = `tiktok-analytics-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  // ソートアイコン
  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-tiktok-primary" />
      : <ChevronDown className="w-4 h-4 text-tiktok-primary" />;
  };

  // カラム定義
  const columns = [
    { key: 'date' as SortKey, label: '日付', type: 'string' },
    { key: 'giftGivers' as SortKey, label: 'ギフト贈呈者', type: 'number' },
    { key: 'followers' as SortKey, label: '新規フォロワー', type: 'number' },
    { key: 'commenters' as SortKey, label: 'コメントした視聴者', type: 'number' },
    { key: 'likes' as SortKey, label: 'いいね', type: 'number' },
    { key: 'shares' as SortKey, label: 'シェア', type: 'number' },
    { key: 'liveTime' as SortKey, label: 'LIVE時間', type: 'time' },
    { key: 'liveCount' as SortKey, label: 'LIVEの合計数', type: 'number' },
    { key: 'views' as SortKey, label: '視聴数', type: 'number' },
    { key: 'uniqueViewers' as SortKey, label: 'ユニーク視聴者数', type: 'number' },
    { key: 'avgViewTime' as SortKey, label: '平均視聴時間', type: 'time' },
    { key: 'maxConcurrent' as SortKey, label: '最高同時視聴者数', type: 'number' },
    { key: 'avgConcurrent' as SortKey, label: '平均同時視聴者数', type: 'number' },
    { key: 'diamonds' as SortKey, label: 'ダイヤモンド', type: 'currency' },
  ];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-tiktok-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-tiktok-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">データテーブル</h3>
              <p className="text-sm text-gray-500">
                {filteredData.length} 件のデータ
              </p>
            </div>
          </div>
          
          <button
            onClick={handleExportXLSX}
            className="flex items-center space-x-2 px-4 py-2 bg-tiktok-primary text-white rounded-lg hover:bg-tiktok-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>XLSX エクスポート</span>
          </button>
        </div>

        {/* 検索とページサイズ */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="日付で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">表示件数:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    <SortIcon column={column.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={`${row.date}-${index}`} className="hover:bg-gray-50">
                {columns.map(column => (
                  <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                    {formatValue(row[column.key], column.type as any)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredData.length)} 件 
              / 全 {filteredData.length} 件
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                前へ
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === page
                          ? 'bg-tiktok-primary text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;