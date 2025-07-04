# 本番環境デプロイマニュアル（Koyeb）

## 🚀 Koyeb を使用した本番環境デプロイ

### Koyeb とは
Koyebは、モダンなアプリケーションのためのサーバーレス・プラットフォームです。DockerコンテナやGitリポジトリから直接デプロイでき、自動スケーリングと高可用性を提供します。

### 前提条件
- **Koyebアカウント**: [koyeb.com](https://www.koyeb.com/) でアカウント作成
- **GitHubアカウント**: ソースコードリポジトリ
- **Dockerの知識**: 基本的なDockerの理解
- **本プロジェクトの完了**: ローカルでの動作確認済み

## 📋 デプロイ準備

### 1. プロジェクトの最終確認
```bash
# 1. 依存関係の確認
npm audit
npm run lint
npm run type-check

# 2. 本番用ビルドテスト
npm run build
npm run preview

# 3. Dockerビルドテスト
docker build -t tiktok-analytics-test .
docker run -p 8080:80 tiktok-analytics-test
# http://localhost:8080 で動作確認
```

### 2. 環境設定ファイルの確認

#### `koyeb.yaml` の設定
```yaml
name: tiktok-analytics-dashboard
type: web

build:
  type: docker
  dockerfile: Dockerfile

ports:
  - port: 80
    protocol: http

regions:
  - fra  # フランクフルト（ヨーロッパ）
  # - was  # ワシントン（北米東部）
  # - sin  # シンガポール（アジア太平洋）

scaling:
  min: 1  # 最小インスタンス数
  max: 3  # 最大インスタンス数（必要に応じて調整）

env:
  - key: NODE_ENV
    value: production

health_checks:
  - path: /health
    port: 80
    protocol: http
    interval: 30s
    timeout: 5s
    grace_period: 30s

deployment:
  github:
    repository: your-username/tiktok-analytics-react
    branch: main
    auto_deploy: true

resources:
  memory: 512Mi  # メモリ使用量（必要に応じて調整）
  cpu: 0.5       # CPU使用量（必要に応じて調整）
```

#### `Dockerfile` の最適化
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create health check endpoint
RUN echo "healthy" > /usr/share/nginx/html/health

# Expose port
EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 3. GitHubリポジトリの準備
```bash
# 1. 最新の変更をコミット
git add .
git commit -m "feat: prepare for production deployment"

# 2. mainブランチにプッシュ
git push origin main

# 3. リリースタグの作成（オプション）
git tag v1.0.0
git push origin v1.0.0
```

## 🔧 Koyeb デプロイ手順

### 1. Koyebアカウントの作成とセットアップ

#### アカウント作成
1. [Koyeb](https://www.koyeb.com/) にアクセス
2. 「Sign up」をクリック
3. GitHubアカウントで認証（推奨）
4. 基本情報を入力

#### 支払い情報の設定
1. ダッシュボードで「Billing」を選択
2. クレジットカード情報を登録
3. 無料枠の確認（月間$5.50まで無料）

### 2. アプリケーションの作成

#### 新しいアプリの作成
1. Koyebダッシュボードで「Create App」をクリック
2. 「Deploy from GitHub」を選択
3. GitHubリポジトリを接続

#### GitHub連携の設定
```bash
# 1. Koyeb GitHub App をインストール
# 2. リポジトリへのアクセス権限を付与
# 3. 対象リポジトリを選択: your-username/tiktok-analytics-react
```

#### デプロイ設定
1. **App name**: `tiktok-analytics-dashboard`
2. **Repository**: `your-username/tiktok-analytics-react`
3. **Branch**: `main`
4. **Build method**: `Docker`
5. **Dockerfile path**: `Dockerfile`

### 3. 詳細設定

#### リソース設定
```yaml
# CPU: 0.5 vCPU
# Memory: 512 MB
# Storage: 1 GB (自動)
# Bandwidth: 100 GB/月（無料枠）
```

#### 環境変数の設定
```bash
NODE_ENV=production
```

#### リージョンの選択
- **fra**: フランクフルト（推奨：アジア・ヨーロッパ向け）
- **was**: ワシントン（北米向け）
- **sin**: シンガポール（アジア太平洋向け）

### 4. デプロイの実行
1. 「Deploy」ボタンをクリック
2. ビルドプロセスの監視
3. デプロイ完了の確認

## 📊 デプロイ後の確認

### 1. アプリケーションの動作確認
```bash
# 1. デプロイされたURLにアクセス
# https://your-app-name-your-org.koyeb.app

# 2. 基本機能の確認
# - ページの読み込み
# - ファイルアップロード機能
# - データ分析機能
# - PDF/CSVエクスポート機能

# 3. ヘルスチェックの確認
curl https://your-app-name-your-org.koyeb.app/health
```

### 2. パフォーマンステスト
```bash
# 1. ページ読み込み速度の測定
# - Chrome DevTools の Lighthouse
# - GTmetrix (https://gtmetrix.com/)
# - PageSpeed Insights (https://pagespeed.web.dev/)

# 2. 負荷テスト（簡易）
# - 複数のブラウザタブで同時アクセス
# - 大きなCSVファイルのアップロード
# - 連続的なPDF生成
```

### 3. ログの確認
```bash
# Koyebダッシュボードで以下を確認
# 1. アプリケーションログ
# 2. アクセスログ
# 3. エラーログ
# 4. メトリクス（CPU、メモリ、ネットワーク）
```

## 🔄 継続的デプロイ（CD）

### 1. 自動デプロイの設定
```yaml
# koyeb.yaml の設定で自動デプロイが有効
deployment:
  github:
    auto_deploy: true  # mainブランチへのプッシュで自動デプロイ
```

### 2. デプロイフロー
```bash
# 1. 開発とテスト
git checkout -b feature/new-feature
# 開発作業
npm run lint
npm run type-check
npm run build

# 2. プルリクエスト
git push origin feature/new-feature
# GitHub でプルリクエスト作成

# 3. レビューとマージ
# コードレビュー後、mainブランチにマージ

# 4. 自動デプロイ
# mainブランチへのマージで自動的にKoyebにデプロイ
```

### 3. ロールバック手順
```bash
# 1. Koyebダッシュボードで「Deployments」を選択
# 2. 以前の安定したデプロイを選択
# 3. 「Redeploy」をクリック

# または Git でロールバック
git revert <commit-hash>
git push origin main
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー
```bash
# エラー例：Node.js バージョン不一致
Error: Node.js version 16.x is not supported

# 解決方法：Dockerfile の Node.js バージョンを確認
FROM node:18-alpine AS builder  # 18を指定
```

#### 2. メモリ不足エラー
```bash
# エラー例：JavaScript heap out of memory
FATAL ERROR: Reached heap limit

# 解決方法：koyeb.yaml でメモリを増加
resources:
  memory: 1Gi  # 512Mi から 1Gi に増加
```

#### 3. ネットワークエラー
```bash
# エラー例：静的ファイルが読み込まれない
Failed to load resource: net::ERR_FAILED

# 解決方法：nginx.conf の設定を確認
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 4. ヘルスチェック失敗
```bash
# エラー例：Health check failed
Health check failed: Connection refused

# 解決方法：nginx.conf でヘルスチェックエンドポイントを確認
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

### デバッグ手順

#### 1. ログの確認
```bash
# Koyebダッシュボードで以下を確認
# 1. Build logs（ビルドログ）
# 2. Runtime logs（実行時ログ）
# 3. Access logs（アクセスログ）
```

#### 2. ローカルでの再現
```bash
# 1. 本番環境と同じ条件でDockerビルド
docker build -t tiktok-analytics-prod .

# 2. 本番環境と同じ環境変数で実行
docker run -e NODE_ENV=production -p 8080:80 tiktok-analytics-prod

# 3. 問題の再現と修正
```

#### 3. 段階的デバッグ
```bash
# 1. 静的ファイルの確認
curl -I https://your-app.koyeb.app/

# 2. ヘルスチェックの確認
curl https://your-app.koyeb.app/health

# 3. 個別機能の確認
# - ファイルアップロード
# - データ処理
# - PDF生成
```

## 🎯 パフォーマンス最適化

### 1. Koyeb 固有の最適化
```yaml
# koyeb.yaml での最適化設定
scaling:
  min: 1      # 常時1インスタンスを維持
  max: 5      # ピーク時は5インスタンスまでスケール

resources:
  memory: 1Gi # 十分なメモリを確保
  cpu: 1.0    # CPU使用量を増加

regions:
  - fra       # ユーザーに近いリージョンを選択
  - sin       # 複数リージョンでの冗長化（オプション）
```

### 2. Nginx の最適化
```nginx
# nginx.conf での最適化
gzip on;
gzip_comp_level 6;
gzip_min_length 1000;

# キャッシュ設定
location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 圧縮設定
location ~* \.(png|jpg|jpeg|gif|ico|svg)$ {
    expires 6M;
    add_header Cache-Control "public, immutable";
}
```

### 3. アプリケーションの最適化
```typescript
// コード分割
const LazyDashboard = React.lazy(() => import('./components/Dashboard'));

// 画像の最適化
// - WebP形式の使用
// - 適切なサイズでの配信
// - 遅延読み込み

// バンドルサイズの最適化
// - 不要な依存関係の削除
// - Tree shaking の活用
```

## 💰 コスト管理

### 1. Koyeb 料金体系
```bash
# 無料枠（Free tier）
# - $5.50/月まで無料
# - 1 app
# - 2 services
# - 512MB RAM

# 有料プラン（Starter）
# - $5.50/月から
# - 無制限 apps
# - 無制限 services
# - 追加リソース使用分は従量課金
```

### 2. コスト最適化
```yaml
# リソース使用量の最適化
resources:
  memory: 512Mi  # 必要最小限のメモリ
  cpu: 0.5       # 必要最小限のCPU

scaling:
  min: 0  # 使用されていない時は0インスタンス（コールドスタート有）
  max: 2  # 最大インスタンス数を制限
```

### 3. 使用量の監視
```bash
# Koyebダッシュボードで以下を監視
# 1. CPU使用率
# 2. メモリ使用率
# 3. ネットワーク使用量
# 4. 月間コスト
```

## 🔐 セキュリティ設定

### 1. HTTPS の設定
```bash
# Koyeb では自動的にHTTPS証明書が発行される
# - Let's Encrypt 証明書
# - 自動更新
# - HTTP から HTTPS への自動リダイレクト
```

### 2. セキュリティヘッダー
```nginx
# nginx.conf でセキュリティヘッダーを設定
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### 3. 環境変数の管理
```bash
# 機密情報は環境変数で管理
# Koyebダッシュボードの「Environment」で設定
# - API キー
# - データベース接続文字列
# - その他の機密情報
```

このマニュアルに従ってKoyebにデプロイすることで、スケーラブルで高可用性な本番環境を構築できます。 