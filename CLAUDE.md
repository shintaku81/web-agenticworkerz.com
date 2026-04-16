# CLAUDE.md — web-agenticworkerz.com

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS v3（カスタムカラー `brand-*` あり）
- **メール送信**: Resend (`RESEND_API_KEY`)
- **メルマガ**: XServer SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
- **認証**: iron-session（管理画面ログイン）
- **アイコン**: lucide-react
- **コードハイライト**: shiki
- **3D**: three.js（HeroのAgentSphereコンポーネント）

## ディレクトリ構造

```
src/
├── app/                     # Next.js App Router
│   ├── api/                 # Route Handlers
│   │   ├── contact/route.ts
│   │   ├── subscribe/route.ts
│   │   ├── admin/articles/[slug]/route.ts
│   │   ├── admin/login/route.ts
│   │   ├── admin/logout/route.ts
│   │   └── cron/ai-improve/route.ts
│   ├── admin/               # 管理画面（iron-session認証）
│   ├── articles/            # 記事一覧・詳細
│   ├── events/              # イベント一覧・詳細
│   └── [contact|privacy|terms]/
├── components/              # Reactコンポーネント
└── lib/                     # データ・ユーティリティ
    └── articles.ts          # 記事データ（静的）
```

## コーディング規約

- **コンポーネント**: デフォルトエクスポート + 必要なら named interface export
- **APIルート**: `NextRequest` / `NextResponse` を使用
- **バリデーション**: API境界（route.ts）でのみ実施。内部ロジックで再バリデーションしない
- **Tailwind**: `className` に直接記述。`cn()` や `cva()` も使用可
- **インポートパス**: `@/*` で `src/` を参照
- **エラーハンドリング**: 外部API（Resend等）の失敗のみハンドル。内部エラーは投げてよい
- **型**: `any` を使わない。外部データは interface で定義してキャスト

## ルール（AIが守るべき制約）

1. **`src/` 外のファイルは編集しない**（`.next/`, `node_modules/` は絶対に触らない）
2. **環境変数を追加したら `.env.example` にも追記する**
3. **新しいパッケージ追加は慎重に**。依存は最小限に保つ
4. **管理画面 (`/admin/`) は iron-session で認証必須**
5. **APIルートはバリデーション → 処理 → レスポンス の構造で統一**

## よく使うコマンド

```bash
npm run dev          # 開発サーバー (localhost:3000)
npm run build        # プロダクションビルド
npm run lint         # ESLint（全体）
npx eslint <file>    # ファイル単体の ESLint
npx tsc --noEmit     # TypeScript 型チェック
```

## セッション開始時

1. `progress.md` を読んで進捗を把握する
2. `00_HANDOVER/` 配下の最新ハンドオーバーを確認する

## セッション終了時

1. `progress.md` を更新する（完了タスク・次のタスク・重要な決定事項）
2. `/handover` スキルでハンドオーバーノートを作成する
