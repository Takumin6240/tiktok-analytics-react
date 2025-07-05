import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { calculateKPIMetrics } from './analytics';
import type { AnalyticsData, KPIMetrics } from '@/types';

// TikTokブランドカラー
const COLORS = {
  PRIMARY: 'FF0050',     // TikTok Primary Red
  SECONDARY: '00F2EA',   // TikTok Secondary Cyan
  ACCENT: 'FE2C55',      // TikTok Accent Pink
  SUCCESS: '25F4EE',     // TikTok Success Blue
  WARNING: 'FFB800',     // Warning Orange
  DARK: '161823',        // TikTok Dark
  LIGHT: 'F8F9FA',       // Light Gray
  WHITE: 'FFFFFF'
};

export interface EnhancedExcelExportOptions {
  filename?: string;
  includeCharts?: boolean;
  includeAnalysis?: boolean;
}

/**
 * 高品質なExcelワークブックを生成
 */
export const createEnhancedExcelWorkbook = async (
  data: AnalyticsData,
  options: EnhancedExcelExportOptions = {}
): Promise<ExcelJS.Workbook> => {
  const {
    includeCharts = true,
    includeAnalysis = true
  } = options;

  const workbook = new ExcelJS.Workbook();
  
  // ワークブックメタデータ
  workbook.creator = 'TikTok Analytics Dashboard';
  workbook.lastModifiedBy = 'TikTok Analytics Dashboard';
  workbook.created = new Date();
  workbook.modified = new Date();

  const kpis = calculateKPIMetrics(data);

  // 1. ダッシュボードサマリーシート
  await createDashboardSummarySheet(workbook, data, kpis);

  // 2. 詳細データシート
  await createDetailedDataSheet(workbook, data);

  // 3. 収益分析シート
  await createRevenueAnalysisSheet(workbook, data, kpis);

  // 4. エンゲージメント分析シート
  await createEngagementAnalysisSheet(workbook, data, kpis);

  // 5. 視聴者分析シート
  await createViewerAnalysisSheet(workbook, data, kpis);

  // 6. ライブ配信パフォーマンスシート
  await createLiveStreamPerformanceSheet(workbook, data, kpis);

  // 7. 自動チャートシート（オプション）
  if (includeCharts) {
    await createAutomatedChartsSheet(workbook, data);
  }

  // 8. 高度な分析シート（オプション）
  if (includeAnalysis) {
    await createAdvancedAnalysisSheet(workbook, data, kpis);
  }

  return workbook;
};

/**
 * 1. ダッシュボードサマリーシート
 */
