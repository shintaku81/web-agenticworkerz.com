title: Vercel + Supabase + Strapi コンテンツ基盤 要件定義（初版）
date: 2026-03-31
tags:
  - web
  - cms
  - strapi
  - supabase
  - vercel
  - newsletter
  - ai
status: draft
TL;DR
推奨構成は、フロントを Vercel / Next.js、アプリ基盤を Supabase、コンテンツエンジンを Strapi に分ける形です。
ただし Strapi は Vercel にそのまま載せる前提ではなく、常駐型の Node.js アプリとして別ホストに置くのが前提です。Strapi は Node.js LTS と SQL DB を前提にしており、Vercel は Functions/Cron/Edge Config などのサーバーレス実行基盤が中心です。
Supabase は Postgres / Auth / Storage / Realtime / Edge Functions / Vector embeddings を持つため、AI改善ループ・会員・イベント・メルマガ購読者管理の土台に向いています。
Strapi は webhook / REST API / Email 機能を持つため、コンテンツ管理・公開イベント通知・通知メール起点として使いやすいです。
注意点として、Strapi は既存DBへの接続や未サポートDB構成に警告を出しているため、Supabase 上のDBを使う場合は Strapi 専用領域として分離する前提で設計するのが安全です。
1. 結論

この構成で進めてよいです。
ただし、実装方針は次で固定するのが良いです。

推奨方針
Frontend: Next.js on Vercel
App / Data: Supabase
Content Engine: Strapi
Newsletter: 独立したメルマガ基盤（配信は専用プロバイダ連携）
AI: Vercel Functions / Supabase Edge Functions / 外部LLM API
Analytics / Experiment: PostHog or GA4 + A/B制御
重要な設計判断
Strapi は Vercel ではなく別ホスト
Supabase はアプリ基盤の主DB
Strapi は専用DBまたは専用スキーマ相当で分離
メルマガ配信は自前SMTP運用ではなく配信事業者連携
AI改善ループは “CMSの外” に置く
2. 前提・制約
2.1 前提

本システムは以下を目的とする。

コーポレート/メディアサイトの構築
記事・イベント・お知らせ等の継続運用
AIによるコンテンツ改善
A/Bテストによる導線最適化
将来的なコミュニティ・会員導線との接続
メルマガ配信基盤の整備
2.2 技術前提
Strapi は Active/Maintenance LTS の Node.js を前提にしており、現行 docs では v20 / v22 / v24 がサポート対象です。
Strapi は PostgreSQL / MySQL / SQLite などのSQL DBをサポートし、コンテンツタイプ作成時に REST API を自動生成します。
Vercel は Functions / Cron Jobs / Edge Config を提供し、フロント表示制御や定期実行に向きます。
Supabase は Postgres / Auth / Storage / Realtime / Edge Functions / Vector embeddings を提供します。
2.3 制約
Strapi を Vercel のみで完結運用する構成は採用しない。
これは、Vercel 側が主に serverless / function 実行基盤であり、Strapi 側が常駐型 Node.js アプリ前提だからです。これは docs の性質からの設計上の推奨判断です。
Strapi docs では、既存DBや未サポートDB接続に注意があり、データ損失リスクも明記されています。したがって Supabase の DB を使う場合は Strapi 専用の分離領域で使うことを必須とします。
3. 全体アーキテクチャ
3.1 推奨構成
[User]
  ↓
[Vercel / Next.js Frontend]
  ├─ 読み取り: Strapi REST API
  ├─ 読み取り/書き込み: Supabase
  ├─ A/B制御: Edge Config / Middleware
  ├─ AI実行: Vercel Functions
  └─ Cron: 定期改善ジョブ / 配信ジョブ

[Strapi]
  ├─ 記事 / 固定ページ / CTA / イベント / 著者管理
  ├─ Webhook発火
  ├─ Email機能（通知用途）
  └─ 専用DB

[Supabase]
  ├─ Postgres（アプリDB）
  ├─ Auth（管理者/会員）
  ├─ Storage（画像/添付）
  ├─ Realtime
  ├─ Edge Functions
  └─ Newsletter購読者 / 配信履歴 / 実験ログ / AIログ
