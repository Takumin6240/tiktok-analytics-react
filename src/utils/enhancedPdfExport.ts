import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { AnalyticsData, KPIMetrics, ExportOptions, PerformanceInsight } from '@/types';
import { formatDurationShort, formatMinutes } from './analytics';
// フォント機能を一時的に無効化
// @ts-ignore
// import { addFileToVFS, addFont } from '@/assets/fonts/NotoSansJP-VariableFont_wght-normal.js';

/**
 * 強化されたPDF生成クラス - TikTokライブ分析ツール完全版
 */
export class EnhancedPDFExporter {
  private pdf: jsPDF;
  private currentY: number = 25;
  private pageHeight: number = 297; // A4の高さ (mm)
  private pageWidth: number = 210; // A4の幅 (mm)
  private margin: number = 20;
  private lineHeight: number = 6;
  private sectionSpacing: number = 15;
  private currentPage: number = 1;

  // TikTokカラーパレット
  private colors = {
    primary: [255, 0, 80],      // TikTok Pink
    secondary: [0, 242, 234],   // TikTok Cyan
    accent: [255, 215, 0],      // Gold
    dark: [22, 24, 35],         // Dark
    gray: [107, 114, 128],      // Gray
    success: [34, 197, 94],     // Green
    warning: [251, 191, 36],    // Yellow
    danger: [239, 68, 68],      // Red
  };

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // NotoSansJPフォント登録（一時的に無効化）
    // addFileToVFS('NotoSansJP', 'NotoSansJP-VariableFont_wght-normal');
    // addFont('NotoSansJP', 'NotoSansJP', 'normal');
    // this.pdf.setFont('NotoSansJP');
    