const createDashboardSummarySheet = async (
  workbook: ExcelJS.Workbook,
  data: AnalyticsData,
  kpis: KPIMetrics
) => {
  const worksheet = workbook.addWorksheet('ダッシュボードサマリー', {
    properties: { tabColor: { argb: COLORS.PRIMARY } }
  });

  // ヘッダー設定
  worksheet.mergeCells('A1:J1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'TikTok ライブ分析レポート';
  titleCell.font = { size: 24, bold: true, color: { argb: COLORS.PRIMARY } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // サブタイトル
  worksheet.mergeCells('A2:J2');
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = `生成日: ${new Date().toLocaleDateString('ja-JP')} | データ期間: ${data.engagement.length}日間`;
  subtitleCell.font = { size: 12, color: { argb: COLORS.DARK } };
  subtitleCell.alignment = { horizontal: 'center' };

  // KPI サマリーテーブル
  const kpiStartRow = 5;
  const kpiHeaders = ['指標', '合計値', '日平均', '単位', '説明'];
  
  // ヘッダー行
  kpiHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(kpiStartRow, index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.PRIMARY } };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // KPIデータ
  const kpiData = [
    ['総ダイヤモンド', kpis.totalDiamonds, Math.round(kpis.totalDiamonds / kpis.activeDays), 'ダイヤ', '収益の総額'],
    ['総いいね', kpis.totalLikes, Math.round(kpis.totalLikes / kpis.activeDays), '件', 'エンゲージメントの総数'],
    ['新規フォロワー', kpis.totalFollowers, Math.round(kpis.totalFollowers / kpis.activeDays), '人', '獲得したフォロワー数'],
    ['総視聴数', kpis.totalViews, Math.round(kpis.totalViews / kpis.activeDays), '回', 'ライブ視聴回数の合計'],
    ['配信時間', Math.round(kpis.totalLiveTime / 3600), Math.round(kpis.totalLiveTime / 3600 / kpis.activeDays), '時間', '累計配信時間'],
    ['配信回数', kpis.totalLiveCount, Math.round(kpis.totalLiveCount / kpis.activeDays), '回', '総配信セッション数'],
    ['ユニーク視聴者', kpis.totalUniqueViewers, Math.round(kpis.totalUniqueViewers / data.viewer.length), '人', '個別視聴者数'],
    ['最高同時視聴者', kpis.peakConcurrentViewers, Math.round(kpis.avgConcurrentViewers), '人', 'ピーク時の同時視聴者']
  ];

  kpiData.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const cell = worksheet.getCell(kpiStartRow + rowIndex + 1, colIndex + 1);
      cell.value = value;
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      
      // 数値フォーマット
      if (colIndex === 1 || colIndex === 2) {
        cell.numFmt = '#,##0';
      }
      
      // 交互の行の背景色
      if (rowIndex % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.LIGHT } };
      }
    });
  });

  // パフォーマンスハイライト
  const highlightStartRow = kpiStartRow + kpiData.length + 3;
  worksheet.mergeCells(`A${highlightStartRow}:J${highlightStartRow}`);
  const highlightTitle = worksheet.getCell(`A${highlightStartRow}`);
  highlightTitle.value = 'パフォーマンスハイライト';
  highlightTitle.font = { size: 16, bold: true, color: { argb: COLORS.PRIMARY } };

  const highlights = [
    `✨ エンゲージメント率: ${kpis.avgEngagementRate.toFixed(1)}%`,
    `📈 配信効率: ${Math.round(kpis.totalDiamonds / (kpis.totalLiveTime / 3600))} ダイヤ/時間`,
    `👥 平均同時視聴者: ${Math.round(kpis.avgConcurrentViewers)}人`,
    `🔥 最も成功した指標: ${kpis.totalDiamonds > 10000 ? 'ダイヤモンド収益' : kpis.totalLikes > 50000 ? 'いいね数' : '視聴者数'}`,
    `📊 配信頻度: ${(kpis.activeDays / (data.engagement.length / 7)).toFixed(1)}日/週`
  ];

  highlights.forEach((highlight, index) => {
    const cell = worksheet.getCell(highlightStartRow + index + 1, 1);
    cell.value = highlight;
    cell.font = { size: 12 };
    worksheet.mergeCells(`A${highlightStartRow + index + 1}:J${highlightStartRow + index + 1}`);
  });

  // 列幅設定
  worksheet.columns = [
    { width: 20 }, { width: 15 }, { width: 15 }, { width: 10 }, { width: 30 },
    { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
  ];

  return worksheet;
};

/**
 * 2. 詳細データシート
 */
const createDetailedDataSheet = async (
  workbook: ExcelJS.Workbook,
  data: AnalyticsData
) => {
  const worksheet = workbook.addWorksheet('詳細データ', {
    properties: { tabColor: { argb: COLORS.SECONDARY } }
  });

  // データを統合
  const combinedData = data.engagement.map((engagement, index) => ({
    date: engagement.dateString,
    giftGivers: engagement.giftGivers || 0,
    followers: engagement.newFollowers,
    commenters: engagement.commenters || 0,
    likes: engagement.likes,
    shares: engagement.shares || 0,
    liveTime: data.activity[index]?.liveTime || 0,
    liveCount: data.activity[index]?.liveCount || 0,
    views: data.viewer[index]?.viewCount || 0,
    uniqueViewers: data.viewer[index]?.uniqueViewers || 0,
    avgViewTime: data.viewer[index]?.avgViewTime || 0,
    maxConcurrent: data.viewer[index]?.maxConcurrent || 0,
    avgConcurrent: data.viewer[index]?.avgConcurrent || 0,
    diamonds: data.revenue[index]?.diamonds || 0
  }));

  const headers = [
    '日付', 'ギフト贈呈者', '新規フォロワー', 'コメント視聴者', 'いいね', 'シェア',
    'LIVE時間(秒)', 'LIVE回数', '視聴数', 'ユニーク視聴者', '平均視聴時間(秒)',
    '最高同時視聴者', '平均同時視聴者', 'ダイヤモンド'
  ];

  // ヘッダー行
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SECONDARY } };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // データ行
  combinedData.forEach((row, rowIndex) => {
    Object.values(row).forEach((value, colIndex) => {
      const cell = worksheet.getCell(rowIndex + 2, colIndex + 1);
      cell.value = value;
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };

      // 数値フォーマット
      if (colIndex > 0 && colIndex !== 0) {
        cell.numFmt = '#,##0';
      }

      // 交互の行の背景色
      if (rowIndex % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.LIGHT } };
      }
    });
  });

  // テーブル形式に変換
  const tableRange = `A1:${String.fromCharCode(65 + headers.length - 1)}${combinedData.length + 1}`;
  worksheet.addTable({
    name: 'DetailedDataTable',
    ref: tableRange,
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyleMedium2',
      showRowStripes: true
    },
    columns: headers.map(header => ({ name: header, filterButton: true })),
    rows: combinedData.map(row => Object.values(row))
  });

  // 列幅自動調整
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  return worksheet;
};