3.2 責務分離
Vercel / Next.js
表示
SEO
A/Bテスト
LP/CTA出し分け
実験制御
AI改善ジョブの起動
Strapi
編集UI
コンテンツモデル管理
下書き/公開
Webhook通知
管理者向けコンテンツ運用
Supabase
会員/購読者/イベント参加者/管理者補助データ
実験ログ
行動ログ
AI生成履歴
画像・ファイル
将来のコミュニティ基盤
4. スコープ
4.1 初期スコープ（Phase 1）
コーポレートサイト
記事投稿機能
イベント一覧/詳細
CTA管理
メルマガ購読フォーム
購読者管理
AIによる記事下書き支援
AIによるメタ情報改善支援
基本的なA/Bテスト
4.2 次期スコープ（Phase 2）
AIによる自動改稿提案
成果指標連動の改善ループ
メルマガ自動セグメント配信
イベント→メルマガ→会員導線の最適化
会員制導線
コミュニティ連携
4.3 スコープ外（初期）
フル自動公開
複雑なMA（Marketing Automation）
多段承認ワークフロー
決済課金
本格コミュニティSNS機能
5. 機能要件
5.1 コンテンツ管理
要件
記事を作成・編集・下書き保存・公開できること
固定ページを管理できること
イベント情報を管理できること
CTAブロックを管理できること
著者、カテゴリ、タグを管理できること
OGP、SEOメタ、slug を管理できること
コンテンツ更新時に webhook を発火できること
実装方針
Strapi の content-type を定義
Strapi webhook で Vercel / Supabase 側へ通知
Strapi は webhook を標準提供しています。
Strapi は content-type 作成時に REST API を自動生成します。
5.2 フロントサイト
要件
Next.js で SSR / SSG / ISR を使い分けること
記事、固定ページ、イベント、カテゴリページを表示できること
CTA の差し替えが可能であること
A/Bテスト対象の UI を切り替えられること
メルマガ登録導線を各所に配置できること
実装方針
Vercel でデプロイ
Middleware / Edge Config を用いて出し分け
Edge Config は feature flags や A/B testing 向け用途として案内されています。
5.3 AIコンテンツ改善
要件
記事下書きをAIで生成できること
タイトル案・見出し案・要約・CTA案を生成できること
既存記事に対し改善案を生成できること
AIの提案は即公開ではなく下書き保存できること
AI実行ログを保存できること
実装方針
Vercel Functions または Supabase Edge Functions から LLM API を実行
Vercel Functions は API/DB 接続を含むサーバー処理向けです。Supabase Edge Functions は webhook 受信や外部統合に向きます。
AI提案結果は Supabase に記録
承認後に Strapi へ反映
5.4 A/Bテスト
要件
タイトルA/B
CTA A/B
ヒーローセクション A/B
メルマガ登録導線 A/B
実験IDごとの成果比較
成果指標
CTR
CVR
メルマガ登録率
イベント申込率
スクロール率
平均滞在時間
実装方針
配信ロジックは Vercel 側
実験定義は Supabase で管理
一部実験条件は Edge Config に反映
Vercel の Cron Jobs は定期バッチ起動にも使えます。
5.5 メルマガサービス
要件
購読フォームをサイト上に設置できること
ダブルオプトイン対応を検討できること
購読者をセグメント管理できること
配信対象を絞り込めること
記事公開やイベント公開をトリガーに配信候補を生成できること
配信結果（送信、失敗、開封、クリック等の受領可能な範囲）を保存できること
配信停止・同意管理ができること
実装方針
購読者・配信履歴・セグメントは Supabase で管理
配信実行は専用メール配信事業者を使用
Strapi の Email 機能は主に通知・運営用途に限定
Strapi Email は SMTP や外部 provider 経由の送信機能です。
備考
大量配信を Strapi 単体の Email 機能で担う設計は採用しない
メルマガ本体は配信サービス連携が前提
5.6 認証・権限
要件
管理者認証
編集者権限
AIオペレーター権限
将来の会員認証拡張
管理画面と公開APIの責務分離
実装方針
Strapi 管理権限は Strapi 側
アプリ側の会員・購読者は Supabase Auth
将来 SSO 連携余地を残す
Supabase は Auth を提供します。
6. データ要件
6.1 Strapi 側主要コンテンツタイプ
Article
Page
Event
CTA
Category
Tag
Author
NewsletterCampaignTemplate
HeroVariant
SEOSettings
6.2 Supabase 側主要テーブル
users
subscribers
subscriber_consents
newsletter_campaigns
newsletter_deliveries
newsletter_segments
experiments
experiment_variants
experiment_assignments
conversion_events
ai_jobs
ai_outputs
content_performance_daily
media_assets_index
6.3 分離ルール
Strapi 管理対象データ と アプリ分析/配信/会員データ を論理的に分離する
Strapi 用 DB は専用で扱う
Supabase 側はアプリ用途中心で利用する
7. 非機能要件
7.1 可用性
フロントサイトは CDN 配信前提
CMS 障害時でも公開サイトの最低限閲覧は維持したい
メルマガ配信障害はサイト本体へ波及させない
7.2 性能
主要公開ページは高速配信
A/B判定で体感遅延を増やさない
AI処理は非同期ジョブ化
7.3 セキュリティ
秘密情報は Vercel / Supabase / Strapi 側の環境変数で管理
webhook は署名検証または秘密鍵付き
管理系APIはIP/認証制限
購読者個人情報は最小化
退会/削除要求に対応可能なデータ設計
7.4 監査・運用
公開操作ログ
AI実行ログ
メルマガ配信ログ
webhook 失敗ログ
cron 実行ログ
Vercel では Cron Jobs のログ確認が可能です。
8. 運用要件
8.1 編集運用
人間は最終承認者
AIは下書き・改善提案・件名提案・セグメント提案を担う
下書きと公開を分離
公開前プレビューを持つ
8.2 AI運用
AIが自動生成した案はバージョン保存
生成理由、入力プロンプト、参照データを保持
成果の悪い案は自動採用しない
8.3 配信運用
配信前に対象件数を確認可能
テスト配信可能
停止リスト管理
スパム苦情/解除率を監視
9. 代表ユースケース
UC-01 記事公開
編集者が Strapi で記事作成
公開時に Strapi webhook 発火
Vercel が再検証/再生成
Supabase に公開履歴記録
必要に応じてメルマガ候補生成
UC-02 AI改善提案
Cron で低成果記事抽出
AI がタイトル/CTA/要約改善案を生成
Supabase に候補保存
Strapi に下書き反映
人が承認後に公開
UC-03 メルマガ配信
新規記事またはイベント公開
配信候補キャンペーン生成
セグメント抽出
テスト配信
本配信
結果を Supabase に記録
10. リスク・論点
10.1 最大の論点

