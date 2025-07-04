import { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import type { FileUploadResult, AnalyticsData } from './types';

interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

function App() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (type: Alert['type'], message: string) => {
    const id = Date.now().toString();
    setAlerts(prev => [...prev, { id, type, message }]);
    
    // 自動的にアラートを削除
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const processUploadedFiles = useCallback((results: FileUploadResult[]) => {
    setIsProcessing(true);
    
    try {
      // データタイプ別に分類
      const engagementData = results.find(r => r.type === 'engagement')?.data || [];
      const revenueData = results.find(r => r.type === 'revenue')?.data || [];
      const activityData = results.find(r => r.type === 'activity')?.data || [];
      const viewerData = results.find(r => r.type === 'viewer')?.data || [];

      // 分析データを構築
      const analytics: AnalyticsData = {
        engagement: engagementData,
        revenue: revenueData,
        activity: activityData,
        viewer: viewerData,
      };

      setAnalyticsData(analytics);
      
      // 成功メッセージ
      const successfulFiles = results.filter(r => !r.error);
      addAlert('success', `${successfulFiles.length}件のファイルが正常に処理されました`);
      
      // 警告メッセージ（データが不完全な場合）
      const missingTypes = [];
      if (engagementData.length === 0) missingTypes.push('エンゲージメント');
      if (revenueData.length === 0) missingTypes.push('収益');
      if (activityData.length === 0) missingTypes.push('活動');
      if (viewerData.length === 0) missingTypes.push('視聴者');
      
      if (missingTypes.length > 0) {
        addAlert('warning', `${missingTypes.join('、')}データが不足しています。一部の分析機能が制限される可能性があります。`);
      }

    } catch (error) {
      addAlert('error', 'データ処理中にエラーが発生しました');
      console.error('Data processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleUploadError = useCallback((error: string) => {
    addAlert('error', error);
  }, []);

  const resetData = () => {
    setAnalyticsData(null);
    addAlert('info', 'データがリセットされました');
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertBgColor = (type: Alert['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-tiktok-primary to-tiktok-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TT</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  TikTok ライブ分析ツール
                </h1>
              </div>
            </div>
            
            {analyticsData && (
              <button
                onClick={resetData}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                新しいデータをアップロード
              </button>
            )}
          </div>
        </div>
      </header>

      {/* アラート */}
      {alerts.length > 0 && (
        <div className="fixed top-20 right-4 space-y-2 z-50">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-center space-x-3 p-4 rounded-lg border shadow-lg max-w-md ${getAlertBgColor(alert.type)} animate-slide-up`}
            >
              {getAlertIcon(alert.type)}
              <p className="text-sm text-gray-800 flex-1">{alert.message}</p>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analyticsData ? (
          /* ファイルアップロード画面 */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                TikTokライブ分析を開始
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                TikTokライブセンターからエクスポートした4種類のCSVファイル（エンゲージメント、収益、活動、視聴者）をアップロードして、
                包括的な分析レポートを生成します。
              </p>
            </div>

            <FileUpload
              onFilesProcessed={processUploadedFiles}
              onError={handleUploadError}
              isProcessing={isProcessing}
            />

            {/* 機能説明 */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-tiktok-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-tiktok-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">自動ファイル判別</h3>
                <p className="text-sm text-gray-600">
                  アップロードされたCSVファイルの内容を自動的に分析し、適切なデータタイプを判別します。
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-tiktok-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-tiktok-secondary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">包括的分析</h3>
                <p className="text-sm text-gray-600">
                  エンゲージメント、収益、視聴者データを統合して、詳細な分析レポートを生成します。
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">PDFエクスポート</h3>
                <p className="text-sm text-gray-600">
                  分析結果をPDFレポートとして出力し、チャートやデータテーブルを含む完全なレポートを生成します。
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ダッシュボード */
          <Dashboard 
            data={analyticsData} 
            isLoading={isProcessing}
          />
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>TikTok ライブ分析ツール - データドリブンな配信戦略をサポート</p>
            <p className="mt-2">© 2024 TikTok Analytics Dashboard. Built with React + TypeScript.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;