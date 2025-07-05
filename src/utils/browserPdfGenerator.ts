import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ScreenshotSection {
  name: string;
  selector: string;
  description: string;
  metric?: string; // トレンド分析用のメトリック指定
}

export interface ScreenshotOptions {
  sections: ScreenshotSection[];
  filename?: string;
  quality?: number;
  scale?: number;
}

export const defaultSections: ScreenshotSection[] = [
  {
    name: 'KPI指標',
    selector: '[data-kpi-section="true"]',
    description: 'KPI指標全体'
  },
  {
    name: 'エンゲージメントチャート',
    selector: '[data-chart="engagement-chart"]',
    description: 'エンゲージメント推移チャート'
  },
  {
    name: '視聴者チャート',
    selector: '[data-chart="viewer-chart"]',
    description: '視聴者数推移チャート'
  },
  {
    name: 'データテーブル',
    selector: '[data-table-container="true"]',
    description: 'データテーブル (全件表示)'
  },
  {
    name: '詳細統計',
    selector: '[data-stats-section="true"]',
    description: '詳細統計セクション'
  },
  // トレンド分析の6つの指標チャートを追加
  {
    name: 'ダイヤモンド推移',
    selector: '[data-chart="main-chart"]',
    description: 'ダイヤモンド推移チャート',
    metric: 'diamonds'
  },
  {
    name: '新規フォロワー推移',
    selector: '[data-chart="main-chart"]',
    description: '新規フォロワー推移チャート',
    metric: 'followers'
  },
  {
    name: 'いいね推移',
    selector: '[data-chart="main-chart"]',
    description: 'いいね推移チャート',
    metric: 'likes'
  },
  {
    name: '視聴数推移',
    selector: '[data-chart="main-chart"]',
    description: '視聴数推移チャート',
    metric: 'views'
  },
  {
    name: '配信時間推移',
    selector: '[data-chart="main-chart"]',
    description: '配信時間推移チャート',
    metric: 'liveTime'
  },
  {
    name: '同時視聴者推移',
    selector: '[data-chart="main-chart"]',
    description: '同時視聴者推移チャート',
    metric: 'concurrent'
  }
];

export const trendAnalysisSections: ScreenshotSection[] = [
  {
    name: 'ダイヤモンド推移',
    selector: '[data-chart="main-chart"]',
    description: 'ダイヤモンド推移チャート',
    metric: 'diamonds'
  },
  {
    name: '新規フォロワー推移',
    selector: '[data-chart="main-chart"]',
    description: '新規フォロワー推移チャート',
    metric: 'followers'
  },
  {
    name: 'いいね推移',
    selector: '[data-chart="main-chart"]',
    description: 'いいね推移チャート',
    metric: 'likes'
  },
  {
    name: '視聴数推移',
    selector: '[data-chart="main-chart"]',
    description: '視聴数推移チャート',
    metric: 'views'
  },
  {
    name: '配信時間推移',
    selector: '[data-chart="main-chart"]',
    description: '配信時間推移チャート',
    metric: 'liveTime'
  },
  {
    name: '同時視聴者推移',
    selector: '[data-chart="main-chart"]',
    description: '同時視聴者推移チャート',
    metric: 'concurrent'
  }
];

export class BrowserPdfGenerator {
  private options: ScreenshotOptions;

  constructor(options: ScreenshotOptions) {
    this.options = {
      quality: 0.95,
      scale: 2,
      ...options
    };
  }

