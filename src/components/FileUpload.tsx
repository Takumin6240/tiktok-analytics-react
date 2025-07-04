import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { parseMultipleCSVFiles } from '@/utils/csvParser';
import type { FileUploadResult, CSVFileType } from '@/types';

interface FileUploadProps {
  onFilesProcessed: (results: FileUploadResult[]) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesProcessed, 
  onError, 
  isProcessing 
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResult[]>([]);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);

  const getFileTypeLabel = (type: CSVFileType): string => {
    switch (type) {
      case 'engagement': return 'エンゲージメント';
      case 'revenue': return '収益';
      case 'activity': return '活動';
      case 'viewer': return '視聴者';
      case 'unknown': return '不明';
      default: return type;
    }
  };

  const getFileTypeColor = (type: CSVFileType): string => {
    switch (type) {
      case 'engagement': return 'bg-blue-100 text-blue-800';
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'activity': return 'bg-purple-100 text-purple-800';
      case 'viewer': return 'bg-orange-100 text-orange-800';
      case 'unknown': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // CSVファイルのみを受け入れ
    const csvFiles = acceptedFiles.filter(file => 
      file.type === 'text/csv' || file.name.endsWith('.csv')
    );

    if (csvFiles.length === 0) {
      onError('CSVファイルのみアップロード可能です');
      return;
    }

    if (csvFiles.length > 4) {
      onError('一度にアップロードできるファイルは4つまでです');
      return;
    }

    try {
      setProcessingFiles(csvFiles.map(f => f.name));
      
      const results = await parseMultipleCSVFiles(csvFiles);
      
      // エラーがあるファイルをチェック
      const errorFiles = results.filter(r => r.error);
      if (errorFiles.length > 0) {
        const errorMessages = errorFiles.map(f => `${f.file.name}: ${f.error}`);
        onError(`ファイル処理エラー:\n${errorMessages.join('\n')}`);
      }

      // 成功したファイルのみを処理
      const successfulResults = results.filter(r => !r.error);
      if (successfulResults.length > 0) {
        setUploadedFiles(successfulResults);
        onFilesProcessed(successfulResults);
      }
    } catch (error) {
      onError(`ファイル処理中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessingFiles([]);
    }
  }, [onFilesProcessed, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 4,
    multiple: true,
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesProcessed(newFiles);
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    onFilesProcessed([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          CSVファイルアップロード
        </h2>
        <p className="text-gray-600">
          TikTokライブセンターからエクスポートした4種類のCSVファイルをアップロードしてください
        </p>
      </div>

      {/* アップロード領域 */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-tiktok-primary bg-tiktok-primary/5' 
            : 'border-gray-300 hover:border-tiktok-primary hover:bg-gray-50'
          }
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <Upload 
            className={`w-12 h-12 ${isDragActive ? 'text-tiktok-primary' : 'text-gray-400'}`} 
          />
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'ファイルをドロップしてください' : 'ファイルをドラッグ&ドロップ'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              または クリックしてファイルを選択 (最大4ファイル)
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {['エンゲージメント', '収益', '活動', '視聴者'].map((type) => (
              <span
                key={type}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 処理中のファイル表示 */}
      {processingFiles.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tiktok-primary"></div>
            <span className="text-sm font-medium text-blue-900">
              ファイルを処理中...
            </span>
          </div>
          <div className="space-y-1">
            {processingFiles.map((filename) => (
              <div key={filename} className="text-sm text-blue-700">
                {filename}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アップロード済みファイル表示 */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              アップロード済みファイル ({uploadedFiles.length}/4)
            </h3>
            <button
              onClick={clearAllFiles}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              すべて削除
            </button>
          </div>

          <div className="space-y-3">
            {uploadedFiles.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {result.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(result.file.size / 1024).toFixed(1)} KB • {result.data.length} 行
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(result.type)}`}>
                    {getFileTypeLabel(result.type)}
                  </span>
                  
                  {result.error ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ファイルタイプの不足を表示 */}
          {uploadedFiles.length < 4 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                完全な分析には4種類すべてのCSVファイルが必要です。
                不足しているファイルがある場合、一部の機能が制限される可能性があります。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;