/**
 * 3. 収益分析シート
 */
const createRevenueAnalysisSheet = async (
  workbook: ExcelJS.Workbook,
  data: AnalyticsData,
  kpis: KPIMetrics
) => {
  const worksheet = workbook.addWorksheet('収益分析', {
    properties: { tabColor: { argb: COLORS.SUCCESS } }
  });

  // 収益データの準備
  const revenueData = data.revenue.map((item, index) => ({
    date: item.dateString,
    diamonds: item.diamonds,
    liveTime: data.activity[index]?.liveTime || 0,
    liveCount: data.activity[index]?.liveCount || 0,
    diamondsPerHour: (data.activity[index]?.liveTime || 0) > 0 ? 
      item.diamonds / ((data.activity[index]?.liveTime || 1) / 3600) : 0,
    diamondsPerStream: (data.activity[index]?.liveCount || 0) > 0 ? 
      item.diamonds / (data.activity[index]?.liveCount || 1) : 0
  }));

  // ヘッダー
  const headers = ['日付', 'ダイヤモンド', 'LIVE時間(時間)', 'LIVE回数', 'ダイヤ/時間', 'ダイヤ/配信'];
  
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SUCCESS } };
  });

  // データ
  revenueData.forEach((row, rowIndex) => {
    const rowData = [
      row.date,
      row.diamonds,
      Math.round(row.liveTime / 3600 * 100) / 100,
      row.liveCount,
      Math.round(row.diamondsPerHour),
      Math.round(row.diamondsPerStream)
    ];

    rowData.forEach((value, colIndex) => {
      const cell = worksheet.getCell(rowIndex + 2, colIndex + 1);
      cell.value = value;
      if (colIndex > 0) cell.numFmt = '#,##0';
    });
  });

  // サマリー統計
  const summaryStartRow = revenueData.length + 5;
  worksheet.getCell(summaryStartRow, 1).value = '収益サマリー統計';
  worksheet.getCell(summaryStartRow, 1).font = { bold: true, size: 14 };

  const summaryStats = [
    ['総収益', kpis.totalDiamonds],
    ['平均日収', Math.round(kpis.totalDiamonds / kpis.activeDays)],
    ['最高日収', Math.max(...revenueData.map(r => r.diamonds))],
    ['時間効率', Math.round(kpis.totalDiamonds / (kpis.totalLiveTime / 3600))],
    ['配信効率', Math.round(kpis.avgRevenuePerStream)]
  ];

  summaryStats.forEach((stat, index) => {
    worksheet.getCell(summaryStartRow + index + 1, 1).value = stat[0];
    worksheet.getCell(summaryStartRow + index + 1, 2).value = stat[1];
    worksheet.getCell(summaryStartRow + index + 1, 2).numFmt = '#,##0';
  });

  return worksheet;
};

/**
 * エクスポート関数
 */
