# 開発環境セットアップ・テストマニュアル

## 🚀 開発環境のセットアップ

### 前提条件
- **Node.js**: 18.0.0 以上
- **npm**: 9.0.0 以上 (Node.js 18に同梱)
- **Git**: 最新版
- **VSCode**: 推奨エディター

### 1. プロジェクトのクローン
```bash
# HTTPSでクローン
git clone https://github.com/your-username/tiktok-analytics-react.git
cd tiktok-analytics-react

# または SSH でクローン
git clone git@github.com:your-username/tiktok-analytics-react.git
cd tiktok-analytics-react
```

### 2. 依存関係のインストール
```bash
# 依存関係のインストール
npm install

# TypeScript 型チェック
npm run type-check

# ESLint チェック
npm run lint
```

### 3. 開発サーバーの起動
```bash
# 開発サーバーの起動
npm run dev

# または特定のポートで起動
npm run dev -- --port 3001
```

アプリケーションは http://localhost:3000 でアクセス可能になります。

### 4. 開発者向けツール

#### VSCode 拡張機能（推奨）
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **Auto Rename Tag**
- **Prettier - Code formatter**
- **ESLint**

#### ブラウザ開発者ツール
- **React Developer Tools**: React コンポーネントの検査
- **Redux DevTools**: 状態管理の監視（将来的に使用）

## 🧪 テスト方法

### 1. 手動テスト

#### 基本機能テスト
```bash
# 1. アプリケーションの起動確認
npm run dev

# 2. ブラウザで http://localhost:3000 にアクセス
# 3. 以下の機能をテスト：
```

**ファイルアップロード機能**
- [ ] ドラッグ&ドロップでCSVファイルをアップロード
- [ ] クリックでファイル選択ダイアログを開く
- [ ] 複数ファイル（最大4つ）の同時アップロード
- [ ] ファイルタイプの自動判別
- [ ] 不正なファイル形式の拒否

**データ分析機能**
- [ ] CSVデータの解析と表示
- [ ] KPI指標の計算と表示
- [ ] チャートの描画
- [ ] データテーブルの表示
- [ ] フィルタリング機能

**エクスポート機能**
- [ ] PDFレポートの生成
- [ ] CSVデータのエクスポート
- [ ] 日本語フォントの正常表示

#### レスポンシブデザインテスト
```bash
# Chrome DevTools で以下のデバイスサイズをテスト
# - Mobile: 375px × 667px
# - Tablet: 768px × 1024px
# - Desktop: 1920px × 1080px
```

### 2. テストデータの準備

#### サンプルCSVファイル
プロジェクトの `分析ツール資料/CSV/` フォルダに含まれるサンプルファイルを使用：

```
分析ツール資料/CSV/
├── LIVE_57299-05-03_57381-06-22_sano_world_エンゲージメント.csv
├── LIVE_57299-05-03_57381-06-22_sano_world_報酬.csv
├── LIVE_57299-05-03_57381-06-22_sano_world_活動.csv
└── LIVE_57299-05-03_57381-06-22_sano_world_視聴.csv
```

#### テストシナリオ
1. **正常系テスト**
   - 4つのCSVファイルを順番にアップロード
   - データが正しく解析・表示されることを確認
   - 全てのKPI指標が計算されることを確認

2. **異常系テスト**
   - 空のCSVファイルのアップロード
   - 不正な形式のファイルのアップロード
   - 巨大なファイルのアップロード（>10MB）
   - 重複したファイルのアップロード

### 3. パフォーマンステスト

#### ブラウザ開発者ツールでの測定
```bash
# Chrome DevTools の Performance タブで以下を測定
# - 初回ロード時間
# - CSVファイル解析時間
# - チャート描画時間
# - PDF生成時間
```

#### メモリ使用量の監視
```bash
# Chrome DevTools の Memory タブで以下を監視
# - 初期メモリ使用量
# - ファイルアップロード後のメモリ使用量
# - メモリリークの有無
```

### 4. ビルドテスト

#### 本番用ビルド
```bash
# TypeScript 型チェック
npm run type-check

# ESLint チェック
npm run lint

# 本番用ビルド
npm run build

# ビルド結果の確認
ls -la dist/

# プレビューサーバーで確認
npm run preview
```

#### ビルド成果物の検証
- [ ] `dist/` フォルダが生成される
- [ ] `index.html` が存在する
- [ ] JavaScriptファイルが最適化されている
- [ ] CSSファイルが最適化されている
- [ ] 画像ファイルが最適化されている

