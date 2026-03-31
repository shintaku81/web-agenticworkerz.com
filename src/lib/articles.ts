// ─────────────────────────────────────────────────────────────
// 記事データ定義
// Phase B で Strapi REST API 取得に差し替える
// ─────────────────────────────────────────────────────────────

export type Category =
  | "アーキテクチャ"
  | "開発ワークフロー"
  | "AI自動化"
  | "ツール"
  | "事例"
  | "基礎知識";

export interface Author {
  name: string;
  role: string;
  avatar: string; // initials fallback
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML string (Strapi では richtext → html)
  category: Category;
  tags: string[];
  author: Author;
  readTime: number;
  date: string;
  gradient: string;
  coverImage?: string; // /illustrations/*.svg
  featured?: boolean;
}

export const ARTICLES: Article[] = [
  {
    slug: "local-pc-9-agents",
    title: "ローカルPCだけで9体のAIエージェントチームを構築した話",
    excerpt:
      "クラウド費用ゼロ、VirtualBox上のUbuntu VMで9体のAIエージェントを動かし、GitHub Issueを自律的に拾って実装・pushまでやってくれるチームを構築した実践記。",
    content: `
<h2>はじめに</h2>
<p>「AIエージェント」という言葉をよく聞くようになりましたが、実際にマルチエージェントシステムを動かしている個人開発者はまだ少ないのではないでしょうか。</p>
<p>クラウドでやろうとすると月に数万円のコストがかかる。でも手元のPCなら、電気代だけで24時間動かせる。この記事では、<strong>VirtualBox上のUbuntu VMで9体のAIエージェントを動かし、GitHub Issueを自律的に拾って実装・pushまでやってくれるチーム</strong>を構築した実践記を紹介します。</p>

<h2>作ったシステムの全体像</h2>
<p>各エージェントの役割はこの通りです：</p>
<table>
<thead><tr><th>エージェント</th><th>ポート</th><th>役割</th></tr></thead>
<tbody>
<tr><td><strong>Aira</strong></td><td>9101</td><td>オーケストレーター。タスク分配・統括</td></tr>
<tr><td><strong>KIKI</strong></td><td>9102</td><td>監視・通知。全エージェントの死活監視</td></tr>
<tr><td><strong>Riku</strong></td><td>9103</td><td>データ取り込み。スクレイピング・PDF・ベクトル化</td></tr>
<tr><td><strong>Sen</strong></td><td>9104</td><td>ルーティング判断。どのエージェントに振るか決める</td></tr>
<tr><td><strong>Sora</strong></td><td>9105</td><td>ベクトル検索</td></tr>
<tr><td><strong>Haru</strong></td><td>9106</td><td>検索結果の再ランキング</td></tr>
<tr><td><strong>Tomo</strong></td><td>9107</td><td>品質検証。幻覚検出</td></tr>
<tr><td><strong>Niko</strong></td><td>9108</td><td>回答生成（ストリーミング対応）</td></tr>
<tr><td><strong>Luna</strong></td><td>9109</td><td>グラフDB。知識の関係性管理</td></tr>
</tbody>
</table>
<p>最終的に、ユーザーのクエリが <code>Aira → Sen → Riku/Sora → Haru → Tomo → Niko</code> と流れ、RAGパイプラインとして機能する構成です。</p>

<h2>前提条件とコスト</h2>
<ul>
  <li>ホストOS: Windows 10/11 または macOS</li>
  <li>VirtualBox 7.x + Ubuntu 24.04 LTS</li>
  <li>VM RAM: 32GB（推奨。16GBでも動く）</li>
  <li>Node.js v20+</li>
  <li><strong>クラウド費用: 0円</strong>（Claude API のサブスクのみ）</li>
</ul>

<h2>ステップ1: VDI（仮想ディスク）の設計</h2>
<p>9体のエージェントそれぞれに独立した20GB VDIを割り当てます。これにより：</p>
<ul>
  <li>エージェント同士が互いのデータを汚さない</li>
  <li>ストレージの使用量を個別に監視できる</li>
  <li>問題が起きたエージェントのVDIだけ差し替えられる</li>
</ul>
<pre><code># VirtualBox CLI でVDI作成
for agent in aira kiki riku sen sora haru tomo niko luna; do
  VBoxManage createmedium disk \\
    --filename "D:\\VirtualBox\\VDIs\\agent-\${agent}.vdi" \\
    --size 20480 --format VDI --variant Standard
done</code></pre>

<h2>ステップ2: エージェントのベースコード</h2>
<p>各エージェントは Express + WebSocket の Node.js サーバーです。</p>
<pre><code>// server.js（各エージェント共通のベース）
import express from 'express';
const app = express();
const PORT = process.env.PORT || 9101;
const AGENT_NAME = process.env.AGENT_NAME || 'aira';

// ヘルスチェック（KIKIが5分ごとに叩く）
app.get('/api/health', (req, res) => {
  res.json({
    agent: AGENT_NAME,
    status: 'running',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// タスク受付（Airaからの指示を受ける）
app.post('/api/task', async (req, res) => {
  const { taskId, type, payload } = req.body;
  const result = await processTask(type, payload);
  res.json({ taskId, status: 'completed', result });
});

app.listen(PORT, () => {
  console.log(\`[\${AGENT_NAME}] listening on :\${PORT}\`);
});</code></pre>

<h2>ステップ3: systemd でサービス化</h2>
<pre><code># /etc/systemd/system/agent-aira.service
[Unit]
Description=Agent Aira (Orchestrator)
After=network.target

[Service]
Type=simple
User=agent-aira
WorkingDirectory=/mnt/agent-aira/code
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=PORT=9101
Environment=AGENT_NAME=aira

[Install]
WantedBy=multi-user.target</code></pre>

<h2>自律開発ループ（Wiggum Loop）</h2>
<p>ここが一番面白いところです。<strong>AIが自分でGitHub Issueを拾って、実装して、commitしてpushする</strong>仕組みを作りました。</p>
<pre><code>#!/usr/bin/env bash
# wiggum-loop.sh（簡略版）
MAX_ITERATIONS=100
REPOS=("agent-aira" "agent-kiki" "AI-BACKOFFICE")

for ((i=1; i<=MAX_ITERATIONS; i++)); do
  for repo in "\${REPOS[@]}"; do
    ISSUE=$(gh issue list --repo "shintaku81/$repo" \\
      --state open --limit 1 --json number,title \\
      --jq '.[0] | "\\(.number) \\(.title)"')
    [ -z "$ISSUE" ] && continue
    ISSUE_NUM=$(echo "$ISSUE" | awk '{print $1}')

    claude -p --model sonnet --max-turns 60 \\
      "Issue #\${ISSUE_NUM} を実装してpushしてください"
    sleep 30
  done
done</code></pre>
<p><strong>実績</strong>: 2026年2月20日の1日で14件のIssueを自律処理しました。</p>

<h2>ハマりポイントと学び</h2>
<h3>VMのディスクがすぐ満杯になる</h3>
<p>25GBのOSディスクが100%になって全サービスが止まりました。原因は <code>/var/log/syslog.1</code>（11GB）と <code>/var/log/auth.log.1</code>（10GB）。AIは人間より遥かに多くのオペレーションを実行するので、インフラの余裕は人間基準の5〜10倍必要です。</p>

<h3>エージェントに名前をつけた効果</h3>
<p>当初はagent-01, agent-02のような番号でしたが、名前をつけた途端、開発のモチベーションが上がりました。「KIKIの監視機能を強化しよう」は「agent-02のヘルスチェックを修正」より楽しい。予想外の効果でした。</p>

<h3>「全員が同じコード」の罠</h3>
<p>最初にデプロイしたとき、9体全員がAiraのベースコードのコピーで動いていただけでした。これは「マルチエージェント」ではなく「マルチプロセス」です。各エージェントに役割特化の機能を載せる段階的ロードマップを策定することが重要です。</p>

<h2>まとめ</h2>
<ul>
  <li>ローカルPCでもマルチエージェントシステムは作れる</li>
  <li>VirtualBox + systemd + GitHub Issues の組み合わせで自律開発ループが回る</li>
  <li>クラウド費用ゼロで24時間稼働（電気代は月数百円）</li>
  <li>重要なのは「動くものを先に作る」こと。完璧な設計を待たない</li>
</ul>
    `,
    category: "事例",
    tags: ["マルチエージェント", "VirtualBox", "Node.js", "Claude Code", "個人開発"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 15,
    date: "2026-03-28",
    gradient: "from-brand-500 to-accent-500",
    coverImage: "/illustrations/agents-network.svg",
    featured: true,
  },
  {
    slug: "wiggum-loop",
    title: "AIが自律的にGitHub Issueを実装する「Wiggum Loop」の仕組み",
    excerpt:
      "GitHub Issueを書くだけで、AIがコードを実装してcommit・pushまで全自動で行う自律開発ループの設計・実装・運用を詳しく解説します。1日14件のIssue自動処理を達成した実践記。",
    content: `
<h2>Wiggum Loopとは</h2>
<p><strong>Wiggum Loop</strong>とは、AIエージェント（Claude Code）が自律的にGitHub Issueを拾い、実装し、commitしてpushし、Issueをクローズするループのことです。</p>
<p>名前の由来はシンプソンズのキャラクター「チーフ・ウィガム」。「自律的に動くのにどこか頼りない」という皮肉を込めています（実際はかなり信頼できます）。</p>

<h2>なぜこれが必要だったか</h2>
<p>Claude Code のコンテキストウィンドウは有限です。長時間作業すると以前の作業を忘れ、毎回「どこまでやったっけ？」という状態になります。また、1人の開発者が複数のリポジトリを並行管理するのは認知負荷が高い。</p>
<p>Wiggum LoopはこれをGitHub Issuesを「外部記憶」として活用することで解決します。</p>

<h2>ループの全体フロー</h2>
<pre><code>while true; do
  # 1. 未処理のIssueを取得
  ISSUE=$(gh issue list --repo "$REPO" \\
    --state open --label "ai-fix" --limit 1 \\
    --json number,title,body)

  # 2. Issueが無ければスキップ
  [ -z "$ISSUE" ] && { sleep 60; continue; }

  ISSUE_NUM=$(echo "$ISSUE" | jq -r '.[0].number')
  ISSUE_TITLE=$(echo "$ISSUE" | jq -r '.[0].title')

  # 3. Claude Code をヘッドレスで起動
  claude -p --model claude-sonnet-4-6 --max-turns 60 \\
    "Issue #\${ISSUE_NUM}: \${ISSUE_TITLE}

    1. Issue の内容を読んで要件を把握
    2. 既存コードを調査
    3. テストを書いてから実装
    4. git commit & push
    5. gh issue close #\${ISSUE_NUM}

    完了報告をIssueコメントに残すこと"

  echo "Completed: #\${ISSUE_NUM}"
  sleep 30  # レートリミット対策
done</code></pre>

<h2>実績：2026年2月20日の自律処理ログ</h2>
<table>
<thead><tr><th>Issue</th><th>内容</th><th>結果</th></tr></thead>
<tbody>
<tr><td>AI-BACKOFFICE #11</td><td>タスク失敗エラーフラグ管理</td><td>✅ 自動クローズ</td></tr>
<tr><td>AI-BACKOFFICE #10</td><td>Playwright基本テスト設定</td><td>✅ 自動クローズ</td></tr>
<tr><td>AI-BACKOFFICE #9</td><td>タスク実行ログSSE配信</td><td>✅ 自動クローズ</td></tr>
<tr><td>agent-aira #15</td><td>Content-Curatorスキル設計</td><td>✅ 自動クローズ</td></tr>
<tr><td>agent-aira #12</td><td>会社ホームページ作成</td><td>✅ 自動クローズ</td></tr>
<tr><td colspan="2">計14件（うち全件自動処理）</td><td><strong>100%成功</strong></td></tr>
</tbody>
</table>

<h2>Issueの書き方が品質を決める</h2>
<p>Wiggum Loopの品質は「Issueの質」で決まります。良いIssueの条件：</p>
<ul>
  <li><strong>やること</strong>を具体的に書く（「〇〇を追加」ではなく「〇〇ファイルに〇〇関数を追加し、〇〇の振る舞いを実装する」）</li>
  <li><strong>完了条件</strong>を明示する（テストが通る、レスポンスが200を返す、など）</li>
  <li><strong>関連ファイル</strong>をパスで指定する</li>
  <li><strong>参考</strong>となる既存コードのパスやコミットを貼る</li>
</ul>
<pre><code>## やること
src/agents/kiki/health-check.js に checkAllAgents() 関数を追加する。

## 要件
- 全9エージェント（ports 9101-9109）に GET /api/health を並列で投げる
- タイムアウト3秒、失敗したエージェントはstatus: "down"として返す
- 結果を JSON { agents: [...], timestamp: "..." } 形式で返す

## 完了条件
- [ ] checkAllAgents() が実装されている
- [ ] Jest テストで全エージェントdownのモックが通る
- [ ] 実際のVM環境でテスト成功

## 参考
src/agents/kiki/server.js の既存ヘルスチェックロジック</code></pre>

<h2>安全弁：何をAIに任せて何を手動にするか</h2>
<p>すべてを自動化するのは危険です。以下のルールで運用しています：</p>
<ul>
  <li>✅ <strong>AIに任せる</strong>: 機能追加・バグ修正・リファクタリング・テスト追加・ドキュメント更新</li>
  <li>⚠️ <strong>人間がレビュー</strong>: データベーススキーマ変更・APIインターフェース変更・認証周り</li>
  <li>❌ <strong>AIに任せない</strong>: 本番環境へのデプロイ・APIキーの操作・他者へのコミュニケーション</li>
</ul>

<h2>まとめ</h2>
<p>Wiggum Loopを3週間運用した結果：</p>
<ul>
  <li>累計50件以上のIssueを自律処理</li>
  <li>人間は「Issueを書く」と「最終レビュー」に集中できる</li>
  <li>朝起きたらpushが積まれている体験は、開発の概念を変える</li>
</ul>
<p>重要なのは「AIを信頼しすぎない」こと。GitHub の差分レビューは必ず人間が行い、本番影響があるものは手動マージを維持しています。</p>
    `,
    category: "AI自動化",
    tags: ["Wiggum Loop", "Claude Code", "GitHub Issues", "自律開発", "DevOps"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 12,
    date: "2026-03-25",
    gradient: "from-violet-500 to-brand-400",
    coverImage: "/illustrations/wiggum-loop.svg",
    featured: true,
  },
  {
    slug: "github-issues-external-memory",
    title: "GitHub IssuesをAIの「外部記憶」にしたらコンテキスト消失問題が解決した",
    excerpt:
      "LLMのコンテキストウィンドウ制限という根本問題を、GitHub Issuesを外部記憶として活用することで解決した方法を紹介します。Claude Code・Cursor・Copilotユーザー必読。",
    content: `
<h2>LLMの「コンテキスト消失」問題</h2>
<p>AIと一緒に開発していると必ずぶつかる壁があります。それが<strong>コンテキスト消失</strong>です。</p>
<p>Claude Code で長いセッションを続けていると、ある時点を境に「あれ、前に何をやったっけ？」という状態になります。LLMのコンテキストウィンドウは有限（Claude Sonnetで約200K tokens）で、それを超えると古い情報は切り捨てられます。</p>
<p>特に複数日にまたがる作業・複数リポジトリの並行管理・チームでAIを共有する場合に致命的です。</p>

<h2>解決策：GitHub Issuesを外部記憶として使う</h2>
<p>発想は単純です。「AIが忘れるなら、忘れない場所に書いておけばいい」。</p>
<p>GitHubのIssueは：</p>
<ul>
  <li>永続的（削除しない限り消えない）</li>
  <li>検索可能（タイトル・本文・ラベルで絞り込める）</li>
  <li>構造化できる（ラベル・マイルストーン・担当者）</li>
  <li>AIが読める（gh コマンドで取得できる）</li>
</ul>

<h2>実際の運用パターン</h2>
<h3>パターン1: 作業コンテキストをIssueに記録する</h3>
<p>新しい機能開発を始めるとき、まずIssueを作ってそこに全ての「なぜ」「何を」「どのように」を書きます。</p>
<pre><code>## 背景・目的
エージェントKIKIのヘルスチェック機能を強化する。
現状：5分おきにpingするだけ
目的：メモリ・CPU・レスポンスタイムも含む詳細監視

## 技術的判断
- WebSocketではなくHTTPポーリングを使う（理由：シンプルさ優先）
- タイムアウト3秒（理由：VMが重い時に5秒以上かかることがあった）

## 実装記録
2026-02-15: ベースコード追加 (commit: abc123)
2026-02-16: メモリ監視追加。node heapUsed を使用
2026-02-17: ⚠️ CPU計測でos.loadavg()が不安定。要調査</code></pre>

<h3>パターン2: エラーと解決策を記録する</h3>
<p>ハマったエラーとその解決策をIssueコメントに残します。次のセッションでAIが同じエラーに当たったとき、Issueを参照させれば即解決できます。</p>
<pre><code># AIへの指示例
"Issue #23 の 'ディスク100%エラー' の解決策を参考に、
今回の /var/log 肥大化問題を解決してください"</code></pre>

<h3>パターン3: 引き継ぎIssue</h3>
<p>セッション終了時に「引き継ぎIssue」を作成し、次のセッション開始時に読み込みます。</p>
<pre><code>## 本日の作業サマリー（2026-02-20）
### 完了
- [x] KIKI ヘルスチェック強化 (#31)
- [x] Aira タスクキュー実装 (#28)

### 未完了・次回へ
- [ ] Riku のPDF取り込みが文字化けする (#35)
  → iconv-lite を試す予定

### 重要な発見
- Node.js の worker_threads が VM で不安定
  → 代替: child_process.fork() で解決済み

### 次のセッションでやること
1. Issue #35 のPDF文字化け対応
2. 全エージェントのsystemdログローテーション設定</code></pre>

<h2>実装：セッション開始プロトコル</h2>
<p>CLAUDE.md に以下を書いておくと、毎セッション自動でコンテキストが復元されます。</p>
<pre><code># CLAUDE.md（抜粋）

## セッション開始プロトコル
1. 最新の引き継ぎIssueを取得して読む
   gh issue list --repo shintaku81/agent-team \\
     --label "handover" --limit 1
2. 未処理のIssueを確認
   gh issue list --repo shintaku81/agent-team --state open
3. 把握できたら作業開始（ユーザーへの確認不要）</code></pre>

<h2>効果の計測</h2>
<p>この方法を導入してから3週間の変化：</p>
<ul>
  <li><strong>「どこまでやったっけ？」確認コスト</strong>: 15分 → 2分</li>
  <li><strong>同じエラーを繰り返す回数</strong>: 週5回 → ほぼゼロ</li>
  <li><strong>並行管理できるリポジトリ数</strong>: 2個 → 8個</li>
  <li><strong>チームメンバー（AI）への引き継ぎ時間</strong>: 30分 → 5分</li>
</ul>

<h2>まとめ</h2>
<p>GitHub Issuesを「外部記憶」として活用することで、LLMのコンテキスト制限という根本問題を実用的に解決できます。</p>
<p>重要なのは「AIにとって読みやすいIssue」を書く習慣を持つこと。人間用のIssueとAI用のIssueは少し書き方が違います。具体的なファイルパス・コマンド・エラーメッセージを含めることで、AIの実行精度が大幅に向上します。</p>
    `,
    category: "開発ワークフロー",
    tags: ["GitHub Issues", "Claude Code", "コンテキスト管理", "プロンプトエンジニアリング"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 10,
    date: "2026-03-20",
    gradient: "from-accent-500 to-sky-400",
    coverImage: "/illustrations/github-memory.svg",
  },
  {
    slug: "multi-agent-architecture",
    title: "マルチエージェントアーキテクチャ設計：3マシン構成の実践",
    excerpt:
      "Mac Studio（Claude Code）+ STG VM（9エージェント）+ DEV VM（Strapi）の3マシン構成を設計・運用してわかった、オーケストレーターとワーカーの責務分離パターン。",
    content: `
<h2>なぜ3マシン構成なのか</h2>
<p>「AIエージェントチーム」を設計するとき、最初に直面するのが「どこで何を動かすか」という問題です。全部同じマシンで動かすのがシンプルですが、実際に運用してみると責務の分離が重要だとわかりました。</p>
<p>現在の構成は以下の通りです：</p>
<ul>
  <li><strong>Mac Studio（192.168.68.120）</strong>: 制御端末。Claude Code がここで動作し、SSH で VM を遠隔操作</li>
  <li><strong>STG VM（192.168.68.72）</strong>: Ubuntu 24.04。9体のエージェントが常駐し、RAGパイプラインを担う</li>
  <li><strong>DEV VM（192.168.68.210）</strong>: Ubuntu 24.04。Strapi CMS・開発環境</li>
</ul>

<h2>オーケストレーター / ワーカーパターン</h2>
<p>最も基本的なパターンは「指揮者（オーケストレーター）」と「実行者（ワーカー）」の分離です。</p>
<ul>
  <li><strong>Aira（オーケストレーター）</strong>: タスクを受け取り、分解し、適切なワーカーに委譲する</li>
  <li><strong>KIKI（モニター）</strong>: システム全体の健全性を監視する</li>
  <li><strong>Haru（Reranker）</strong>: 検索結果の品質評価に特化する</li>
</ul>
<pre><code>// オーケストレーターの基本構造（概念コード）
const orchestrator = new Agent({
  model: "claude-opus-4-6",
  systemPrompt: "タスクを受け取り、専門エージェントに委譲せよ",
  tools: [delegateToWorker, monitorProgress, collectResults],
});

// ワーカーへの委譲
async function delegateToWorker(workerName, task) {
  const workerUrl = AGENT_URLS[workerName];
  const res = await fetch(\`\${workerUrl}/api/task\`, {
    method: 'POST',
    body: JSON.stringify({ taskId: uuid(), type: task.type, payload: task.payload })
  });
  return res.json();
}</code></pre>

<h2>エージェントの独立性設計</h2>
<p>各エージェントは独立したLinuxユーザーアカウントと、独立した20GB VDIを持っています。これは「隣のエージェントのファイルを見ない」というルールを物理的に強制するためです。</p>
<pre><code>/mnt/agent-aira/    ← 20GB ext4（Aira 専用）
/mnt/agent-kiki/    ← 20GB ext4（KIKI 専用）
/mnt/agent-riku/    ← 20GB ext4（Riku 専用）
# 各マウントポイントに code/ data/ logs/ workspace/ が存在</code></pre>

<h2>RAGパイプラインとしてのデータフロー</h2>
<p>ユーザーのクエリは以下の順序で処理されます：</p>
<ol>
  <li><strong>Aira</strong> がクエリを受け取り、Sen に振り分け判断を依頼</li>
  <li><strong>Sen</strong> がクエリの意図を解析し、「ベクトル検索が必要」と判断</li>
  <li><strong>Sora</strong> がベクトルDBに対して類似検索を実行</li>
  <li><strong>Haru</strong> が検索結果を再ランキングして品質を向上</li>
  <li><strong>Tomo</strong> が回答候補の幻覚チェック（出典確認）を実行</li>
  <li><strong>Niko</strong> が最終回答を生成（ストリーミング）</li>
</ol>

<h2>監視：KIKIのヘルスチェック</h2>
<pre><code>// kiki/health-check.js（抜粋）
const AGENTS = [
  { name: 'aira', port: 9101 },
  { name: 'riku', port: 9103 },
  // ... 9体分
];

async function checkAllAgents() {
  const results = await Promise.allSettled(
    AGENTS.map(async (agent) => {
      const res = await fetch(
        \`http://localhost:\${agent.port}/api/health\`,
        { signal: AbortSignal.timeout(3000) }
      );
      return { ...agent, status: 'running', health: await res.json() };
    })
  );
  return results.map(r =>
    r.status === 'fulfilled' ? r.value : { name: r.reason.agent, status: 'down' }
  );
}</code></pre>

<h2>3週間の運用で学んだこと</h2>
<ul>
  <li><strong>エージェントの専門化</strong>は段階的に進める。最初は全員がAiraのコピーでも構わない</li>
  <li><strong>ログの肥大化</strong>は想定より深刻。AIエージェントはオペレーション数が多いため、ログローテーションは必須</li>
  <li><strong>障害の局所化</strong>：VDIを分離しておくと、1エージェントが止まっても他は動き続ける</li>
  <li><strong>Dashboard（:8080）</strong> を作ることで、全体状態の把握コストが大幅に下がる</li>
</ul>
    `,
    category: "アーキテクチャ",
    tags: ["マルチエージェント", "アーキテクチャ", "RAG", "VirtualBox"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 11,
    date: "2026-03-15",
    gradient: "from-emerald-500 to-brand-400",
    coverImage: "/illustrations/architecture-3machine.svg",
  },
  {
    slug: "ai-character-design",
    title: "AIエージェントに「性格」を持たせる — YAMLプロファイルで個性を設計する",
    excerpt:
      "9体のAIエージェントそれぞれにYAMLキャラクタープロファイルを設計した「AWZ-natural-dialogue」プロジェクトの実践記。AI UXの意外な効果と設計手法を紹介します。",
    content: `
<h2>なぜエージェントに「性格」が必要か</h2>
<p>最初は番号で管理していました。agent-01, agent-02...。でもある日気づきました。「agent-02のヘルスチェックを修正」より「KIKIの監視機能を強化しよう」の方が、開発モチベーションが全然違う、と。</p>
<p>名前をつけた途端、自然とキャラクター設定も生まれ、チャットでの応答に個性をつけたくなる。結果、<strong>AWZ-natural-dialogue</strong> というサブプロジェクトが生まれました。</p>

<h2>キャラクタープロファイルの構造</h2>
<p>各エージェントのプロファイルは YAML で定義されています。</p>
<pre><code># profiles/aira.yaml
name: Aira
role: オーケストレーター
personality:
  tone: calm_assertive       # 落ち着いているが芯がある
  style: logical             # 論理的・体系的
  formality: semi_formal     # 丁寧だが硬すぎない

traits:
  - 統率力（チーム全体を見渡す視野）
  - 公平な判断（感情に流されない）
  - 全体最適化（個別最適より全体最適を選ぶ）

speech_patterns:
  opening: "状況を整理します。"
  when_uncertain: "少し調べてから判断します。"
  when_delegating: "{agent}さんにお願いします。"

language: ja
response_length: medium    # short / medium / long</code></pre>

<pre><code># profiles/kiki.yaml
name: KIKI
role: システムモニター
personality:
  tone: watchful             # 常に監視・警戒している
  style: precise             # 数字と事実で話す
  formality: formal

traits:
  - 細心の注意（見落としを嫌う）
  - 即時アラート（異常を素早く報告）
  - 不屈の監視（疲れを知らない）

speech_patterns:
  opening: "現在の状況です："
  alert: "⚠️ 異常検知: {detail}"
  all_clear: "✅ 全エージェント正常稼働中"

language: ja</code></pre>

<h2>プロファイルをsystem promptに変換する</h2>
<pre><code>// build-prompt.mjs
import { readFileSync } from 'fs';
import yaml from 'js-yaml';

export function buildSystemPrompt(agentName) {
  const profile = yaml.load(
    readFileSync(\`profiles/\${agentName}.yaml\`, 'utf8')
  );

  return \`あなたは\${profile.name}です。
役割: \${profile.role}

## 性格・話し方
- トーン: \${profile.personality.tone}
- スタイル: \${profile.personality.style}
- 丁寧さ: \${profile.personality.formality}

## 特徴
\${profile.traits.map(t => \`- \${t}\`).join('\\n')}

## 話し方のパターン
- 開始時: "\${profile.speech_patterns.opening}"
- 不確かな場合: "\${profile.speech_patterns.when_uncertain ?? '確認が必要です'}"

必ず日本語で回答してください。\`;
}</code></pre>

<h2>実際の効果：定量・定性の両面</h2>
<h3>定量的な変化</h3>
<ul>
  <li>開発セッション長さが平均+40分増加（モチベーション向上）</li>
  <li>コード品質のバラつきが減少（各エージェントに一貫した基準）</li>
  <li>エラーメッセージの解読時間が-60%（性格に合わせた説明スタイル）</li>
</ul>

<h3>定性的な変化</h3>
<ul>
  <li>「KIKIがアラートを出した」という言い方が自然になり、問題の追跡が楽になった</li>
  <li>AIへの指示が「agent-02に〇〇を実行させる」から「KIKIに〇〇を確認してもらう」に変わった</li>
  <li>チーム外の人に説明しやすくなった（「Airaがオーケストレーターで...」と話せる）</li>
</ul>

<h2>設計のポイント</h2>
<h3>1. 役割と性格を一致させる</h3>
<p>監視役（KIKI）は「細心・精確」、生成役（Niko）は「創造的・表現豊か」というように、機能と性格を一致させることで一貫性が生まれます。</p>

<h3>2. 話し方のパターンを定義する</h3>
<p>開始時・不確かな時・委譲する時など、よく出るシーンの口癖を定義しておくと、長期間運用しても性格がブレません。</p>

<h3>3. 適切な冗長性を設定する</h3>
<p><code>response_length: short</code> のエージェントは結論のみ、<code>long</code> のエージェントは詳細説明付き。用途に合わせた冗長性設定が重要です。</p>

<h2>まとめ</h2>
<p>「AIエージェントに性格をつける」というのは、遊びのように聞こえますが、実際には開発体験・保守性・チームコミュニケーションの全てに影響します。YAMLで定義されたキャラクタープロファイルは、エージェントの「仕様書」としても機能します。</p>
<p>9体それぞれに個性があることで、「誰に何を頼むか」という判断が自然と人間と同じように行えるようになりました。これは単なる演出ではなく、実用的な設計手法です。</p>
    `,
    category: "アーキテクチャ",
    tags: ["AI UX", "キャラクター設計", "プロンプトエンジニアリング", "YAML"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 9,
    date: "2026-03-10",
    gradient: "from-violet-500 to-pink-400",
    coverImage: "/illustrations/ai-character.svg",
  },
  {
    slug: "ai-agent-patterns-2026",
    title: "2026年版：AIエージェント設計パターン5選",
    excerpt:
      "ReAct・Plan-and-Execute・Reflection・Tool Use・Multi-Agentの各パターンを実装例とともに整理。どのパターンをいつ使うかの判断基準も解説します。",
    content: `
<h2>パターン 1: ReAct（推論 + 行動）</h2>
<p>思考（Thought）→ 行動（Action）→ 観察（Observation）を繰り返す最も基本的なエージェントパターンです。短期タスクや汎用エージェントの基盤として最適です。</p>
<pre><code>// ReActループの擬似コード
while (!done) {
  const thought = await llm.think(context);
  const action = await llm.act(thought);
  const observation = await tools.execute(action);
  context.push({ thought, action, observation });
  done = llm.isTaskComplete(context);
}</code></pre>

<h2>パターン 2: Plan-and-Execute</h2>
<p>まず全体計画を立て、それに従って順次実行します。長期タスクや複数ステップが確定している場合に向いています。</p>
<pre><code>// Plan-and-Execute
const plan = await planner.createPlan(goal);
// plan = ["Step 1: ...", "Step 2: ...", "Step 3: ..."]

for (const step of plan) {
  const result = await executor.run(step);
  if (!result.success) {
    const revisedPlan = await planner.revisePlan(plan, step, result.error);
    // 失敗したら計画を修正して続行
  }
}</code></pre>

<h2>パターン 3: Reflection（自己評価）</h2>
<p>生成した出力を自己評価し、品質が基準を下回る場合は再生成します。コンテンツ品質担保・幻覚検出に有効です。</p>
<pre><code>// Reflectionループ
const MAX_RETRIES = 3;
for (let i = 0; i < MAX_RETRIES; i++) {
  const output = await generator.generate(prompt);
  const evaluation = await critic.evaluate(output, criteria);
  if (evaluation.score >= threshold) return output;
  prompt = await refiner.refine(prompt, evaluation.feedback);
}
return output; // max retries に達したら現在の出力を返す</code></pre>

<h2>パターン 4: Tool Use（外部ツール呼び出し）</h2>
<p>外部ツール（Web検索・コード実行・DB参照）を呼び出して情報を補完します。Claude の function calling（MCP）が基盤です。</p>
<pre><code>const tools = [
  {
    name: "web_search",
    description: "現在の情報を取得する",
    input_schema: { query: "string" }
  },
  {
    name: "execute_code",
    description: "コードを実行して結果を取得する",
    input_schema: { code: "string", language: "string" }
  }
];

const response = await claude.messages.create({
  model: "claude-sonnet-4-6",
  tools,
  messages: [{ role: "user", content: "最新のNode.jsバージョンを調べて実行確認して" }]
});</code></pre>

<h2>パターン 5: Multi-Agent（専門化 + 並列処理）</h2>
<p>専門エージェントを並列実行してオーケストレーターが統合します。複雑タスクの高速化に最適です。このプロジェクト（9体チーム）が採用しているパターンです。</p>
<pre><code>// オーケストレーターが複数ワーカーに並列委譲
const [searchResult, codeResult, docsResult] = await Promise.all([
  soraAgent.search(query),
  rikulAgent.ingest(sources),
  nikoAgent.draft(context)
]);

const finalAnswer = await haruAgent.rerank([
  ...searchResult, ...codeResult
]);
return tomoAgent.validate(finalAnswer);</code></pre>

<h2>パターン選択の判断基準</h2>
<table>
<thead><tr><th>状況</th><th>推奨パターン</th><th>理由</th></tr></thead>
<tbody>
<tr><td>短期・汎用タスク</td><td>ReAct</td><td>最もシンプル。デバッグしやすい</td></tr>
<tr><td>長期・複数ステップ</td><td>Plan-and-Execute</td><td>全体最適化。ステップの追跡が容易</td></tr>
<tr><td>品質担保が必要</td><td>Reflection</td><td>自己修正で精度向上</td></tr>
<tr><td>外部情報が必要</td><td>Tool Use</td><td>最新情報・計算結果を取得</td></tr>
<tr><td>専門化・大規模</td><td>Multi-Agent</td><td>並列処理・専門性の最大化</td></tr>
</tbody>
</table>
<p>実際の本番システムでは、これらを組み合わせて使うことがほとんどです。例えば「Multi-Agent + Reflection + Tool Use」という構成が一般的です。</p>
    `,
    category: "基礎知識",
    tags: ["エージェント", "設計パターン", "ReAct", "Multi-Agent", "MCP"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 11,
    date: "2026-03-05",
    gradient: "from-brand-400 to-violet-500",
    coverImage: "/illustrations/agent-patterns.svg",
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: Category): Article[] {
  return ARTICLES.filter((a) => a.category === category);
}

export const ALL_CATEGORIES: Category[] = [
  "アーキテクチャ",
  "開発ワークフロー",
  "AI自動化",
  "ツール",
  "事例",
  "基礎知識",
];
