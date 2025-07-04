import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { AnalyticsData, KPIMetrics, ExportOptions, PerformanceInsight } from '@/types';
import { formatDuration } from './analytics';
// フォント機能を一時的に無効化
// @ts-ignore
// import { addFileToVFS, addFont } from '@/assets/fonts/NotoSansJP-VariableFont_wght-normal.js';

/**
 * PDF生成のメインクラス
 */
export class PDFExporter {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4の高さ (mm)
  private margin: number = 20;
  private lineHeight: number = 7;

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
    this.setupFonts();
  }

  private setupFonts(): void {
    this.pdf.setFontSize(12);
    // this.pdf.setFont('NotoSansJP');
  }

  /**
   * 新しいページを追加
   */
  private addNewPage(): void {
    this.pdf.addPage();
    this.currentY = 20;
  }

  /**
   * Y座標をチェックして必要に応じて改ページ
   */
  private checkPageBreak(requiredSpace: number = 20): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.addNewPage();
    }
  }

  /**
   * タイトルを追加
   */
  private addTitle(title: string): void {
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 15;
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
  }

  /**
   * セクションヘッダーを追加
   */
  private addSectionHeader(header: string): void {
    this.checkPageBreak(15);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(header, this.margin, this.currentY);
    this.currentY += 10;
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
  }

  /**
   * テキストを追加
   */
  private addText(text: string, indent: number = 0): void {
    this.checkPageBreak();
    this.pdf.text(text, this.margin + indent, this.currentY);
    this.currentY += this.lineHeight;
  }

  /**
   * KPIサマリーを追加
   */
  private addKPISummary(kpis: KPIMetrics): void {
    this.addSectionHeader('KPI Summary');
    
    const kpiData = [
      ['Total Diamonds', kpis.totalDiamonds.toLocaleString()],
      ['Total Likes', kpis.totalLikes.toLocaleString()],
      ['Total New Followers', kpis.totalFollowers.toLocaleString()],
      ['Total Views', kpis.totalViews.toLocaleString()],
      ['Total Gift Givers', kpis.totalGiftGivers.toLocaleString()],
      ['Total Commenters', kpis.totalCommenters.toLocaleString()],
      ['Total Shares', kpis.totalShares.toLocaleString()],
      ['Total Live Count', kpis.totalLiveCount.toLocaleString()],
      ['Total Unique Viewers', kpis.totalUniqueViewers.toLocaleString()],
      ['Active Days', kpis.activeDays.toString()],
      ['Total Live Time', formatDuration(kpis.totalLiveTime)],
      ['Avg View Time', formatDuration(kpis.avgViewTime)],
      ['Avg Live Time per Stream', formatDuration(kpis.avgLiveTimePerStream)],
      ['Avg Engagement Rate (%)', kpis.avgEngagementRate.toFixed(2)],
      ['Avg Revenue per Stream', Math.round(kpis.avgRevenuePerStream).toLocaleString()],
      ['Peak Concurrent Viewers', kpis.peakConcurrentViewers.toLocaleString()],
      ['Avg Concurrent Viewers', Math.round(kpis.avgConcurrentViewers).toLocaleString()],
    ];

    kpiData.forEach(([label, value]) => {
      this.addText(`${label}: ${value}`);
    });

    this.currentY += 10;
  }

  /**
   * パフォーマンス洞察を追加
   */
  private addInsights(insights: PerformanceInsight[]): void {
    this.addSectionHeader('Performance Insights');
    
    insights.forEach((insight) => {
      this.checkPageBreak(25);
      
      const typeIcon = insight.type === 'success' ? '✓' : 
                      insight.type === 'warning' ? '⚠' : 
                      insight.type === 'error' ? '✗' : 'ℹ';
      
      this.pdf.setFont('helvetica', 'bold');
      this.addText(`${typeIcon} ${insight.title}`);
      this.pdf.setFont('helvetica', 'normal');
      this.addText(insight.description, 5);
      
      if (insight.recommendation) {
        this.addText(`Recommendation: ${insight.recommendation}`, 5);
      }
      
      this.currentY += 5;
    });
  }

  /**
   * データテーブルを追加
   */
  private addDataTable(data: AnalyticsData): void {
    this.addSectionHeader('Daily Data Summary');
    // 追加項目を含めたヘッダー
    this.addText('Date | Diamonds | Likes | Followers | Gift Givers | Commenters | Shares | Views | Unique Viewers | Avg View Time | Live Time | Live Count | Max Concurrent | Avg Concurrent');
    this.addText('-----|----------|-------|-----------|-------------|------------|-------|------|---------------|--------------|----------|-----------|---------------|--------------');
    const sampleData = data.engagement.slice(0, 10);
    sampleData.forEach((item, index) => {
      const revenue = data.revenue[index]?.diamonds || 0;
      const views = data.viewer[index]?.viewCount || 0;
      const uniqueViewers = data.viewer[index]?.uniqueViewers || 0;
      const avgViewTime = data.viewer[index]?.avgViewTime || 0;
      const maxConcurrent = data.viewer[index]?.maxConcurrent || 0;
      const avgConcurrent = data.viewer[index]?.avgConcurrent || 0;
      const liveTime = data.activity[index]?.liveTime || 0;
      const liveCount = data.activity[index]?.liveCount || 0;
      const row = `${item.dateString} | ${revenue} | ${item.likes} | ${item.newFollowers} | ${(item.giftGivers || 0)} | ${(item.commenters || 0)} | ${(item.shares || 0)} | ${views} | ${uniqueViewers} | ${Math.floor(avgViewTime / 60)}min | ${Math.floor(liveTime / 3600)}:${Math.floor((liveTime % 3600) / 60).toString().padStart(2, '0')} | ${liveCount} | ${maxConcurrent} | ${Math.round(avgConcurrent)}`;
      this.addText(row);
    });
    if (data.engagement.length > 10) {
      this.addText(`... and ${data.engagement.length - 10} more days`);
    }
  }

  /**
   * チャート画像を追加
   */
  private async addChartImage(chartElement: HTMLElement, title: string): Promise<void> {
    try {
      this.checkPageBreak(80);
      
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: chartElement.offsetWidth,
        height: chartElement.offsetHeight,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 170; // PDF内での画像幅
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      this.addText(title);
      this.currentY += 5;
      
      this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
      this.currentY += imgHeight + 10;
    } catch (error) {
      console.error('Chart image generation failed:', error);
      this.addText(`[Chart: ${title} - Image generation failed]`);
    }
  }

  /**
   * メインの生成メソッド
   */
  async generatePDF(
    data: AnalyticsData,
    kpis: KPIMetrics,
    insights: PerformanceInsight[],
    options: ExportOptions
  ): Promise<void> {
    // タイトルページ
    this.addTitle('TikTok Live Analytics Report');
    this.addText(`Generated on: ${format(new Date(), 'yyyy/MM/dd HH:mm', { locale: ja })}`);
    this.currentY += 10;

    // KPIサマリー
    if (options.sections.summary) {
      this.addKPISummary(kpis);
    }

    // パフォーマンス洞察
    if (options.sections.trends && insights.length > 0) {
      this.addInsights(insights);
    }

    // データテーブル
    if (options.sections.engagement) {
      this.addDataTable(data);
    }

    // チャート（オプション）
    if (options.includeCharts) {
      await this.addChartsFromDOM();
    }

    // フッター
    this.addFooter();
  }

  /**
   * DOMからチャートを取得して追加
   */
  private async addChartsFromDOM(): Promise<void> {
    const chartElements = document.querySelectorAll('[data-chart]');
    
    for (const element of chartElements) {
      const chartTitle = element.getAttribute('data-chart-title') || 'Chart';
      await this.addChartImage(element as HTMLElement, chartTitle);
    }
  }

  /**
   * フッターを追加
   */
  private addFooter(): void {
    const pageCount = this.pdf.internal.pages.length - 1;
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(10);
      this.pdf.text(
        `Page ${i} of ${pageCount}`,
        this.pdf.internal.pageSize.width - 30,
        this.pdf.internal.pageSize.height - 10
      );
    }
  }

  /**
   * PDFを保存
   */
  save(filename: string = 'tiktok-analytics-report.pdf'): void {
    this.pdf.save(filename);
  }

  /**
   * PDFをBlob形式で取得
   */
  getBlob(): Blob {
    return this.pdf.output('blob');
  }
}/**
 * PDF生成のヘルパー関数
 */
