import Papa from 'papaparse';
import { format, parse } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { 
  CSVFileType, 
  EngagementData, 
  RevenueData, 
  ActivityData, 
  ViewerData,
  FileUploadResult 
} from '@/types';

/**
 * CSV ファイルの内容を解析してタイプを判定
 */
export function detectCSVType(headers: string[]): CSVFileType {
  const headerStr = headers.join(',').toLowerCase();
  
  // エンゲージメントデータの判定
  if (headerStr.includes('ギフト') && headerStr.includes('フォロワー') && headerStr.includes('いいね')) {
    return 'engagement';
  }
  
  // 収益データの判定
  if (headerStr.includes('ダイヤモンド') && headers.length <= 3) {
    return 'revenue';
  }
  
  // 活動データの判定
  if (headerStr.includes('live時間') || headerStr.includes('配信時間')) {
    return 'activity';
  }
  
  // 視聴データの判定
  if (headerStr.includes('視聴数') && headerStr.includes('ユニーク')) {
    return 'viewer';
  }
  
  return 'unknown';
}

/**
 * 日付文字列を Date オブジェクトに変換
 */
export function parseDate(dateStr: string): Date {
  // 複数の日付フォーマットに対応
  const formats = [
    'yyyy-MM-dd',
    'yyyy/MM/dd',
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'EEE MMM dd yyyy HH:mm:ss',
  ];
  
  let date: Date | null = null;
  
  for (const formatStr of formats) {
    try {
      date = parse(dateStr, formatStr, new Date(), { locale: ja });
      if (!isNaN(date.getTime())) {
        break;
      }
    } catch {
      continue;
    }
  }
  
  // ISO形式も試行
  if (!date || isNaN(date.getTime())) {
    date = new Date(dateStr);
  }
  
  return date && !isNaN(date.getTime()) ? date : new Date();
}

/**
 * 数値の安全な変換
 */
export function safeParseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  
  // カンマや特殊文字を除去
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
}

/**
 * エンゲージメントデータの解析
 */
export function parseEngagementData(rows: any[]): EngagementData[] {
  return rows.map(row => {
    const date = parseDate(row[0] || row.Date || row.date);
    return {
      date,
      dateString: format(date, 'yyyy/MM/dd'),
      giftGivers: safeParseNumber(row[1] || row['ギフト贈呈者'] || row.giftGivers || 0),
      newFollowers: safeParseNumber(row[2] || row['新規フォロワー'] || row.newFollowers || 0),
      commenters: safeParseNumber(row[3] || row['コメントした視聴者'] || row.commenters || 0),
      likes: safeParseNumber(row[4] || row['いいね'] || row.likes || 0),
      shares: safeParseNumber(row[5] || row['シェア'] || row.shares || 0),
    };
  });
}

/**
 * 収益データの解析
 */
export function parseRevenueData(rows: any[]): RevenueData[] {
  return rows.map(row => {
    const date = parseDate(row[0] || row.Date || row.date);
    return {
      date,
      dateString: format(date, 'yyyy/MM/dd'),
      diamonds: safeParseNumber(row[1] || row['ダイヤモンド'] || row.diamonds || 0),
    };
  });
}/**
 * 活動データの解析
 */
export function parseActivityData(rows: any[]): ActivityData[] {
  return rows.map(row => {
    const date = parseDate(row[0] || row.Date || row.date);
    return {
      date,
      dateString: format(date, 'yyyy/MM/dd'),
      liveTime: safeParseNumber(row[1] || row['LIVE時間'] || row.liveTime || 0),
      liveCount: safeParseNumber(row[2] || row['LIVEの合計数'] || row.liveCount || 0),
    };
  });
}

/**
 * 視聴データの解析
 */