### 5. Docker テスト

#### Dockerイメージのビルド
```bash
# Dockerイメージのビルド
docker build -t tiktok-analytics-test .

# イメージサイズの確認
docker images tiktok-analytics-test

# コンテナの起動
docker run -p 8080:80 tiktok-analytics-test

# ブラウザで http://localhost:8080 にアクセス
```

#### Docker テストチェックリスト
- [ ] Dockerイメージが正常にビルドされる
- [ ] コンテナが正常に起動する
- [ ] アプリケーションが正常に動作する
- [ ] 静的ファイルが正しく配信される
- [ ] ヘルスチェックエンドポイント (`/health`) が応答する

### 6. セキュリティテスト

#### 基本的なセキュリティチェック
```bash
# 依存関係の脆弱性チェック
npm audit

# 高リスクの脆弱性の修正
npm audit fix

# パッケージの更新
npm update
```

#### ブラウザセキュリティ
- [ ] CSP（Content Security Policy）の設定
- [ ] XSS攻撃の防止
- [ ] ファイルアップロードの検証
- [ ] セキュリティヘッダーの確認

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. Node.js バージョンエラー
```bash
# 現在のNode.jsバージョンを確認
node --version

# Node.js 18以上が必要
# nvm を使用してバージョンを切り替え
nvm install 18
nvm use 18
```

#### 2. 依存関係のインストールエラー
```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュをクリア
npm cache clean --force
```

#### 3. TypeScript エラー
```bash
# TypeScript の型チェック
npm run type-check

# 型定義ファイルの更新
npm install --save-dev @types/react @types/react-dom
```

#### 4. ESLint エラー
```bash
# ESLint の実行
npm run lint

# 自動修正可能なエラーの修正
npm run lint -- --fix
```

#### 5. ビルドエラー
```bash
# ビルドキャッシュのクリア
rm -rf dist/
npm run build

# Vite キャッシュのクリア
rm -rf node_modules/.vite/
npm run build
```

### デバッグ手順

#### 1. ブラウザコンソールの確認
```javascript
// ブラウザの開発者ツール > Console で以下を確認
// - エラーメッセージ
// - 警告メッセージ
// - ネットワークエラー
```

#### 2. ネットワークタブの確認
```bash
# ブラウザの開発者ツール > Network で以下を確認
# - ファイルの読み込み状況
# - APIリクエスト/レスポンス
# - エラーレスポンス
```

#### 3. React Developer Tools
```bash
# React Developer Tools で以下を確認
# - コンポーネントの状態
# - プロパティの値
# - 状態の変更履歴
```

## 📝 開発フロー

### 1. 機能開発の流れ
```bash
# 1. 新しいブランチを作成
git checkout -b feature/new-feature

# 2. 機能を開発
# 3. テストを実行
npm run lint
npm run type-check
npm run build

# 4. コミット
git add .
git commit -m "feat: add new feature"

# 5. プッシュ
git push origin feature/new-feature

# 6. プルリクエストを作成
```

### 2. コードレビューのポイント
- [ ] TypeScript の型安全性
- [ ] ESLint ルールの遵守
- [ ] パフォーマンスの最適化
- [ ] アクセシビリティの考慮
- [ ] セキュリティの考慮

### 3. リリース準備
```bash
# 1. バージョンの更新
npm version patch  # パッチリリース
npm version minor  # マイナーリリース
npm version major  # メジャーリリース

# 2. 最終テスト
npm run lint
npm run type-check
npm run build
npm run preview

# 3. タグの作成
git tag v1.0.0
git push origin v1.0.0
```

## 🎯 パフォーマンス最適化

### 1. バンドルサイズの最適化
```bash
# バンドルサイズの分析
npm run build
npx vite-bundle-analyzer dist/

# 不要な依存関係の削除
npm uninstall unused-package
```

### 2. 画像最適化
```bash
# 画像ファイルの最適化
# - WebP形式の使用
# - 適切なサイズでの配信
# - 遅延読み込みの実装
```

### 3. コード分割
```typescript
// 動的インポートを使用したコード分割
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

## 🔄 継続的インテグレーション

### GitHub Actions の設定例
```yaml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build
```

このマニュアルに従って開発環境をセットアップし、適切にテストを実行することで、品質の高いアプリケーションを開発できます。 