Strapi と Supabase の責務境界を曖昧にしないこと

悪い設計
Strapi 管理対象とアプリDBを同居
CMS と実験ロジックが密結合
メルマガ大量配信を Strapi 側だけで実施
良い設計
Strapi はコンテンツ管理に集中
Supabase は購読者/会員/実験/分析に集中
配信は専用 provider
AI改善は独立ジョブ
10.2 技術リスク
Strapi DB設計を後から変えにくい
AI自動化を急ぎすぎると品質事故が出る
A/Bテストは計測設計が甘いと無意味
メール配信は法令・同意管理が必要
11. 推奨フェーズ
Phase 1: 基盤
Vercel + Next.js
Strapi 基本モデル
Supabase 基本テーブル
メルマガ購読フォーム
手動配信
Phase 2: AI支援
AI下書き
AI要約
AI CTA提案
配信候補自動生成
Phase 3: 最適化
A/Bテスト
成果指標連動
自動改善ループ
セグメント配信
Phase 4: 拡張
会員導線
コミュニティ導線
レコメンド
ナレッジ検索
12. 決定事項（現時点案）
フロントは Next.js on Vercel
アプリ基盤は Supabase
コンテンツエンジンは Strapi
Strapi は 別ホスト
メルマガは 専用 provider 連携前提
AI改善ループは CMS外部のジョブ基盤
初期は 人間承認あり
将来は AI比率を上げる
13. 未解決事項
Strapi のホスティング先をどこにするか
Strapi Cloud
VPS
Railway / Render / Fly.io / Docker基盤
メルマガ配信 provider を何にするか
分析基盤を GA4 / PostHog / 併用のどれにするか
認証を管理者のみで始めるか、会員も初期から入れるか
Strapi DB を Supabase に置くか、別Postgresにするか
→ 安全性重視なら別DB推奨
14. 次のアクション
この要件定義を v0.1 として固定
画面一覧
公開サイト
Strapi 管理画面
購読者管理画面
実験管理画面
AI改善レビュー画面
データモデル定義
Strapi content-types
Supabase table schema
インフラ構成決定
Strapi hosting
domain/subdomain 設計
メルマガ provider 決定
AI改善フローの承認ルール決定
15. すぐ使える設計メモ
ドメイン案
example.com → フロント
cms.example.com → Strapi
api.example.com → 必要なら app API
go.example.com → 計測付き導線/短縮URL
news.example.com → 将来の配信/アーカイブ用途
最初の MVP
記事投稿
イベント投稿
CTA管理
メルマガ登録
AI下書き
タイトルA/B