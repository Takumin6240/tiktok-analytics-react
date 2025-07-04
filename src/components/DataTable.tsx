import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Download, Search, Calendar } from 'lucide-react';
import type { AnalyticsData } from '@/types';

interface DataTableProps {
  data: AnalyticsData;
  onExport?: () => void;
  className?: string;
}

interface TableRow {
  date: string;
  diamonds: number;
  likes: number;
  followers: number;
  views: number;
  liveTime: number;
  liveCount: number;
  giftGivers: number;
  commenters: number;
  shares: number;
  uniqueViewers: number;
  maxConcurrent: number;
  avgConcurrent: number;
  avgViewTime: number;
}

type SortKey = keyof TableRow;
type SortDirection = 'asc' | 'desc';

const DataTable: React.FC<DataTableProps> = ({ data, onExport, className = '' }) => {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // データを統合してテーブル行を作成
  const tableData = useMemo(() => {
    const rows: TableRow[] = [];
    const dateMap = new Map<string, Partial<TableRow>>();

    // 各データソースから日付をキーにしてデータを統合
    data.engagement.forEach(item => {
      const key = item.dateString;
      if (!dateMap.has(key)) {
        dateMap.set(key, { date: key });
      }
      const row = dateMap.get(key)!;
      row.likes = item.likes;
      row.followers = item.newFollowers;
      row.giftGivers = item.giftGivers;
      row.commenters = item.commenters;
      row.shares = item.shares;
    });

    data.revenue.forEach(item => {
      const key = item.dateString;
      if (!dateMap.has(key)) {
        dateMap.set(key, { date: key });
      }
      const row = dateMap.get(key)!;
      row.diamonds = item.diamonds;
    });

    data.activity.forEach(item => {
      const key = item.dateString;
      if (!dateMap.has(key)) {
        dateMap.set(key, { date: key });
      }
      const row = dateMap.get(key)!;
      row.liveTime = item.liveTime;
      row.liveCount = item.liveCount;
    });

    data.viewer.forEach(item => {
      const key = item.dateString;
      if (!dateMap.has(key)) {
        dateMap.set(key, { date: key });
      }
      const row = dateMap.get(key)!;
      row.views = item.viewCount;
      row.uniqueViewers = item.uniqueViewers;
      row.maxConcurrent = item.maxConcurrent;
      row.avgConcurrent = item.avgConcurrent;
      row.avgViewTime = item.avgViewTime;
    });

    // 完全なデータ行を作成
    dateMap.forEach((row, date) => {
      rows.push({
        date,
        diamonds: row.diamonds || 0,
        likes: row.likes || 0,
        followers: row.followers || 0,
        views: row.views || 0,
        liveTime: row.liveTime || 0,
        liveCount: row.liveCount || 0,
        giftGivers: row.giftGivers || 0,
        commenters: row.commenters || 0,
        shares: row.shares || 0,
        uniqueViewers: row.uniqueViewers || 0,
        maxConcurrent: row.maxConcurrent || 0,
        avgConcurrent: row.avgConcurrent || 0,
        avgViewTime: row.avgViewTime || 0,
      });
    });

    return rows;
  }, [data]);

  // フィルタリングとソート
  const filteredAndSortedData = useMemo(() => {
    let filtered = tableData;

    // 検索フィルタ
    if (searchTerm) {
      filtered = filtered.filter(row => 
        row.date.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ソート
    filtered.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [tableData, searchTerm, sortKey, sortDirection]);

  // ページネーション
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ChevronUp className="w-4 h-4 text-gray-300" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-tiktok-primary" />
      : <ChevronDown className="w-4 h-4 text-tiktok-primary" />;
  };

  const formatValue = (value: number, type: 'number' | 'time' | 'currency' = 'number') => {
    switch (type) {
      case 'time':
        return `${Math.round(value / 3600)}h ${Math.round((value % 3600) / 60)}m`;
      case 'currency':
        return `${value.toLocaleString()}💎`;
      default:
        return value.toLocaleString();
    }
  };

  const columns = [
    { key: 'date' as SortKey, label: '日付', type: 'string' },
    { key: 'diamonds' as SortKey, label: 'ダイヤモンド', type: 'currency' },
    { key: 'likes' as SortKey, label: 'いいね', type: 'number' },
    { key: 'followers' as SortKey, label: '新規フォロワー', type: 'number' },
    { key: 'views' as SortKey, label: '視聴数', type: 'number' },
    { key: 'liveTime' as SortKey, label: '配信時間', type: 'time' },
    { key: 'liveCount' as SortKey, label: '配信回数', type: 'number' },
    { key: 'maxConcurrent' as SortKey, label: '最高同時視聴', type: 'number' },
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
                {filteredAndSortedData.length} 件のデータ
              </p>
            </div>
          </div>
          
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center space-x-2 px-4 py-2 bg-tiktok-primary text-white rounded-lg hover:bg-tiktok-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>エクスポート</span>
            </button>
          )}
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
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
              <tr key={row.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map(column => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.key === 'date' 
                      ? row[column.key]
                      : formatValue(row[column.key] as number, column.type as any)
                    }
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
              {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredAndSortedData.length)} 件 
              / 全 {filteredAndSortedData.length} 件
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