  async captureElement(selector: string): Promise<HTMLCanvasElement> {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // 要素を表示エリアにスクロール
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 少し待ってからキャプチャ（アニメーションやレンダリングを待つ）
    await new Promise(resolve => setTimeout(resolve, 1500));

    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      background: '#ffffff',
      logging: false
      // デフォルトのサイズとスケールを使用
    });

    return canvas;
  }

  async generateFullDashboardPdf(): Promise<void> {
    // 横向きA4サイズ
    let pdf = new jsPDF('l', 'mm', 'a4');
    let pageWidth = pdf.internal.pageSize.getWidth();
    let pageHeight = pdf.internal.pageSize.getHeight();

    let isFirstPage = true;

    // 各セクションをキャプチャ
    for (let i = 0; i < this.options.sections.length; i++) {
      const section = this.options.sections[i];
      const isLastSection = i === this.options.sections.length - 1;
      
      try {
        // データテーブルの場合は「全て表示」に設定
        if (section.selector === '[data-table-container="true"]') {
          await this.maximizeDataTable();
        }

        // メトリック指定がある場合（トレンド分析）はメトリックを切り替え
        if (section.metric) {
          await this.selectTrendMetric(section.metric);
        }

        const canvas = await this.captureElement(section.selector);
        
        // データテーブルまたは詳細統計の場合は縦型ページに切り替え
        if (section.name === 'データテーブル' || section.name === '詳細統計') {
          if (!isFirstPage) {
            pdf.addPage('a4', 'p'); // 縦型ページを追加
          } else {
            // 最初のページの場合は向きを変更
            pdf = new jsPDF('p', 'mm', 'a4'); // 縦型で新規作成
            isFirstPage = false;
          }
          pageWidth = 210; // A4縦の幅
          pageHeight = 297; // A4縦の高さ
        } else {
          // その他のセクションは横型
          if (!isFirstPage) {
            pdf.addPage('a4', 'l'); // 横型ページを追加
          }
          pageWidth = pdf.internal.pageSize.getWidth();
          pageHeight = pdf.internal.pageSize.getHeight();
        }

        const imgData = canvas.toDataURL('image/jpeg', this.options.quality);

        // セクションごとに配置方法を決定
        this.addImageToPdf(pdf, imgData, canvas, section, pageWidth, pageHeight);

        if (isFirstPage) {
          isFirstPage = false;
        }
      } catch (error) {
        console.warn(`Failed to capture section: ${section.name}`, error);
        
        if (!isFirstPage) {
          pdf.addPage();
        }

        // エラーページ
        pdf.setFontSize(16);
        pdf.text(`エラー: ${section.name}をキャプチャできませんでした`, 10, pageHeight / 2);
        isFirstPage = false;
      }
    }

    // PDFをダウンロード
    const filename = this.options.filename || `tiktok-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  }

  private addImageToPdf(
    pdf: jsPDF, 
    imgData: string, 
    canvas: HTMLCanvasElement, 
    section: ScreenshotSection, 
    pageWidth: number, 
    pageHeight: number
  ): void {
    // メインチャート（トレンド分析）は引き延ばし
    if (section.metric) {
      pdf.addImage(
        imgData,
        'JPEG',
        0,  // x座標: 0 (左端)
        0,  // y座標: 0 (上端)
        pageWidth,   // 幅: ページ全幅
        pageHeight   // 高さ: ページ全高
      );
      return;
    }

    // エンゲージメント推移と視聴者数推移は1ページに収める（アスペクト比維持）
    if (section.name === 'エンゲージメントチャート' || section.name === '視聴者チャート') {
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      // アスペクト比を計算
      const aspectRatio = canvas.width / canvas.height;
      let imgWidth = contentWidth;
      let imgHeight = imgWidth / aspectRatio;

      // 高さがページを超える場合は高さ基準で調整
      if (imgHeight > contentHeight) {
        imgHeight = contentHeight;
        imgWidth = imgHeight * aspectRatio;
      }

      // 中央配置
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      return;
    }

    // データテーブルと詳細統計は縦型ページで直接配置
    if (section.name === 'データテーブル' || section.name === '詳細統計') {
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      // アスペクト比を計算
      const aspectRatio = canvas.width / canvas.height;
      let imgWidth = contentWidth;
      let imgHeight = imgWidth / aspectRatio;

      // 1ページに収まるように調整
      if (imgHeight > contentHeight) {
        imgHeight = contentHeight;
        imgWidth = imgHeight * aspectRatio;
        
        if (imgWidth > contentWidth) {
          imgWidth = contentWidth;
          imgHeight = imgWidth / aspectRatio;
        }
      }

      // 中央配置で画像を配置
      const x = (pageWidth - imgWidth) / 2;
      const y = margin;

      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      return;
    }

    // その他のセクション（KPI指標）は見やすい形で配置
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    
    // アスペクト比を維持して幅いっぱいに配置
    const aspectRatio = canvas.width / canvas.height;
    const imgWidth = contentWidth;
    const imgHeight = imgWidth / aspectRatio;

    // 上部から配置（中央配置ではなく）
    const x = margin;
    const y = margin;

    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
  }

  async generateTrendAnalysisPdf(): Promise<void> {
    // 横向きA4サイズ
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let isFirstPage = true;

    // 各トレンドチャートをキャプチャ
    for (const section of trendAnalysisSections) {
      try {
        // チャートの指標を変更
        if (section.metric) {
          await this.selectTrendMetric(section.metric);
        }
        
        const canvas = await this.captureElement(section.selector);
        
        if (!isFirstPage) {
          pdf.addPage();
        }

        const imgData = canvas.toDataURL('image/jpeg', this.options.quality);

        // トレンド分析は引き延ばし配置
        pdf.addImage(
          imgData,
          'JPEG',
          0,  // x座標: 0 (左端)
          0,  // y座標: 0 (上端)
          pageWidth,   // 幅: ページ全幅
          pageHeight   // 高さ: ページ全高
        );

        isFirstPage = false;
      } catch (error) {
        console.warn(`Failed to capture trend: ${section.name}`, error);
        
        if (!isFirstPage) {
          pdf.addPage();
        }

        // エラーページ
        pdf.setFontSize(16);
        pdf.text(`エラー: ${section.name}をキャプチャできませんでした`, 10, pageHeight / 2);
        isFirstPage = false;
      }
    }

    // PDFをダウンロード
    const filename = this.options.filename || `tiktok-trends-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  }

  private async selectTrendMetric(metric: string): Promise<void> {
    const selectElement = document.querySelector('select[data-metric-selector="true"]') as HTMLSelectElement;
    if (selectElement) {
      // 現在の値と異なる場合のみ変更
      if (selectElement.value !== metric) {
        selectElement.value = metric;
        
        // change イベントを発火
        const event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
        
        // チャートの更新を待つ（少し長めに）
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  private async maximizeDataTable(): Promise<void> {
    try {
      // 「全て表示」オプションを選択
      const itemsPerPageSelect = document.querySelector('select[data-items-per-page="true"]') as HTMLSelectElement;
      if (itemsPerPageSelect) {
        itemsPerPageSelect.value = 'all';
        
        // change イベントを発火
        const event = new Event('change', { bubbles: true });
        itemsPerPageSelect.dispatchEvent(event);
        
        // テーブルの更新を待つ
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.warn('Could not maximize data table:', error);
    }
  }
}

export async function generateScreenshotPdf(
  type: 'full' | 'trends' = 'full',
  filename?: string
): Promise<void> {
  const sections = type === 'full' ? defaultSections : trendAnalysisSections;
  const generator = new BrowserPdfGenerator({ sections, filename });
  
  if (type === 'full') {
    await generator.generateFullDashboardPdf();
  } else {
    await generator.generateTrendAnalysisPdf();
  }
} 