export function parseViewerData(rows: any[]): ViewerData[] {
  return rows.map(row => {
    const date = parseDate(row[0] || row.Date || row.date);
    return {
      date,
      dateString: format(date, 'yyyy/MM/dd'),
      viewCount: safeParseNumber(row[1] || row['視聴数'] || row.viewCount || 0),
      uniqueViewers: safeParseNumber(row[2] || row['ユニーク視聴者数'] || row.uniqueViewers || 0),
      avgViewTime: safeParseNumber(row[3] || row['平均視聴時間'] || row.avgViewTime || 0),
      maxConcurrent: safeParseNumber(row[4] || row['最高同時視聴者数'] || row.maxConcurrent || 0),
      avgConcurrent: safeParseNumber(row[5] || row['平均同時視聴者数'] || row.avgConcurrent || 0),
    };
  });
}

/**
 * CSVファイルを解析してデータを返す
 */
export async function parseCSVFile(file: File): Promise<FileUploadResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const rows = results.data as string[][];
          if (rows.length < 2) {
            resolve({
              file,
              type: 'unknown',
              data: [],
              error: 'ファイルにデータが含まれていません'
            });
            return;
          }

          const headers = rows[0];
          const dataRows = rows.slice(1);
          const fileType = detectCSVType(headers);

          let parsedData: any[] = [];
          let error: string | undefined;

          try {
            switch (fileType) {
              case 'engagement':
                parsedData = parseEngagementData(dataRows);
                break;
              case 'revenue':
                parsedData = parseRevenueData(dataRows);
                break;
              case 'activity':
                parsedData = parseActivityData(dataRows);
                break;
              case 'viewer':
                parsedData = parseViewerData(dataRows);
                break;
              default:
                error = 'ファイルタイプを判定できませんでした';
                break;
            }
          } catch (parseError) {
            error = `データ解析エラー: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`;
          }

          resolve({
            file,
            type: fileType,
            data: parsedData,
            error
          });
        } catch (err) {
          resolve({
            file,
            type: 'unknown',
            data: [],
            error: `ファイル処理エラー: ${err instanceof Error ? err.message : 'Unknown error'}`
          });
        }
      },
      error: (error) => {
        resolve({
          file,
          type: 'unknown',
          data: [],
          error: `CSV解析エラー: ${error.message}`
        });
      }
    });
  });
}

/**
 * 複数のCSVファイルを一括処理
 */
export async function parseMultipleCSVFiles(files: File[]): Promise<FileUploadResult[]> {
  const promises = files.map(file => parseCSVFile(file));
  return Promise.all(promises);
}

/**
 * データの日付範囲を取得
 */
export function getDateRange(data: any[]): { start: Date; end: Date } | null {
  if (!data.length) return null;
  
  const dates = data.map(item => item.date).filter(date => date instanceof Date);
  if (!dates.length) return null;
  
  return {
    start: new Date(Math.min(...dates.map(d => d.getTime()))),
    end: new Date(Math.max(...dates.map(d => d.getTime())))
  };
}

/**
 * データの検証
 */
export function validateData(data: any[], type: CSVFileType): string[] {
  const errors: string[] = [];
  
  if (!data.length) {
    errors.push('データが空です');
    return errors;
  }
  
  const requiredFields: Record<CSVFileType, string[]> = {
    engagement: ['date', 'giftGivers', 'newFollowers', 'commenters', 'likes', 'shares'],
    revenue: ['date', 'diamonds'],
    activity: ['date', 'liveTime', 'liveCount'],
    viewer: ['date', 'viewCount', 'uniqueViewers', 'avgViewTime', 'maxConcurrent', 'avgConcurrent'],
    unknown: []
  };
  
  const fields = requiredFields[type];
  if (!fields) {
    errors.push('未知のデータタイプです');
    return errors;
  }
  
  // 必須フィールドの存在確認
  const firstItem = data[0];
  for (const field of fields) {
    if (!(field in firstItem)) {
      errors.push(`必須フィールド '${field}' が見つかりません`);
    }
  }
  
  // 日付の妥当性確認
  const invalidDates = data.filter(item => !(item.date instanceof Date) || isNaN(item.date.getTime()));
  if (invalidDates.length > 0) {
    errors.push(`${invalidDates.length}件の無効な日付があります`);
  }
  
  return errors;
}