export const exportEnhancedExcel = async (
  data: AnalyticsData,
  options: EnhancedExcelExportOptions = {}
): Promise<{ success: boolean; error?: string }> => {
  try {
    const {
      filename = `tiktok-analytics-enhanced-${new Date().toISOString().split('T')[0]}.xlsx`
    } = options;

    const workbook = await createEnhancedExcelWorkbook(data, options);
    
    // Buffer形式で書き出し
    const buffer = await workbook.xlsx.writeBuffer();
    
    // ファイル保存
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    saveAs(blob, filename);
    
    return { success: true };
  } catch (error) {
    console.error('Enhanced Excel export failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * 4. エンゲージメント分析シート
 */
const createEngagementAnalysisSheet = async (
  workbook: ExcelJS.Workbook, 
  data: AnalyticsData, 
  kpis: KPIMetrics
) => {
  const worksheet = workbook.addWorksheet('エンゲージメント分析', {
    properties: { tabColor: { argb: COLORS.ACCENT } }
  });

  // エンゲージメントデータの準備
  const engagementData = data.engagement.map((item, index) => ({
    date: item.dateString,
    likes: item.likes,
    giftGivers: item.giftGivers || 0,
    commenters: item.commenters || 0,
    shares: item.shares || 0,
    followers: item.newFollowers,
    views: data.viewer[index]?.viewCount || 0,
    engagementRate: data.viewer[index]?.viewCount ? 
      ((item.likes + (item.giftGivers || 0) + (item.commenters || 0)) / data.viewer[index].viewCount * 100) : 0
  }));

  // ヘッダー
  const headers = ['日付', 'いいね', 'ギフト贈呈者', 'コメント者', 'シェア', '新規フォロワー', '視聴数', 'エンゲージメント率(%)'];
  
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ACCENT } };
  });

  // データ行
  engagementData.forEach((row, rowIndex) => {
    const values = [row.date, row.likes, row.giftGivers, row.commenters, row.shares, row.followers, row.views, row.engagementRate];
    values.forEach((value, colIndex) => {
      const cell = worksheet.getCell(rowIndex + 2, colIndex + 1);
      cell.value = value;
      if (colIndex > 0) cell.numFmt = colIndex === 7 ? '0.00' : '#,##0';
    });
  });

  // エンゲージメントサマリー
  const summaryStartRow = engagementData.length + 5;
  worksheet.getCell(summaryStartRow, 1).value = 'エンゲージメントサマリー';
  worksheet.getCell(summaryStartRow, 1).font = { bold: true, size: 14 };

  const engagementSummary = [
    ['平均エンゲージメント率', `${kpis.avgEngagementRate.toFixed(2)}%`],
    ['最高エンゲージメント率', `${Math.max(...engagementData.map(e => e.engagementRate)).toFixed(2)}%`],
    ['総エンゲージメント数', kpis.totalLikes + kpis.totalGiftGivers + kpis.totalCommenters],
    ['いいね/視聴 比率', `${(kpis.totalLikes / kpis.totalViews * 100).toFixed(2)}%`],
    ['フォロワー転換率', `${(kpis.totalFollowers / kpis.totalViews * 100).toFixed(2)}%`]
  ];

  engagementSummary.forEach((item, index) => {
    worksheet.getCell(summaryStartRow + index + 1, 1).value = item[0];
    worksheet.getCell(summaryStartRow + index + 1, 2).value = item[1];
  });

  return worksheet;
};

/**
 * 5. 視聴者分析シート
 */
const createViewerAnalysisSheet = async (
  workbook: ExcelJS.Workbook, 
  data: AnalyticsData, 
  _kpis: KPIMetrics
) => {
  const worksheet = workbook.addWorksheet('視聴者分析', {
    properties: { tabColor: { argb: COLORS.WARNING } }
  });

  // 視聴者データの準備
  const viewerData = data.viewer.map((item, index) => ({
    date: item.dateString,
    viewCount: item.viewCount,
    uniqueViewers: item.uniqueViewers,
    maxConcurrent: item.maxConcurrent,
    avgConcurrent: item.avgConcurrent,
    avgViewTime: Math.round(item.avgViewTime / 60), // 分に変換
    liveTime: Math.round((data.activity[index]?.liveTime || 0) / 3600), // 時間に変換
    retentionRate: item.uniqueViewers > 0 ? (item.avgConcurrent / item.uniqueViewers * 100) : 0
  }));

  // ヘッダー
  const headers = ['日付', '総視聴数', 'ユニーク視聴者', '最高同時視聴者', '平均同時視聴者', '平均視聴時間(分)', '配信時間(時)', '視聴者維持率(%)'];
  
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.WARNING } };
  });

  // データ行
  viewerData.forEach((row, rowIndex) => {
    const values = [row.date, row.viewCount, row.uniqueViewers, row.maxConcurrent, row.avgConcurrent, row.avgViewTime, row.liveTime, row.retentionRate];
    values.forEach((value, colIndex) => {
      const cell = worksheet.getCell(rowIndex + 2, colIndex + 1);
      cell.value = value;
      if (colIndex > 0) cell.numFmt = colIndex === 7 ? '0.00' : '#,##0';
    });
  });

  return worksheet;
};

