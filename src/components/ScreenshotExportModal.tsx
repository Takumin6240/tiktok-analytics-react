import React, { useState } from 'react';
import { X, Camera, FileText, BarChart3 } from 'lucide-react';
import { generateScreenshotPdf } from '@/utils/browserPdfGenerator';

interface ScreenshotExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScreenshotExportModal: React.FC<ScreenshotExportModalProps> = ({ isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportType, setExportType] = useState<'full' | 'trends'>('full');

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `tiktok-analytics-${exportType}-${timestamp}.pdf`;
      
      await generateScreenshotPdf(exportType, filename);
      
      alert(`${exportType === 'full' ? '全セクション' : 'トレンド分析'}のPDFが生成されました！`);
    } catch (error) {
      console.error('Screenshot PDF generation error:', error);
      alert('PDFの生成に失敗しました。詳細はコンソールをご確認ください。');
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">PDF出力</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">出力タイプを選択</h3>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportType"
                  value="full"
                  checked={exportType === 'full'}
                  onChange={(e) => setExportType(e.target.value as 'full' | 'trends')}
                  className="w-4 h-4 text-tiktok-primary"
                />
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">全セクション</div>
                    <div className="text-sm text-gray-500">KPI、洞察、チャート、テーブル、統計すべて</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exportType"
                  value="trends"
                  checked={exportType === 'trends'}
                  onChange={(e) => setExportType(e.target.value as 'full' | 'trends')}
                  className="w-4 h-4 text-tiktok-primary"
                />
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium">トレンド分析のみ</div>
                    <div className="text-sm text-gray-500">6つの指標チャートを自動切り替えで撮影（ダイヤモンド、フォロワー、いいね、視聴数、配信時間、同時視聴者）</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleExport}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-tiktok-primary text-white rounded-lg hover:bg-tiktok-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>PDF生成</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotExportModal;