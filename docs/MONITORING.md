# 監視・アラート設定マニュアル（UptimeRobot）

## 🔍 UptimeRobot を使用したアプリケーション監視

### UptimeRobot とは
UptimeRobotは、Webサイトやアプリケーションの可用性を監視するサービスです。ダウンタイムを検出し、即座にアラートを送信することで、迅速な対応を可能にします。

### 監視の重要性
- **可用性の確保**: アプリケーションが正常に動作していることを確認
- **早期発見**: 問題の早期発見と迅速な対応
- **パフォーマンス監視**: レスポンス時間の監視
- **ユーザー体験の向上**: ダウンタイムの最小化

## 📋 事前準備

### 前提条件
- **UptimeRobotアカウント**: [uptimerobot.com](https://uptimerobot.com/) でアカウント作成
- **デプロイ済みアプリケーション**: Koyebでのデプロイ完了
- **アラート受信先**: メール、Slack、Discord等のアカウント

### アプリケーション情報の確認
```bash
# 監視対象の情報を確認
# 1. アプリケーションURL
https://your-app-name-your-org.koyeb.app

# 2. ヘルスチェックエンドポイント
https://your-app-name-your-org.koyeb.app/health

# 3. 主要機能のエンドポイント
https://your-app-name-your-org.koyeb.app/  # メインページ
```

## 🚀 UptimeRobot セットアップ

### 1. アカウント作成とログイン

#### 無料アカウントの作成
1. [UptimeRobot](https://uptimerobot.com/) にアクセス
2. 「Sign Up Free」をクリック
3. メールアドレスとパスワードを入力
4. メール認証を完了

#### 無料プランの制限
```bash
# 無料プラン（Free）の制限
# - 監視対象: 50サイトまで
# - 監視間隔: 5分間隔
# - アラート方法: メール、Webhook
# - データ保持: 2か月

# 有料プラン（Pro）の特徴
# - 監視対象: 無制限
# - 監視間隔: 1分間隔
# - アラート方法: SMS、音声通話、Slack等
# - データ保持: 12か月
```

### 2. 基本監視の設定

#### HTTP(S) 監視の作成
1. ダッシュボードで「+ Add New Monitor」をクリック
2. 監視タイプを選択: **HTTP(s)**
3. 基本設定を入力：

```bash
# 基本設定
Monitor Type: HTTP(s)
Friendly Name: TikTok Analytics Dashboard
URL: https://your-app-name-your-org.koyeb.app
Monitoring Interval: 5 minutes（無料プラン）
```

#### 詳細設定
```bash
# HTTP設定
HTTP Method: GET
HTTP Username: （認証が必要な場合）
HTTP Password: （認証が必要な場合）

# 期待する応答
Expected Status Code: 200
Expected Content: （特定のテキストを期待する場合）

# タイムアウト設定
Timeout: 30 seconds
```

### 3. ヘルスチェック監視の設定

#### ヘルスチェックエンドポイントの監視
```bash
# ヘルスチェック専用監視の作成
Monitor Type: HTTP(s)
Friendly Name: TikTok Analytics Health Check
URL: https://your-app-name-your-org.koyeb.app/health
Monitoring Interval: 5 minutes
Expected Status Code: 200
Expected Content: healthy
```

### 4. アラート連絡先の設定

#### メールアラートの設定
1. 「My Settings」→「Alert Contacts」を選択
2. 「Add Alert Contact」をクリック
3. 連絡先情報を入力：

```bash
# メールアラート設定
Alert Contact Type: E-mail
Friendly Name: Primary Email Alert
E-mail: your-email@example.com
```

#### Slack連携の設定（推奨）
1. Slackで新しいアプリを作成
2. Incoming Webhookを有効化
3. Webhook URLを取得
4. UptimeRobotでWebhook連絡先を追加：

```bash
# Slack Webhook設定
Alert Contact Type: Webhook
Friendly Name: Slack Alerts
URL: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
HTTP Method: POST
```

#### Discord連携の設定
```bash
# Discord Webhook設定
Alert Contact Type: Webhook
Friendly Name: Discord Alerts
URL: https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK
HTTP Method: POST
```

## 📊 高度な監視設定

### 1. キーワード監視

#### 重要なコンテンツの監視
```bash
# メインページのキーワード監視
Monitor Type: Keyword
URL: https://your-app-name-your-org.koyeb.app
Keyword: TikTok ライブ分析
Case Sensitive: No
```

#### エラーページの監視
```bash
# エラーページの検出
Monitor Type: Keyword
URL: https://your-app-name-your-org.koyeb.app
Keyword: Error 404
Case Sensitive: No
Alert When: Keyword Exists（キーワードが存在する時にアラート）
```

### 2. ポート監視

#### HTTPSポートの監視
```bash
# HTTPS ポート監視
Monitor Type: Port
Friendly Name: HTTPS Port Check
Host: your-app-name-your-org.koyeb.app
Port: 443
Port Type: HTTPS
```

### 3. Ping監視

#### サーバーの生存確認
```bash
# Ping 監視
Monitor Type: Ping
Friendly Name: Server Ping
Host: your-app-name-your-org.koyeb.app
```

## 🔔 アラート設定の最適化

### 1. アラートのタイミング設定

#### 段階的アラート設定
```bash
# 1次アラート: 即座に通知
Alert Contact: Primary Email
When to Alert: Down
Send Alert When: Immediately

# 2次アラート: 5分後に再通知
Alert Contact: Slack Channel
When to Alert: Still Down
Send Alert When: 5 minutes after first alert

# 復旧通知
Alert Contact: All Contacts
When to Alert: Up
Send Alert When: Immediately
```

### 2. アラート内容のカスタマイズ

#### カスタムメッセージテンプレート
```json
{
  "text": "🚨 TikTok Analytics Dashboard Alert",
  "attachments": [
    {
      "color": "danger",
      "fields": [
        {
          "title": "Status",
          "value": "*monitorFriendlyName* is *alertType*",
          "short": false
        },
        {
          "title": "URL",
          "value": "*monitorURL*",
          "short": false
        },
        {
          "title": "Time",
          "value": "*alertDateTime*",
          "short": false
        }
      ]
    }
  ]
}
```

### 3. 通知の抑制設定

#### メンテナンス期間の設定
```bash
# メンテナンス期間の設定
1. 監視対象を選択
2. 「Pause」ボタンをクリック
3. 期間を指定（例: 2時間）
4. 理由を記入（例: "Scheduled maintenance"）
```

## 📈 監視ダッシュボードの活用

### 1. 統計情報の確認

#### 可用性統計
```bash
# 確認できる統計情報
# - 稼働率（Uptime）: 過去30日間の稼働率
# - 平均応答時間: レスポンス時間の推移
# - ダウンタイム: 障害発生回数と継続時間
# - 地域別レスポンス: 世界各地からのアクセス時間
```

#### SLA レポート
```bash
# SLA（Service Level Agreement）の確認
# - 月次稼働率: 99.9% 以上を目標
# - 年次稼働率: 99.5% 以上を目標
# - MTTR（平均復旧時間）: 5分以内を目標
# - MTBF（平均故障間隔）: 30日以上を目標
```

### 2. パフォーマンス分析

#### レスポンス時間の監視
```bash
# パフォーマンス指標
# - 平均レスポンス時間: 2秒以下を目標
# - 95パーセンタイル: 5秒以下を目標
# - 最大レスポンス時間: 10秒以下を目標
```

#### 地域別パフォーマンス
```bash
# 監視地点の選択
# - ヨーロッパ: フランクフルト（Koyebのリージョンと一致）
# - 北米: ニューヨーク
# - アジア: 東京
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. 偽陽性アラート
```bash
# 問題: 正常なのにダウンアラートが発生
# 原因: ネットワークの一時的な問題
# 解決: 監視間隔を調整、複数地点からの監視

# 設定例
Monitoring Interval: 5 minutes → 3 minutes
Confirmation: 2 checks from different locations
```

#### 2. アラートが届かない
```bash
# 確認項目
# 1. 連絡先設定の確認
# 2. スパムフォルダの確認
# 3. Webhook URLの有効性確認
# 4. Slackアプリの権限確認

# テスト方法
UptimeRobot → Alert Contacts → Test Alert
```

#### 3. 監視が停止している
```bash
# 確認項目
# 1. アカウントの有効性
# 2. 監視設定の有効性
# 3. クレジット残高（有料プランの場合）

# 復旧手順
1. ダッシュボードで監視状態を確認
2. 必要に応じて監視を再開
3. 設定を見直し
```

### デバッグ手順

#### 1. 監視ログの確認
```bash
# UptimeRobotダッシュボードで確認
# 1. Monitor Details → Response Times
# 2. Monitor Details → Uptime Events
# 3. Monitor Details → Response Time Chart
```

#### 2. 手動テスト
```bash
# 手動でのヘルスチェック
curl -I https://your-app-name-your-org.koyeb.app/health

# 期待される応答
HTTP/2 200 
content-type: text/plain
content-length: 8

healthy
```

#### 3. 外部ツールでの検証
```bash
# 他のツールでの監視確認
# - Pingdom: https://tools.pingdom.com/
# - GTmetrix: https://gtmetrix.com/
# - WebPageTest: https://www.webpagetest.org/
```

## 📋 監視チェックリスト

### 日次確認項目
- [ ] 過去24時間の稼働状況確認
- [ ] レスポンス時間の異常値確認
- [ ] アラート発生状況の確認
- [ ] エラーログの確認

### 週次確認項目
- [ ] 週間稼働率の確認（目標: 99.9%以上）
- [ ] 平均レスポンス時間の推移確認
- [ ] ダウンタイムの原因分析
- [ ] 監視設定の見直し

### 月次確認項目
- [ ] 月間SLAレポートの作成
- [ ] パフォーマンストレンドの分析
- [ ] 監視コストの確認
- [ ] 改善計画の策定

## 🚨 インシデント対応フロー

### 1. アラート受信時の対応

#### 初期対応（5分以内）
```bash
# 1. アラート内容の確認
# - 監視対象の特定
# - 障害タイプの確認
# - 発生時刻の確認

# 2. 手動確認
curl -I https://your-app-name-your-org.koyeb.app
curl -I https://your-app-name-your-org.koyeb.app/health

# 3. Koyebダッシュボードの確認
# - アプリケーション状態
# - リソース使用状況
# - ログの確認
```

#### 詳細調査（15分以内）
```bash
# 1. ログ分析
# - アプリケーションログ
# - Webサーバーログ
# - システムログ

# 2. リソース確認
# - CPU使用率
# - メモリ使用率
# - ディスク使用率
# - ネットワーク状況

# 3. 外部要因の確認
# - Koyebステータスページ
# - CDNサービス状況
# - DNSサービス状況
```

### 2. 復旧作業

#### 一般的な復旧手順
```bash
# 1. アプリケーションの再起動
# Koyebダッシュボード → Restart

# 2. 設定の確認と修正
# - 環境変数
# - リソース設定
# - ネットワーク設定

# 3. ロールバック（必要な場合）
# - 以前の安定版にロールバック
# - 設定の復元
```

### 3. 事後対応

#### インシデントレポートの作成
```markdown
# インシデントレポート

## 概要
- 発生日時: YYYY-MM-DD HH:MM:SS
- 影響範囲: 全ユーザー / 一部ユーザー
- 継続時間: XX分

## 原因
- 根本原因の特定
- 発生要因の分析

## 対応内容
- 実施した対応策
- 復旧までの手順

## 再発防止策
- 改善点の特定
- 実装計画
```

## 🎯 監視の最適化

### 1. 監視間隔の調整
```bash
# 重要度別の監視間隔設定
# - 本番環境: 1-3分間隔
# - ステージング環境: 5分間隔
# - 開発環境: 15分間隔
```

### 2. アラート疲れの防止
```bash
# アラート最適化のポイント
# 1. 重要度によるアラート分類
# 2. 段階的エスカレーション
# 3. 一時的な問題の除外
# 4. メンテナンス期間の考慮
```

### 3. 監視コストの最適化
```bash
# コスト削減のポイント
# 1. 不要な監視の削除
# 2. 監視間隔の最適化
# 3. 無料プランの活用
# 4. 代替ツールの検討
```

このマニュアルに従ってUptimeRobotを設定することで、アプリケーションの可用性を効果的に監視し、迅速な障害対応が可能になります。 