/**
 * 6. ライブ配信パフォーマンスシート
 */
const createLiveStreamPerformanceSheet = async (
  workbook: ExcelJS.Workbook, 
  data: AnalyticsData, 
  _kpis: KPIMetrics
) => {
  const worksheet = workbook.addWorksheet('配信パフォーマンス', {
    properties: { tabColor: { argb: COLORS.DARK } }
  });

  // 配信データの準備
  const streamData = data.activity.map((item, index) => ({
    date: item.dateString,
    liveCount: item.liveCount,
    liveTime: Math.round(item.liveTime / 3600 * 100) / 100, // 時間
    avgStreamTime: item.liveCount > 0 ? Math.round(item.liveTime / item.liveCount / 60) : 0, // 分
    diamonds: data.revenue[index]?.diamonds || 0,
    views: data.viewer[index]?.viewCount || 0,
    efficiency: item.liveTime > 0 ? Math.round((data.revenue[index]?.diamonds || 0) / (item.liveTime / 3600)) : 0
  }));

  // ヘッダー
  const headers = ['日付', '配信回数', '総配信時間(時)', '平均配信時間(分)', 'ダイヤモンド', '視聴数', '時間効率(ダイヤ/時)'];
  
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.DARK } };
  });

  // データ行
  streamData.forEach((row, rowIndex) => {
    const values = [row.date, row.liveCount, row.liveTime, row.avgStreamTime, row.diamonds, row.views, row.efficiency];
    values.forEach((value, colIndex) => {
      const cell = worksheet.getCell(rowIndex + 2, colIndex + 1);
      cell.value = value;
      if (colIndex > 0) cell.numFmt = colIndex === 2 ? '0.00' : '#,##0';
    });
  });

  return worksheet;
};

/**
 * 7. 自動生成グラフシート（プリセットチャート付き）
 */
const createAutomatedChartsSheet = async (workbook: ExcelJS.Workbook, data: AnalyticsData) => {
  const worksheet = workbook.addWorksheet('グラフ', {
    properties: { tabColor: { argb: COLORS.PRIMARY } }
  });

  // チャート用データの準備
  const chartData = data.engagement.map((item, index) => {
    const activity = data.activity[index];
    const viewer = data.viewer[index];
    const revenue = data.revenue[index];
    
    // エンゲージメント率計算
    const totalEngagement = item.likes + (item.giftGivers || 0) + (item.commenters || 0) + (item.shares || 0);
    const engagementRate = viewer?.viewCount ? (totalEngagement / viewer.viewCount * 100) : 0;
    
    return {
      date: item.dateString,
      diamonds: revenue?.diamonds || 0,
      likes: item.likes,
      followers: item.newFollowers,
      views: viewer?.viewCount || 0,
      liveTime: activity ? Math.round(activity.liveTime / 3600 * 100) / 100 : 0, // 時間単位
      concurrent: viewer?.maxConcurrent || 0,
      engagement: Math.round(engagementRate * 100) / 100
    };
  });

  const headers = ['日付', 'ダイヤモンド', 'いいね', '新規フォロワー', '視聴数', '配信時間(時)', '同時視聴者', 'エンゲージメント率(%)'];
  
  // ヘッダー行を設定
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.PRIMARY } };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  // データ行を追加
  chartData.forEach((row, rowIndex) => {
    const values = [row.date, row.diamonds, row.likes, row.followers, row.views, row.liveTime, row.concurrent, row.engagement];
    values.forEach((value, colIndex) => {
      const cell = worksheet.getCell(rowIndex + 2, colIndex + 1);
      cell.value = value;
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      
      // 数値フォーマット
      if (colIndex > 0) {
        if (colIndex === 5) { // 配信時間
          cell.numFmt = '0.00';
        } else if (colIndex === 7) { // エンゲージメント率
          cell.numFmt = '0.00';
        } else {
          cell.numFmt = '#,##0';
        }
      }
      
      // 交互の行の背景色
      if (rowIndex % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.LIGHT } };
      }
    });
  });

  const dataEndRow = chartData.length + 1;
  
  // 列幅を調整
  worksheet.columns = [
    { width: 12 }, { width: 15 }, { width: 12 }, { width: 15 }, 
    { width: 12 }, { width: 15 }, { width: 15 }, { width: 18 }
  ];

  // Excel のテーブル機能を使用（自動フィルタ、ソート機能付き）
  const tableRange = `A1:H${dataEndRow}`;
  worksheet.addTable({
    name: 'ChartDataTable',
    ref: tableRange,
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyleMedium15', // TikTokカラーに近いテーマ
      showRowStripes: true
    },
    columns: headers.map(header => ({ name: header, filterButton: true })),
    rows: chartData.map(row => Object.values(row))
  });

  return worksheet;
};