    // メタデータ設定
    this.setupDocument();
  }

  private setupDocument(): void {
    this.pdf.setFontSize(12);
    // this.pdf.setFont('NotoSansJP');
    this.pdf.setProperties({
      title: 'TikTok Live Analytics Report',
      subject: 'Comprehensive TikTok Live Stream Analysis',
      author: 'TikTok Analytics Dashboard',
      creator: 'React Analytics App'
    });
  }

  /**
   * 新しいページを追加
   */
  private addNewPage(): void {
    this.pdf.addPage();
    this.currentY = 25;
    this.currentPage++;
  }

  /**
   * ページブレイクのチェック
   */
  private checkPageBreak(requiredSpace: number = 25): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.addNewPage();
    }
  }

  /**
   * カラー設定
   */
  private setColor(colorName: keyof typeof this.colors): void {
    const [r, g, b] = this.colors[colorName];
    this.pdf.setTextColor(r, g, b);
  }

  /**
   * 背景色付きボックスを描画
   */
  private drawColoredBox(x: number, y: number, width: number, height: number, colorName: keyof typeof this.colors): void {
    const [r, g, b] = this.colors[colorName];
    this.pdf.setFillColor(r, g, b);
    this.pdf.rect(x, y, width, height, 'F');
  }

  /**
   * メインタイトル
   */
  private addMainTitle(): void {
    // 背景グラデーション風のボックス
    this.drawColoredBox(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), 25, 'primary');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('TikTok ライブ分析レポート', this.margin + 5, this.currentY + 10);
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`生成日時: ${format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: ja })}`, this.margin + 5, this.currentY + 18);
    
    this.currentY += 35;
    this.pdf.setTextColor(0, 0, 0); // 黒に戻す
  }

  /**
   * セクションヘッダー
   */
  private addSectionHeader(title: string, icon: string = '📊'): void {
    this.checkPageBreak(20);
    
    // セクション背景
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(this.margin, this.currentY - 2, this.pageWidth - (this.margin * 2), 12, 'F');
    
    this.setColor('dark');
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`${icon} ${title}`, this.margin + 3, this.currentY + 6);
    
    this.currentY += this.sectionSpacing;
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
  }

  /**
   * サブセクションヘッダー
   */
  private addSubHeader(title: string): void {
    this.checkPageBreak(15);
    this.setColor('primary');
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 10;
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
  }

  /**
   * KPIカードグリッド
   */
  private addKPIGrid(kpis: KPIMetrics): void {
    this.addSectionHeader('主要指標 (KPI)', '📈');
    
    const cardWidth = (this.pageWidth - (this.margin * 2) - 10) / 2;
    const cardHeight = 25;
    let currentX = this.margin;
    let cardCount = 0;

    const kpiData = [
      { label: '総ダイヤモンド', value: kpis.totalDiamonds.toLocaleString(), unit: '💎', color: 'primary' },
      { label: '総いいね数', value: kpis.totalLikes.toLocaleString(), unit: '❤️', color: 'danger' },
      { label: '新規フォロワー', value: kpis.totalFollowers.toLocaleString(), unit: '👥', color: 'success' },
      { label: '総視聴数', value: kpis.totalViews.toLocaleString(), unit: '👁️', color: 'secondary' },
      { label: 'ギフト贈呈者', value: kpis.totalGiftGivers.toLocaleString(), unit: '🎁', color: 'primary' },
      { label: 'コメント者', value: kpis.totalCommenters.toLocaleString(), unit: '💬', color: 'secondary' },
      { label: 'シェア数', value: kpis.totalShares.toLocaleString(), unit: '📤', color: 'success' },
      { label: '配信回数', value: kpis.totalLiveCount.toLocaleString(), unit: '📺', color: 'info' },
      { label: 'ユニーク視聴者', value: kpis.totalUniqueViewers.toLocaleString(), unit: '👤', color: 'warning' },
      { label: 'アクティブ日数', value: `${kpis.activeDays}日`, unit: '📅', color: 'warning' },
      { label: '総配信時間', value: `${Math.floor(kpis.totalLiveTime / 3600)}:${Math.floor((kpis.totalLiveTime % 3600) / 60).toString().padStart(2, '0')}`, unit: '⏰', color: 'gray' },
      { label: '平均視聴時間', value: `${Math.floor(kpis.avgViewTime / 60)}分`, unit: '⏱️', color: 'info' },
      { label: 'エンゲージメント率', value: `${kpis.avgEngagementRate.toFixed(1)}%`, unit: '📊', color: 'accent' },
      { label: '最高同時視聴', value: kpis.peakConcurrentViewers.toLocaleString(), unit: '🔥', color: 'primary' },
      { label: '平均同時視聴', value: Math.round(kpis.avgConcurrentViewers).toLocaleString(), unit: '👥', color: 'secondary' },
      { label: '配信あたり時間', value: `${Math.floor(kpis.avgLiveTimePerStream / 3600)}:${Math.floor((kpis.avgLiveTimePerStream % 3600) / 60).toString().padStart(2, '0')}`, unit: '📺', color: 'info' },
    ];

    kpiData.forEach((kpi) => {
      this.checkPageBreak(cardHeight + 5);
      
      // カード背景
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.rect(currentX, this.currentY, cardWidth, cardHeight, 'F');
      this.pdf.setDrawColor(230, 230, 230);
      this.pdf.rect(currentX, this.currentY, cardWidth, cardHeight, 'S');
      
      // カードヘッダー
      const headerColor = this.colors[kpi.color as keyof typeof this.colors] || this.colors.primary;
      this.pdf.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
      this.pdf.rect(currentX, this.currentY, cardWidth, 8, 'F');
      
      // テキスト
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(10);
      // this.pdf.setFont('NotoSansJP', 'normal');
      this.pdf.text(`${kpi.unit} ${kpi.label}`, currentX + 3, this.currentY + 5.5);
      
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFontSize(14);
      this.pdf.setFont('NotoSansJP', 'normal');
      this.pdf.text(kpi.value, currentX + 3, this.currentY + 17);
      
      cardCount++;
      
      // 次のカードの位置を計算
      if (cardCount % 2 === 0) {
        currentX = this.margin;
        this.currentY += cardHeight + 5;
      } else {
        currentX = this.margin + cardWidth + 5;
      }
    });

    // 奇数個の場合、最後の行を調整
    if (cardCount % 2 === 1) {
      this.currentY += cardHeight + 5;
    }

    this.currentY += 15;
  }

  /**
   * データサマリーテーブル
   */
  private addDataSummaryTable(data: AnalyticsData): void {
    this.addSectionHeader('日別データサマリー', '📋');
    
    // テーブルヘッダー
    const headers = ['日付', 'ダイヤ', 'いいね', 'フォロワー', 'ギフト贈呈', 'コメント', 'シェア', '視聴数', 'ユニーク', '平均視聴', '配信時間', '同時視聴', '平均同時'];
    const colWidths = [20, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15];
    const rowHeight = 8;
    
    // ヘッダー背景
    this.drawColoredBox(this.margin, this.currentY, this.pageWidth - (this.margin * 2), rowHeight, 'primary');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'bold');
    
    let currentX = this.margin + 2;
    headers.forEach((header, index) => {
      this.pdf.text(header, currentX, this.currentY + 5.5);
      currentX += colWidths[index];
    });
    
    this.currentY += rowHeight;
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    
    // データ行（最初の15日分）
    const maxRows = Math.min(15, data.engagement.length);
    for (let i = 0; i < maxRows; i++) {
      this.checkPageBreak(rowHeight + 2);
      
      const engagement = data.engagement[i];
      const revenue = data.revenue[i] || { diamonds: 0 };
      const activity = data.activity[i] || { liveTime: 0, liveCount: 0 };
      const viewer = data.viewer[i] || { viewCount: 0, uniqueViewers: 0, avgViewTime: 0, maxConcurrent: 0, avgConcurrent: 0 };
      
      // 行の背景（交互）
      if (i % 2 === 0) {
        this.pdf.setFillColor(248, 250, 252);
        this.pdf.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), rowHeight, 'F');
      }
      
      const rowData = [
        engagement.dateString,
        revenue.diamonds.toLocaleString(),
        engagement.likes.toLocaleString(),
        engagement.newFollowers.toString(),
        (engagement.giftGivers || 0).toString(),
        (engagement.commenters || 0).toString(),
        (engagement.shares || 0).toString(),
        viewer.viewCount.toLocaleString(),
        (viewer.uniqueViewers || 0).toString(),
        viewer.avgViewTime ? formatMinutes(viewer.avgViewTime) : '0分',
        formatDurationShort(activity.liveTime),
        viewer.maxConcurrent.toString(),
        viewer.avgConcurrent ? Math.round(viewer.avgConcurrent).toString() : '0',
      ];
      
      currentX = this.margin + 2;
      rowData.forEach((data, index) => {
        this.pdf.text(data, currentX, this.currentY + 5.5);
        currentX += colWidths[index];
      });
      
      this.currentY += rowHeight;
    }
    
    if (data.engagement.length > 15) {
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.text(`... 他 ${data.engagement.length - 15} 日分のデータ`, this.margin + 2, this.currentY + 5);
      this.currentY += 10;
    }
    
    this.currentY += 10;
  }

  /**
   * 統計分析セクション
   */
  private addStatisticalAnalysis(data: AnalyticsData, kpis: KPIMetrics): void {
    this.addSectionHeader('統計分析', '📊');
    
    // 期間分析
    this.addSubHeader('期間分析');
    
    const totalDays = data.engagement.length;
    const activeDays = kpis.activeDays;
    const inactiveDays = totalDays - activeDays;
    
    const periodStats = [
      `分析期間: ${totalDays}日間`,
      `配信実施日: ${activeDays}日 (${((activeDays / totalDays) * 100).toFixed(1)}%)`,
      `配信休止日: ${inactiveDays}日 (${((inactiveDays / totalDays) * 100).toFixed(1)}%)`,
      `平均配信頻度: ${(activeDays / (totalDays / 7)).toFixed(1)}日/週`,
    ];
    
    periodStats.forEach(stat => {
      this.pdf.text(`• ${stat}`, this.margin + 5, this.currentY);
      this.currentY += this.lineHeight;
    });
    
    this.currentY += 5;
    
    // パフォーマンス指標
    this.addSubHeader('パフォーマンス指標');
    
    const avgDiamondsPerDay = activeDays > 0 ? kpis.totalDiamonds / activeDays : 0;
    const avgLikesPerDay = activeDays > 0 ? kpis.totalLikes / activeDays : 0;
    const avgViewsPerDay = activeDays > 0 ? kpis.totalViews / activeDays : 0;
    const avgLiveTimePerDay = activeDays > 0 ? (kpis.totalLiveTime / 3600) / activeDays : 0;
    
    const performanceStats = [
      `日平均ダイヤモンド: ${Math.round(avgDiamondsPerDay).toLocaleString()}`,
      `日平均いいね数: ${Math.round(avgLikesPerDay).toLocaleString()}`,
      `日平均視聴数: ${Math.round(avgViewsPerDay).toLocaleString()}`,
      `日平均配信時間: ${avgLiveTimePerDay.toFixed(1)}時間`,
      `収益効率: ${(kpis.totalDiamonds / (kpis.totalLiveTime / 3600)).toFixed(0)}ダイヤ/時間`,
    ];
    
    performanceStats.forEach(stat => {
      this.pdf.text(`• ${stat}`, this.margin + 5, this.currentY);
      this.currentY += this.lineHeight;
    });
    
    this.currentY += 10;
  }

  /**
   * トレンド分析
   */
  private addTrendAnalysis(data: AnalyticsData): void {
    this.addSectionHeader('トレンド分析', '📈');
    
    // 前半・後半比較
    const midPoint = Math.floor(data.engagement.length / 2);
    const firstHalf = data.engagement.slice(0, midPoint);
    const secondHalf = data.engagement.slice(midPoint);
    
    const firstHalfRevenue = data.revenue.slice(0, midPoint);
    const secondHalfRevenue = data.revenue.slice(midPoint);
    
    const firstHalfViewer = data.viewer.slice(0, midPoint);
    const secondHalfViewer = data.viewer.slice(midPoint);
    
    // 計算
    const firstHalfLikes = firstHalf.reduce((sum, item) => sum + item.likes, 0);
    const secondHalfLikes = secondHalf.reduce((sum, item) => sum + item.likes, 0);
    const likesGrowth = firstHalfLikes > 0 ? ((secondHalfLikes - firstHalfLikes) / firstHalfLikes * 100) : 0;
    
    const firstHalfDiamonds = firstHalfRevenue.reduce((sum, item) => sum + item.diamonds, 0);
    const secondHalfDiamonds = secondHalfRevenue.reduce((sum, item) => sum + item.diamonds, 0);
    const diamondsGrowth = firstHalfDiamonds > 0 ? ((secondHalfDiamonds - firstHalfDiamonds) / firstHalfDiamonds * 100) : 0;
    
    const firstHalfViews = firstHalfViewer.reduce((sum, item) => sum + item.viewCount, 0);
    const secondHalfViews = secondHalfViewer.reduce((sum, item) => sum + item.viewCount, 0);
    const viewsGrowth = firstHalfViews > 0 ? ((secondHalfViews - firstHalfViews) / firstHalfViews * 100) : 0;
    
    const trendData = [
      { metric: 'いいね数', growth: likesGrowth },
      { metric: 'ダイヤモンド', growth: diamondsGrowth },
      { metric: '視聴数', growth: viewsGrowth },
    ];
    
    this.pdf.text('期間比較 (前半 vs 後半):', this.margin, this.currentY);
    this.currentY += 8;
    
    trendData.forEach(({ metric, growth }) => {
      const growthText = growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
      const growthColor = growth > 0 ? 'success' : growth < 0 ? 'danger' : 'gray';
      
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(`• ${metric}: `, this.margin + 5, this.currentY);
      
      this.setColor(growthColor);
      this.pdf.text(growthText, this.margin + 35, this.currentY);
      
      const arrow = growth > 0 ? ' ↗' : growth < 0 ? ' ↘' : ' →';
      this.pdf.text(arrow, this.margin + 55, this.currentY);
      
      this.currentY += this.lineHeight;
    });
    
    this.pdf.setTextColor(0, 0, 0);
    this.currentY += 10;
  }

  /**
   * 推奨事項
   */
  private addRecommendations(insights: PerformanceInsight[]): void {
    this.addSectionHeader('推奨事項・改善提案', '💡');
    
    if (insights.length === 0) {
      this.pdf.text('現在、特別な推奨事項はありません。', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }
    
    insights.forEach((insight) => {
      this.checkPageBreak(20);
      
      // アイコンと色の設定
      const iconMap = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
      };
      
      const colorMap = {
        success: 'success',
        warning: 'warning',
        error: 'danger',
        info: 'secondary'
      };
      
      const icon = iconMap[insight.type];
      const color = colorMap[insight.type];
      
      // タイトル
      this.setColor(color as keyof typeof this.colors);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${icon} ${insight.title}`, this.margin, this.currentY);
      this.currentY += 7;
      
      // 説明
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFont('helvetica', 'normal');
      const descriptionLines = this.splitText(insight.description, this.pageWidth - (this.margin * 2) - 10);
      descriptionLines.forEach(line => {
        this.pdf.text(line, this.margin + 5, this.currentY);
        this.currentY += this.lineHeight;
      });
      
      // 推奨事項
      if (insight.recommendation) {
        this.setColor('primary');
        this.pdf.setFont('helvetica', 'italic');
        const recommendationLines = this.splitText(`推奨: ${insight.recommendation}`, this.pageWidth - (this.margin * 2) - 10);
        recommendationLines.forEach(line => {
          this.pdf.text(line, this.margin + 5, this.currentY);
          this.currentY += this.lineHeight;
        });
      }
      
      this.currentY += 5;
    });
    
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
  }

  /**
   * テキストを指定幅で分割
   */
  private splitText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = this.pdf.getTextWidth(testLine);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  /**
   * フッター
   */
  private addFooter(): void {
    const pageCount = this.pdf.internal.pages.length - 1;
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      // ページ番号
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(128, 128, 128);
      this.pdf.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - 30,
        this.pageHeight - 10
      );
      
      // フッターライン
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);
      
      // ロゴ・ブランド
      this.pdf.setFontSize(8);
      this.pdf.text('TikTok Analytics Dashboard - データドリブンな配信戦略をサポート', this.margin, this.pageHeight - 5);
    }
  }

  /**
   * メイン生成メソッド
   */
  async generateEnhancedPDF(
    data: AnalyticsData,
    kpis: KPIMetrics,
    insights: PerformanceInsight[],
    options: ExportOptions = {
      format: 'pdf',
      includeCharts: false, // チャートは後で実装
      sections: {
        summary: true,
        engagement: true,
        revenue: true,
        activity: true,
        viewer: true,
        trends: true,
      }
    }
  ): Promise<void> {
    // メインタイトル
    this.addMainTitle();
    
    // KPIグリッド
    if (options.sections.summary) {
      this.addKPIGrid(kpis);
    }
    
    // データサマリーテーブル
    if (options.sections.engagement) {
      this.addDataSummaryTable(data);
    }
    
    // 統計分析
    if (options.sections.trends) {
      this.addStatisticalAnalysis(data, kpis);
    }
    
    // トレンド分析
    if (options.sections.trends) {
      this.addTrendAnalysis(data);
    }
    
    // 推奨事項
    this.addRecommendations(insights);
    
    // フッター
    this.addFooter();
  }

  /**
   * PDFを保存
   */
  save(filename: string = `tiktok-analytics-enhanced-${format(new Date(), 'yyyyMMdd-HHmm')}.pdf`): void {
    this.pdf.save(filename);
  }

  /**
   * PDFをBlob形式で取得
   */
  getBlob(): Blob {
    return this.pdf.output('blob');
  }
}

/**
 * 強化されたPDF生成のヘルパー関数
 */
export async function exportEnhancedPDF(
  data: AnalyticsData,
  kpis: KPIMetrics,
  insights: PerformanceInsight[],
  options: ExportOptions = {
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
  }
): Promise<void> {
  const exporter = new EnhancedPDFExporter();
  await exporter.generateEnhancedPDF(data, kpis, insights, options);
  
  const filename = options.dateRange 
    ? `tiktok-analytics-enhanced-${format(options.dateRange.start, 'yyyyMMdd')}-${format(options.dateRange.end, 'yyyyMMdd')}.pdf`
    : `tiktok-analytics-enhanced-${format(new Date(), 'yyyyMMdd-HHmm')}.pdf`;
  
  exporter.save(filename);
}

/**
 * 簡単な強化PDF生成（デフォルト設定）
 */
export async function quickExportEnhancedPDF(
  data: AnalyticsData,
  kpis: KPIMetrics,
  insights: PerformanceInsight[]
): Promise<void> {
  return exportEnhancedPDF(data, kpis, insights);
}

/**
 * 詳細レポートPDF生成
 */
export async function exportDetailedReportPDF(
  data: AnalyticsData,
  kpis: KPIMetrics,
  insights: PerformanceInsight[],
  includeAllSections: boolean = true
): Promise<void> {
  const options: ExportOptions = {
    format: 'pdf',
    includeCharts: false,
    sections: {
      summary: includeAllSections,
      engagement: includeAllSections,
      revenue: includeAllSections,
      activity: includeAllSections,
      viewer: includeAllSections,
      trends: includeAllSections,
    }
  };
  
  return exportEnhancedPDF(data, kpis, insights, options);
}

/**
 * 追加の分析機能
 */
export class AdvancedAnalytics {
  /**
   * 配信パフォーマンス評価
   */
  static evaluateStreamPerformance(data: AnalyticsData, kpis: KPIMetrics): {
    score: number;
    grade: string;
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];
    
    // エンゲージメント率の評価 (30点)
    if (kpis.avgEngagementRate > 20) {
      score += 30;
      feedback.push('✅ 非常に高いエンゲージメント率を維持しています');
    } else if (kpis.avgEngagementRate > 10) {
      score += 20;
      feedback.push('✅ 良好なエンゲージメント率です');
    } else if (kpis.avgEngagementRate > 5) {
      score += 10;
      feedback.push('⚠️ エンゲージメント率の改善が必要です');
    } else {
      feedback.push('❌ エンゲージメント率が低すぎます');
    }
    
    // 配信頻度の評価 (25点)
    const totalDays = data.engagement.length;
    const frequency = kpis.activeDays / totalDays;
    if (frequency > 0.8) {
      score += 25;
      feedback.push('✅ 高い配信頻度を維持しています');
    } else if (frequency > 0.5) {
      score += 15;
      feedback.push('✅ 適度な配信頻度です');
    } else if (frequency > 0.3) {
      score += 10;
      feedback.push('⚠️ 配信頻度を上げることをお勧めします');
    } else {
      feedback.push('❌ 配信頻度が不足しています');
    }
    
    // 収益効率の評価 (25点)
    const revenuePerHour = kpis.totalLiveTime > 0 ? kpis.totalDiamonds / (kpis.totalLiveTime / 3600) : 0;
    if (revenuePerHour > 2000) {
      score += 25;
      feedback.push('✅ 非常に高い収益効率です');
    } else if (revenuePerHour > 1000) {
      score += 15;
      feedback.push('✅ 良好な収益効率です');
    } else if (revenuePerHour > 500) {
      score += 10;
      feedback.push('⚠️ 収益効率の改善余地があります');
    } else {
      feedback.push('❌ 収益効率が低すぎます');
    }
    
    // 視聴者維持の評価 (20点)
    const avgConcurrentViewers = data.viewer.length > 0 
      ? data.viewer.reduce((sum, item) => sum + item.avgConcurrent, 0) / data.viewer.length 
      : 0;
    const peakConcurrentViewers = kpis.peakConcurrentViewers;
    const retentionRate = peakConcurrentViewers > 0 ? (avgConcurrentViewers / peakConcurrentViewers) * 100 : 0;
    
    if (retentionRate > 70) {
      score += 20;
      feedback.push('✅ 優秀な視聴者維持率です');
    } else if (retentionRate > 50) {
      score += 15;
      feedback.push('✅ 良好な視聴者維持率です');
    } else if (retentionRate > 30) {
      score += 10;
      feedback.push('⚠️ 視聴者維持率の改善が必要です');
    } else {
      feedback.push('❌ 視聴者維持率が低すぎます');
    }
    
    // グレード判定
    let grade: string;
    if (score >= 90) grade = 'S';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 50) grade = 'D';
    else grade = 'F';
    
    return { score, grade, feedback };
  }
  
  /**
   * 成長トレンド分析
   */
  static analyzeGrowthTrend(data: AnalyticsData): {
    trend: 'growing' | 'stable' | 'declining';
    growthRate: number;
    bestMetric: string;
    worstMetric: string;
  } {
    const midPoint = Math.floor(data.engagement.length / 2);
    
    // 各指標の成長率を計算
    const metrics = [
      {
        name: 'いいね数',
        firstHalf: data.engagement.slice(0, midPoint).reduce((sum, item) => sum + item.likes, 0),
        secondHalf: data.engagement.slice(midPoint).reduce((sum, item) => sum + item.likes, 0)
      },
      {
        name: 'ダイヤモンド',
        firstHalf: data.revenue.slice(0, midPoint).reduce((sum, item) => sum + item.diamonds, 0),
        secondHalf: data.revenue.slice(midPoint).reduce((sum, item) => sum + item.diamonds, 0)
      },
      {
        name: '視聴数',
        firstHalf: data.viewer.slice(0, midPoint).reduce((sum, item) => sum + item.viewCount, 0),
        secondHalf: data.viewer.slice(midPoint).reduce((sum, item) => sum + item.viewCount, 0)
      }
    ];
    
    const growthRates = metrics.map(metric => ({
      name: metric.name,
      rate: metric.firstHalf > 0 ? ((metric.secondHalf - metric.firstHalf) / metric.firstHalf) * 100 : 0
    }));
    
    const avgGrowthRate = growthRates.reduce((sum, item) => sum + item.rate, 0) / growthRates.length;
    
    let trend: 'growing' | 'stable' | 'declining';
    if (avgGrowthRate > 10) trend = 'growing';
    else if (avgGrowthRate > -10) trend = 'stable';
    else trend = 'declining';
    
    const bestMetric = growthRates.reduce((best, current) => 
      current.rate > best.rate ? current : best
    ).name;
    
    const worstMetric = growthRates.reduce((worst, current) => 
      current.rate < worst.rate ? current : worst
    ).name;
    
    return {
      trend,
      growthRate: avgGrowthRate,
      bestMetric,
      worstMetric
    };
  }
}