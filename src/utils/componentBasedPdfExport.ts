import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { AnalyticsData, KPIMetrics, PerformanceInsight, ExportOptions } from '@/types';

/**
 * Component-based PDF Export - Webページと同じ形式で出力
 * 実際のReactコンポーネントを描画してPDFに変換
 */
export class ComponentBasedPDFExporter {
  private pdf: jsPDF;
  private currentY: number = 0;
  private pageWidth: number = 210; // A4の幅 (mm)
  private pageHeight: number = 297; // A4の高さ (mm)
  private margin: number = 10;
  private scale: number = 0.75; // 画像のスケール調整

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    
    this.setupDocument();
  }

  private setupDocument(): void {
    // PDFメタデータ設定
    this.pdf.setProperties({
      title: 'TikTok ライブ分析レポート',
      subject: 'TikTok ライブ配信の包括的分析',
      author: 'TikTok Analytics Dashboard',
      creator: 'React Analytics App',
      keywords: 'TikTok, Analytics, Live Stream, Performance'
    });
  }

  /**
   * 新しいページを追加
   */
  private addNewPage(): void {
    this.pdf.addPage();
    this.currentY = 0;
  }

  /**
   * ページに画像を追加（自動改ページ対応）
   */
  private addImageToPage(imgData: string, imgWidth: number, imgHeight: number): void {
    const availableHeight = this.pageHeight - this.margin * 2;
    const remainingHeight = availableHeight - this.currentY;

    // 画像が現在のページに収まらない場合は新しいページを作成
    if (imgHeight > remainingHeight && this.currentY > 0) {
      this.addNewPage();
    }

    // 画像を追加
    this.pdf.addImage(
      imgData,
      'PNG',
      this.margin,
      this.currentY + this.margin,
      imgWidth,
      imgHeight
    );

    this.currentY += imgHeight + 5; // 次の要素との間隔
  }

  /**
   * DOMエレメントをキャンバスに描画してPDFに追加
   */
  private async captureAndAddElement(
    element: HTMLElement,
    maxWidth: number = this.pageWidth - this.margin * 2
  ): Promise<void> {
    try {
      // 要素をキャンバスに描画
      const canvas = await html2canvas(element, {
        scale: 2, // 高解像度で描画
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // クローンされたドキュメント内の要素のスタイルを調整
          const clonedElement = clonedDoc.querySelector('[data-pdf-capture]');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.transform = 'none';
            (clonedElement as HTMLElement).style.boxShadow = 'none';
          }
        }
      });

      // キャンバスをPDFに追加
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = Math.min(maxWidth, canvas.width * this.scale / 3.78); // px to mm conversion
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      this.addImageToPage(imgData, imgWidth, imgHeight);
    } catch (error) {
      console.error('Failed to capture element:', error);
      throw error;
    }
  }

  /**
   * タイトルページを追加
   */
  private addTitlePage(): void {
    // タイトル
    this.pdf.setFontSize(28);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(255, 0, 80); // TikTok Primary
    this.pdf.text('TikTok ライブ分析レポート', this.pageWidth / 2, 60, { align: 'center' });

    // 副題
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('包括的パフォーマンス分析', this.pageWidth / 2, 75, { align: 'center' });

    // 日付
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(128, 128, 128);
    const dateStr = format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: ja });
    this.pdf.text(`生成日時: ${dateStr}`, this.pageWidth / 2, 90, { align: 'center' });

    // 装飾線
    this.pdf.setDrawColor(255, 0, 80);
    this.pdf.setLineWidth(2);
    this.pdf.line(this.pageWidth / 2 - 50, 100, this.pageWidth / 2 + 50, 100);

    // サービス名
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 242, 234); // TikTok Secondary
    this.pdf.text('TikTok Analytics Dashboard', this.pageWidth / 2, 280, { align: 'center' });

    this.currentY = 120;
  }

  /**
   * Excel風のデータテーブルを作成
   */
  private createExcelStyleTable(data: AnalyticsData): void {
    const tableHeaders = [
      '日付', 'ダイヤモンド', 'いいね', '新規フォロワー', 'ギフト贈呈者', 'コメント者',
      'シェア', '視聴数', 'ユニーク視聴者', '最高同時視聴', '平均同時視聴', '配信時間(分)', '配信回数'
    ];

    const colWidths = [18, 16, 12, 16, 16, 14, 10, 14, 16, 16, 16, 16, 12];
    const rowHeight = 6;
    const startY = this.currentY + this.margin;

    // ヘッダー
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFillColor(245, 245, 245);
    this.pdf.rect(this.margin, startY, this.pageWidth - this.margin * 2, rowHeight, 'F');
    
    let currentX = this.margin + 1;
    tableHeaders.forEach((header, index) => {
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(header, currentX, startY + 4, { maxWidth: colWidths[index] - 2 });
      currentX += colWidths[index];
    });

    this.currentY = startY + rowHeight;

    // データ行
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(7);

    const maxRowsPerPage = Math.floor((this.pageHeight - this.currentY - this.margin * 2) / rowHeight);
    let currentRowIndex = 0;
    const totalRows = data.engagement.length;

    while (currentRowIndex < totalRows) {
      const rowsToShow = Math.min(maxRowsPerPage, totalRows - currentRowIndex);
      
      for (let i = 0; i < rowsToShow; i++) {
        const dataIndex = currentRowIndex + i;
        const engagement = data.engagement[dataIndex];
        const revenue = data.revenue[dataIndex] || { diamonds: 0 };
        const activity = data.activity[dataIndex] || { liveTime: 0, liveCount: 0 };
        const viewer = data.viewer[dataIndex] || { 
          viewCount: 0, uniqueViewers: 0, maxConcurrent: 0, avgConcurrent: 0 
        };

        // 行の背景色（交互）
        if (i % 2 === 0) {
          this.pdf.setFillColor(250, 250, 250);
          this.pdf.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, rowHeight, 'F');
        }

        const rowData = [
          engagement.dateString,
          revenue.diamonds?.toLocaleString() || '0',
          engagement.likes?.toLocaleString() || '0',
          engagement.newFollowers?.toString() || '0',
          engagement.giftGivers?.toString() || '0',
          engagement.commenters?.toString() || '0',
          engagement.shares?.toString() || '0',
          viewer.viewCount?.toLocaleString() || '0',
          viewer.uniqueViewers?.toString() || '0',
          viewer.maxConcurrent?.toString() || '0',
          viewer.avgConcurrent ? Math.round(viewer.avgConcurrent).toString() : '0',
          activity.liveTime ? Math.round(activity.liveTime / 60).toString() : '0',
          activity.liveCount?.toString() || '0'
        ];

        currentX = this.margin + 1;
        this.pdf.setTextColor(0, 0, 0);
        
        rowData.forEach((cellData, colIndex) => {
          this.pdf.text(cellData, currentX, this.currentY + 4, { maxWidth: colWidths[colIndex] - 2 });
          currentX += colWidths[colIndex];
        });

        this.currentY += rowHeight;
      }

      currentRowIndex += rowsToShow;

      // 次のページが必要な場合
      if (currentRowIndex < totalRows) {
        this.addNewPage();
        this.currentY = this.margin;
        
        // 次のページにもヘッダーを追加
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setFillColor(245, 245, 245);
        this.pdf.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, rowHeight, 'F');
        
        currentX = this.margin + 1;
        tableHeaders.forEach((header, index) => {
          this.pdf.setTextColor(0, 0, 0);
          this.pdf.text(header, currentX, this.currentY + 4, { maxWidth: colWidths[index] - 2 });
          currentX += colWidths[index];
        });

        this.currentY += rowHeight;
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setFontSize(7);
      }
    }

    this.currentY += 10;
  }

  /**
   * メイン生成メソッド
   */
  async generateComponentBasedPDF(
    data: AnalyticsData,
    _kpis: KPIMetrics,
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
    try {
      // タイトルページ
      this.addTitlePage();

      // KPIカード（Web版と同じレイアウト）
      if (options.sections.summary) {
        const kpiElements = document.querySelectorAll('[data-kpi-card]');
        if (kpiElements.length > 0) {
          // 新しいページを追加
          this.addNewPage();
          this.currentY = this.margin;
          
          // セクションタイトル
          this.pdf.setFontSize(18);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.setTextColor(255, 0, 80);
          this.pdf.text('📈 主要指標 (KPI)', this.margin, this.currentY + 15);
          this.currentY += 25;

          // KPIカードを4つずつ描画
          const kpiArray = Array.from(kpiElements);
          for (let i = 0; i < kpiArray.length; i += 4) {
            const rowElements = kpiArray.slice(i, i + 4);
            
            // 4つのKPIカードを含むコンテナを作成
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.flexWrap = 'wrap';
            container.style.gap = '16px';
            container.style.padding = '16px';
            container.style.backgroundColor = '#ffffff';
            container.style.width = '800px';
            container.setAttribute('data-pdf-capture', 'true');
            
            rowElements.forEach(element => {
              const clone = element.cloneNode(true) as HTMLElement;
              clone.style.width = '180px';
              clone.style.flex = '1';
              container.appendChild(clone);
            });

            document.body.appendChild(container);
            
            try {
              await this.captureAndAddElement(container);
            } finally {
              document.body.removeChild(container);
            }
          }
        }
      }

      // パフォーマンス洞察
      if (insights.length > 0) {
        const insightElements = document.querySelectorAll('[data-insight]');
        if (insightElements.length > 0) {
          this.addNewPage();
          this.currentY = this.margin;
          
          // セクションタイトル
          this.pdf.setFontSize(18);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.setTextColor(255, 0, 80);
          this.pdf.text('💡 パフォーマンス洞察', this.margin, this.currentY + 15);
          this.currentY += 25;

          // 洞察要素を描画
          for (const element of insightElements) {
            await this.captureAndAddElement(element as HTMLElement);
          }
        }
      }

      // チャート
      if (options.includeCharts && options.sections.trends) {
        const chartElements = document.querySelectorAll('[data-chart]');
        if (chartElements.length > 0) {
          this.addNewPage();
          this.currentY = this.margin;
          
          // セクションタイトル
          this.pdf.setFontSize(18);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.setTextColor(255, 0, 80);
          this.pdf.text('📊 トレンド分析', this.margin, this.currentY + 15);
          this.currentY += 25;

          // チャートを描画
          for (const element of chartElements) {
            await this.captureAndAddElement(element as HTMLElement);
          }
        }
      }

      // Excel風データテーブル
      if (options.sections.engagement) {
        this.addNewPage();
        this.currentY = this.margin;
        
        // セクションタイトル
        this.pdf.setFontSize(18);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(255, 0, 80);
        this.pdf.text('📋 全期間データ一覧', this.margin, this.currentY + 15);
        this.currentY += 25;

        this.createExcelStyleTable(data);
      }

      // フッターを各ページに追加
      this.addFooterToAllPages();

    } catch (error) {
      console.error('PDF generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      throw new Error('PDF生成に失敗しました: ' + errorMessage);
    }
  }

  /**
   * 全ページにフッターを追加
   */
  private addFooterToAllPages(): void {
    const totalPages = this.pdf.internal.pages.length - 1;
    
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      
      // フッターライン
      this.pdf.setDrawColor(230, 230, 230);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);
      
      // ページ番号
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(128, 128, 128);
      this.pdf.text(
        `${i} / ${totalPages}`,
        this.pageWidth - this.margin - 10,
        this.pageHeight - 10,
        { align: 'right' }
      );
      
      // ブランド名
      this.pdf.setFontSize(8);
      this.pdf.text(
        'TikTok Analytics Dashboard',
        this.margin,
        this.pageHeight - 10
      );
    }
  }

  /**
   * PDFを保存
   */
  save(filename?: string): void {
    const defaultFilename = `tiktok-analytics-${format(new Date(), 'yyyyMMdd-HHmm')}.pdf`;
    this.pdf.save(filename || defaultFilename);
  }

  /**
   * PDFをBlob形式で取得
   */
  getBlob(): Blob {
    return this.pdf.output('blob');
  }
}

/**
 * コンポーネントベースPDF生成のヘルパー関数
 */
export async function exportComponentBasedPDF(
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
  const exporter = new ComponentBasedPDFExporter();
  await exporter.generateComponentBasedPDF(data, kpis, insights, options);
  
  const filename = options.dateRange 
    ? `tiktok-analytics-${format(options.dateRange.start, 'yyyyMMdd')}-${format(options.dateRange.end, 'yyyyMMdd')}.pdf`
    : `tiktok-analytics-${format(new Date(), 'yyyyMMdd-HHmm')}.pdf`;
  
  exporter.save(filename);
}