/**
 * 8. 高度な分析シート
 */
const createAdvancedAnalysisSheet = async (
  workbook: ExcelJS.Workbook, 
  data: AnalyticsData, 
  kpis: KPIMetrics
) => {
  const worksheet = workbook.addWorksheet('高度な分析', {
    properties: { tabColor: { argb: COLORS.SUCCESS } }
  });

  // 成長率計算
  const midPoint = Math.floor(data.engagement.length / 2);
  const firstHalf = data.engagement.slice(0, midPoint);
  const secondHalf = data.engagement.slice(midPoint);

  const firstHalfAvgLikes = firstHalf.reduce((sum, item) => sum + item.likes, 0) / firstHalf.length;
  const secondHalfAvgLikes = secondHalf.reduce((sum, item) => sum + item.likes, 0) / secondHalf.length;
  const likesGrowthRate = ((secondHalfAvgLikes - firstHalfAvgLikes) / firstHalfAvgLikes * 100);

  // 高度な分析データ
  const analysisData = [
    ['分析項目', '値', '説明'],
    ['データ期間', `${data.engagement.length}日間`, '分析対象期間'],
    ['アクティブ率', `${(kpis.activeDays / data.engagement.length * 100).toFixed(1)}%`, '配信実施日の割合'],
    ['いいね成長率', `${likesGrowthRate.toFixed(1)}%`, '前半vs後半の成長率'],
    ['収益集中度', `${(Math.max(...data.revenue.map(r => r.diamonds)) / kpis.totalDiamonds * 100).toFixed(1)}%`, '最高日の収益シェア'],
    ['視聴者ロイヤリティ', `${(kpis.avgConcurrentViewers / (kpis.totalViews / data.viewer.length) * 100).toFixed(1)}%`, '同時視聴者/総視聴者比率'],
    ['配信効率スコア', Math.round(kpis.totalDiamonds / kpis.totalLiveTime * 3600), 'ダイヤモンド/秒'],
    ['エンゲージメント深度', `${(kpis.totalGiftGivers / kpis.totalViews * 100).toFixed(2)}%`, 'ギフト贈呈率']
  ];

  // ヘッダーとデータ
  analysisData.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const cell = worksheet.getCell(rowIndex + 1, colIndex + 1);
      cell.value = value;
      if (rowIndex === 0) {
        cell.font = { bold: true, color: { argb: COLORS.WHITE } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SUCCESS } };
      }
    });
  });

  // パフォーマンス予測
  const predictionStartRow = analysisData.length + 3;
  worksheet.getCell(predictionStartRow, 1).value = 'パフォーマンス予測（次週）';
  worksheet.getCell(predictionStartRow, 1).font = { bold: true, size: 14 };

  const recentAvg = data.engagement.slice(-7).reduce((sum, item) => sum + item.likes, 0) / 7;
  const predictions = [
    ['予想いいね数/日', Math.round(recentAvg * (1 + likesGrowthRate / 100))],
    ['予想収益/日', Math.round(kpis.totalDiamonds / kpis.activeDays * 1.1)],
    ['推奨配信時間', `${Math.round(kpis.avgLiveTimePerStream / 3600)}時間`],
    ['目標視聴者数', Math.round(kpis.avgConcurrentViewers * 1.2)]
  ];

  predictions.forEach((pred, index) => {
    worksheet.getCell(predictionStartRow + index + 1, 1).value = pred[0];
    worksheet.getCell(predictionStartRow + index + 1, 2).value = pred[1];
  });

  return worksheet;
};