export async function exportToPDF(
  data: AnalyticsData,
  kpis: KPIMetrics,
  insights: PerformanceInsight[],
  options: ExportOptions = {
    format: 'pdf',
    includeCharts: true,
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
  const exporter = new PDFExporter();
  await exporter.generatePDF(data, kpis, insights, options);
  
  const filename = options.dateRange 
    ? `tiktok-analytics-${format(options.dateRange.start, 'yyyyMMdd')}-${format(options.dateRange.end, 'yyyyMMdd')}.pdf`
    : `tiktok-analytics-${format(new Date(), 'yyyyMMdd')}.pdf`;
  
  exporter.save(filename);
}

/**
 * 簡単なPDF生成（デフォルト設定）
 */
export async function quickExportPDF(
  data: AnalyticsData,
  kpis: KPIMetrics,
  insights: PerformanceInsight[]
): Promise<void> {
  return exportToPDF(data, kpis, insights);
}

/**
 * チャートのみのPDF生成
 */
export async function exportChartsPDF(title: string = 'TikTok Analytics Charts'): Promise<void> {
  const exporter = new PDFExporter();
  
  // タイトルを追加
  exporter['addTitle'](title);
  
  // チャートを追加
  await exporter['addChartsFromDOM']();
  
  exporter.save('tiktok-analytics-charts.pdf');
}