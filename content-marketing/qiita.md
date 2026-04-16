# Qiita 記事 3本

---

## 記事1: Claude Code + MCPサーバーでGitHub自動化パイプラインを作る

**タイトル**: Claude Code + MCPサーバーでGitHub自動化パイプラインを作る

**タグ**: `Claude` `MCP` `GitHub` `自動化` `AI`

---

## はじめに

Claude CodeのMCP（Model Context Protocol）サポートを使うと、AIエージェントにGitHubを直接操作させるパイプラインを構築できる。

この記事では、以下のパイプラインを実装する。

1. Issue のトリアージ（ラベル付け・担当者アサイン）
2. PR のコードレビュー（自動コメント付き）
3. マージ後のリリースノート生成

MCPを介してClaude CodeがGitHub APIを呼び出す構成のため、コードの変更なしに動作を調整できる。

## 前提条件

- Node.js 18以上
- Claude Code CLI（最新版）
- GitHub Personal Access Token（repo権限）
- `@modelcontextprotocol/sdk` の理解

## アーキテクチャ

```
Claude Code
    ↓ MCP Protocol
GitHub MCPサーバー
    ↓ REST API
GitHub API
```

Claude Codeからの指示をMCPサーバーが受け取り、GitHub APIに変換して実行する。Claude Code自体はAPIの詳細を知る必要がない。

## Step 1: GitHub MCPサーバーの実装

```typescript
// github-mcp-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const BASE_URL = "https://api.github.com";

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "Content-Type": "application/json",
};

const server = new McpServer({
  name: "github-automation",
  version: "1.0.0",
});

// ツール定義: Issue一覧取得
server.tool(
  "list_issues",
  "指定リポジトリのIssue一覧を取得する",
  {
    owner: z.string().describe("リポジトリオーナー"),
    repo: z.string().describe("リポジトリ名"),
    state: z.enum(["open", "closed", "all"]).default("open"),
    labels: z.string().optional().describe("カンマ区切りのラベル名"),
  },
  async ({ owner, repo, state, labels }) => {
    const params = new URLSearchParams({ state });
    if (labels) params.append("labels", labels);

    const response = await fetch(
      `${BASE_URL}/repos/${owner}/${repo}/issues?${params}`,
      { headers }
    );
    const issues = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(issues, null, 2),
        },
      ],
    };
  }
);

// ツール定義: Issueにラベルを付ける
server.tool(
  "add_labels_to_issue",
  "IssueにラベルをアサインするでIT",
  {
    owner: z.string(),
    repo: z.string(),
    issue_number: z.number(),
    labels: z.array(z.string()).describe("付与するラベル名の配列"),
  },
  async ({ owner, repo, issue_number, labels }) => {
    const response = await fetch(
      `${BASE_URL}/repos/${owner}/${repo}/issues/${issue_number}/labels`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ labels }),
      }
    );
    const result = await response.json();

    return {
      content: [
        {
          type: "text",
          text: `ラベル付与完了: ${JSON.stringify(result)}`,
        },
      ],
    };
  }
);

// ツール定義: PRにコメントを追加
server.tool(
  "create_pr_review_comment",
  "PRにレビューコメントを追加する",
  {
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
    body: z.string().describe("コメント本文（Markdown対応）"),
    event: z.enum(["APPROVE", "REQUEST_CHANGES", "COMMENT"]).default("COMMENT"),
  },
  async ({ owner, repo, pull_number, body, event }) => {
    const response = await fetch(
      `${BASE_URL}/repos/${owner}/${repo}/pulls/${pull_number}/reviews`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ body, event }),
      }
    );
    const result = await response.json();

    return {
      content: [
        {
          type: "text",
          text: `レビュー完了: ID=${result.id}`,
        },
      ],
    };
  }
);

// ツール定義: コミット一覧取得（リリースノート用）
server.tool(
  "list_commits_between_tags",
  "2つのタグ間のコミット一覧を取得する",
  {
    owner: z.string(),
    repo: z.string(),
    base: z.string().describe("開始タグ or コミットSHA"),
    head: z.string().describe("終了タグ or コミットSHA"),
  },
  async ({ owner, repo, base, head }) => {
    const response = await fetch(
      `${BASE_URL}/repos/${owner}/${repo}/compare/${base}...${head}`,
      { headers }
    );
    const result = await response.json();
    const commits = result.commits?.map((c: any) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split("\n")[0],
      author: c.commit.author.name,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(commits, null, 2),
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Step 2: Claude Codeの設定

`.claude/settings.json` にMCPサーバーを登録する。

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["./github-mcp-server.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

## Step 3: Issueトリアージの自動化

Claude Codeに以下のプロンプトで指示する。

```
system: あなたはGitHubリポジトリの管理者です。
以下のルールでIssueのトリアージを行ってください：

ラベル付けルール:
- タイトルに「バグ」「error」「fix」が含まれる → "bug" ラベル
- タイトルに「機能」「feature」「追加」が含まれる → "enhancement" ラベル
- タイトルに「ドキュメント」「docs」が含まれる → "documentation" ラベル
- 本文が100文字未満 → "needs-more-info" ラベル

user: shintaku81/my-projectのopenなIssueをすべてトリアージしてください。
```

Claude Codeは `list_issues` ツールでIssueを取得し、各Issueを分析して `add_labels_to_issue` を呼び出す。

## Step 4: PRコードレビューの自動化

```
system: あなたはシニアエンジニアとしてコードレビューを行います。
以下の観点でレビューしてください：
1. セキュリティリスク（SQL injection, XSS等）
2. パフォーマンス上の問題
3. テストの欠落
4. 可読性

問題がある場合はREQUEST_CHANGESを、問題がなければAPPROVEを送ってください。

user: PR #42 (shintaku81/my-project) をレビューしてください。
```

## Step 5: リリースノートの自動生成

```
system: コミット一覧からリリースノートを生成します。
以下のフォーマットで出力してください：

# Release v{version}

## Breaking Changes
## New Features
## Bug Fixes
## Chores

各コミットを適切なカテゴリに分類し、Conventional Commits形式がない場合はコミットメッセージから推測してください。

user: v1.2.0からv1.3.0の間のコミット(shintaku81/my-project)からリリースノートを生成してください。
```

## 実行結果の例

```
$ claude "shintaku81/my-projectのIssueをトリアージしてください"

> list_issues(owner="shintaku81", repo="my-project", state="open")
  → 15件のIssueを取得

> Issueを分析中...
  - #23 「ログインページでエラーが出る」→ bug ラベル
  - #24 「ダークモードに対応してほしい」→ enhancement ラベル
  - #25 「」(本文なし) → needs-more-info ラベル

> add_labels_to_issue(issue_number=23, labels=["bug"])
> add_labels_to_issue(issue_number=24, labels=["enhancement"])
> add_labels_to_issue(issue_number=25, labels=["needs-more-info"])

トリアージ完了。15件中15件を処理しました。
```

## 注意点

**権限の最小化**: GitHubトークンは必要最小限の権限のみ付与する。リリースノート生成だけなら `repo:read` で十分。PR作成まで行うなら `repo:write` が必要。

**レート制限**: GitHub APIは認証済みリクエストで5000req/hの制限がある。大量のIssueを処理する場合は遅延を挟む実装を追加する。

**ハルシネーション対策**: コードレビューコメントは必ず人間がレビューしてから反映する運用にする。AI生成のレビューをそのまま本番PRにマージする運用は避ける。

## まとめ

Claude Code + MCPサーバーで以下を実現した。

- Issueの自動トリアージ（ラベル付け）
- PRの自動コードレビュー
- リリースノートの自動生成

MCPの設計が柔軟なため、ツールの追加・変更がコード修正なしに行えるのが強みだ。次のステップとして、Webhookと組み合わせてリアルタイムトリアージを実装するのが有望だ。

---

## 記事2: LLMエージェントのハーネス設計パターン5選：信頼性を上げるアーキテクチャ

**タイトル**: LLMエージェントのハーネス設計パターン5選：信頼性を上げるアーキテクチャ

**タグ**: `LLM` `エージェント` `アーキテクチャ` `Claude` `設計パターン`

---

## はじめに

LLMエージェントを本番環境で運用するとき、最大の課題は「信頼性」だ。

LLMは確率的に動作するため、同じ入力でも出力が変わる可能性がある。テストで通ったシナリオが本番で失敗することも珍しくない。

この記事では、エージェントの信頼性を高めるためのハーネス設計パターン5つを解説する。いずれも実際の本番システムで検証済みのパターンだ。

## パターン1: Guardrail Chain（ガードレールチェーン）

### 概要

エージェントの出力を複数のバリデーターが順次チェックするパターン。一つでも失敗すると処理を停止し、エラーを返す。

### 実装

```python
from typing import Callable, TypeVar
from dataclasses import dataclass

T = TypeVar("T")

@dataclass
class GuardrailResult:
    passed: bool
    reason: str | None = None

class GuardrailChain:
    def __init__(self, guardrails: list[Callable[[str], GuardrailResult]]):
        self.guardrails = guardrails

    def validate(self, output: str) -> GuardrailResult:
        for guardrail in self.guardrails:
            result = guardrail(output)
            if not result.passed:
                return result
        return GuardrailResult(passed=True)

# ガードレール定義
def no_pii(output: str) -> GuardrailResult:
    """個人情報が含まれていないかチェック"""
    import re
    patterns = [
        r"\d{3}-\d{4}-\d{4}",  # 電話番号
        r"\d{3}-\d{2}-\d{4}",  # マイナンバー風
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",  # メール
    ]
    for pattern in patterns:
        if re.search(pattern, output):
            return GuardrailResult(passed=False, reason=f"PII detected: {pattern}")
    return GuardrailResult(passed=True)

def max_length(limit: int) -> Callable[[str], GuardrailResult]:
    """文字数上限チェック"""
    def check(output: str) -> GuardrailResult:
        if len(output) > limit:
            return GuardrailResult(passed=False, reason=f"Output too long: {len(output)} > {limit}")
        return GuardrailResult(passed=True)
    return check

def no_code_execution(output: str) -> GuardrailResult:
    """コード実行命令が含まれていないかチェック（プロンプトインジェクション対策）"""
    dangerous_patterns = ["exec(", "eval(", "os.system(", "subprocess."]
    for pattern in dangerous_patterns:
        if pattern in output:
            return GuardrailResult(passed=False, reason=f"Dangerous pattern: {pattern}")
    return GuardrailResult(passed=True)

# 使用例
chain = GuardrailChain([no_pii, max_length(2000), no_code_execution])
result = chain.validate(llm_output)
if not result.passed:
    raise ValueError(f"Guardrail failed: {result.reason}")
```

### 使いどころ

- ユーザー向けの出力を生成するエージェント
- 法的・コンプライアンス上の制約がある場合
- プロンプトインジェクション攻撃のリスクがある場合

---

## パターン2: Retry with Backoff（リトライ・バックオフ）

### 概要

LLMの出力が期待するフォーマット（JSONなど）でない場合、フォーマットのエラーを含めて再試行するパターン。

### 実装

```python
import json
import time
import anthropic
from typing import Any

client = anthropic.Anthropic()

def parse_json_output(response: str) -> dict:
    """LLMの出力からJSONを抽出してパース"""
    # コードブロック内のJSONを探す
    import re
    json_match = re.search(r"```json\n(.*?)```", response, re.DOTALL)
    if json_match:
        return json.loads(json_match.group(1))
    # コードブロックなしのJSONを探す
    return json.loads(response.strip())

def call_with_retry(
    prompt: str,
    parser: Callable[[str], Any],
    max_retries: int = 3,
    base_delay: float = 1.0,
) -> Any:
    """パースエラー時にエラー内容を含めてリトライ"""
    last_error = None

    for attempt in range(max_retries):
        try:
            # リトライ時はエラーをプロンプトに含める
            retry_context = ""
            if last_error:
                retry_context = f"\n\n前回の試行でエラーが発生しました: {last_error}\n正しいフォーマットで再試行してください。"

            response = client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt + retry_context}
                ],
            )
            return parser(response.content[0].text)

        except (json.JSONDecodeError, KeyError, ValueError) as e:
            last_error = str(e)
            if attempt < max_retries - 1:
                time.sleep(base_delay * (2 ** attempt))  # Exponential backoff
                continue
            raise RuntimeError(f"最大リトライ回数を超過: {last_error}")

# 使用例
result = call_with_retry(
    prompt="""
以下のレビューをJSON形式で分析してください。

レビュー: 「サービスがとても使いやすかったです。ただし、もう少し速ければ嬉しいです」

出力フォーマット:
```json
{
  "sentiment": "positive" | "negative" | "mixed",
  "score": -1.0〜1.0,
  "topics": ["string"],
  "summary": "string"
}
```
    """,
    parser=parse_json_output,
)
```

### 使いどころ

- 構造化データの出力が必要なケース
- LLMの出力フォーマットが安定しない場合
- 外部APIへの入力として使う場合

---

## パターン3: Critic-Actor（評価者-実行者）

### 概要

アクターが出力を生成し、別のCriticエージェントが評価する。評価が一定スコア以下なら再生成を要求するパターン。

### 実装

```python
import anthropic
from pydantic import BaseModel

client = anthropic.Anthropic()

class CriticScore(BaseModel):
    score: int  # 1-10
    feedback: str
    approved: bool

def actor(task: str) -> str:
    """タスクを実行して出力を生成"""
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2048,
        system="あなたは高品質なコードを生成するエキスパートエンジニアです。",
        messages=[{"role": "user", "content": task}],
    )
    return response.content[0].text

def critic(task: str, output: str) -> CriticScore:
    """出力を評価する"""
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=512,
        system="""あなたはコードレビュアーです。以下の観点で1-10点で評価してください：
- 正確性（要件を満たしているか）
- 可読性（変数名、コメント）
- エラーハンドリング
- セキュリティ

JSON形式で回答: {"score": 1-10, "feedback": "改善点", "approved": true/false}
approvedはscoreが7以上のときtrue。""",
        messages=[
            {
                "role": "user",
                "content": f"タスク: {task}\n\n出力:\n{output}",
            }
        ],
    )
    import json
    data = json.loads(response.content[0].text)
    return CriticScore(**data)

def critic_actor_loop(task: str, max_iterations: int = 3) -> str:
    """Critic-Actorループ"""
    for i in range(max_iterations):
        output = actor(task)
        score = critic(task, output)

        print(f"Iteration {i+1}: score={score.score}, approved={score.approved}")

        if score.approved:
            return output

        # フィードバックをタスクに追加して再試行
        task = f"{task}\n\n前回のフィードバック: {score.feedback}"

    return output  # 最大反復後は最後の出力を返す

# 使用例
result = critic_actor_loop(
    "Pythonでファイルを安全に読み込む関数を実装してください。"
    "エラーハンドリングとログ出力を含めること。"
)
```

### 使いどころ

- コード生成など、品質が重要な出力
- ユーザーに見せる前に品質チェックが必要な場合
- 一定水準を下回る出力を許容できない本番システム

---

## パターン4: Context Window Management（コンテキスト管理）

### 概要

長い会話や大量のドキュメントを扱う際、コンテキストウィンドウを効率的に管理するパターン。Sliding WindowとSummarizationを組み合わせる。

### 実装

```python
import anthropic
from collections import deque

client = anthropic.Anthropic()

class ContextManager:
    def __init__(self, max_tokens: int = 100_000, summary_threshold: int = 80_000):
        self.messages: deque = deque()
        self.summary: str | None = None
        self.max_tokens = max_tokens
        self.summary_threshold = summary_threshold
        self.approx_tokens = 0

    def estimate_tokens(self, text: str) -> int:
        """簡易トークン数推定（文字数 / 3.5）"""
        return len(text) // 4

    def add_message(self, role: str, content: str) -> None:
        self.messages.append({"role": role, "content": content})
        self.approx_tokens += self.estimate_tokens(content)

        if self.approx_tokens > self.summary_threshold:
            self._summarize_old_messages()

    def _summarize_old_messages(self) -> None:
        """古いメッセージをサマリーに変換"""
        # 先頭の半分をサマリー対象にする
        messages_to_summarize = []
        while len(self.messages) > len(self.messages) // 2:
            messages_to_summarize.append(self.messages.popleft())

        text_to_summarize = "\n".join(
            f"{m['role']}: {m['content']}" for m in messages_to_summarize
        )

        response = client.messages.create(
            model="claude-haiku-4-5",  # 高速・低コストモデルでサマリー生成
            max_tokens=512,
            messages=[
                {
                    "role": "user",
                    "content": f"以下の会話を200字以内で要約してください:\n\n{text_to_summarize}",
                }
            ],
        )
        new_summary = response.content[0].text
        self.summary = f"{self.summary}\n{new_summary}" if self.summary else new_summary

        # トークン数を再計算
        self.approx_tokens = sum(
            self.estimate_tokens(m["content"]) for m in self.messages
        )

    def get_messages(self) -> list[dict]:
        """サマリーを含めたメッセージリストを返す"""
        result = []
        if self.summary:
            result.append({
                "role": "user",
                "content": f"[会話の要約]\n{self.summary}",
            })
            result.append({
                "role": "assistant",
                "content": "承知しました。要約を踏まえて対応します。",
            })
        result.extend(list(self.messages))
        return result

# 使用例
ctx = ContextManager()
ctx.add_message("user", "Pythonでウェブスクレイピングを実装したい")
ctx.add_message("assistant", "BeautifulSoupを使う方法を説明します...")
# ... 長い会話が続く

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=ctx.get_messages() + [{"role": "user", "content": "エラーハンドリングも加えて"}],
)
```

### 使いどころ

- チャットボット、カスタマーサポート
- 長期的なコーディングセッション
- ドキュメント分析タスク

---

## パターン5: Tool Call Validation（ツール呼び出しバリデーション）

### 概要

エージェントがツールを呼び出す前に、呼び出しの妥当性を検証するパターン。危険な操作（削除、外部送信など）には人間の承認を挟む。

### 実装

```python
import anthropic
from enum import Enum

client = anthropic.Anthropic()

class RiskLevel(Enum):
    LOW = "low"       # 自動実行OK
    MEDIUM = "medium" # ログを残して実行
    HIGH = "high"     # 人間の承認が必要

# ツールのリスクレベル定義
TOOL_RISK_LEVELS = {
    "read_file": RiskLevel.LOW,
    "list_directory": RiskLevel.LOW,
    "write_file": RiskLevel.MEDIUM,
    "create_pr": RiskLevel.MEDIUM,
    "delete_file": RiskLevel.HIGH,
    "send_email": RiskLevel.HIGH,
    "deploy_production": RiskLevel.HIGH,
}

def validate_tool_call(tool_name: str, tool_input: dict) -> bool:
    """ツール呼び出しを検証し、実行可否を返す"""
    risk = TOOL_RISK_LEVELS.get(tool_name, RiskLevel.HIGH)

    if risk == RiskLevel.LOW:
        return True

    if risk == RiskLevel.MEDIUM:
        print(f"[LOG] Tool call: {tool_name}({tool_input})")
        return True

    if risk == RiskLevel.HIGH:
        print(f"\n[要承認] 高リスク操作の実行を要求されています")
        print(f"ツール: {tool_name}")
        print(f"引数: {tool_input}")
        approval = input("実行しますか？ (y/N): ")
        return approval.lower() == "y"

    return False

def run_agent_with_validation(task: str) -> str:
    """ツール呼び出しバリデーション付きエージェント実行"""
    tools = [
        {
            "name": "read_file",
            "description": "ファイルを読み込む",
            "input_schema": {
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "required": ["path"],
            },
        },
        {
            "name": "delete_file",
            "description": "ファイルを削除する",
            "input_schema": {
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "required": ["path"],
            },
        },
    ]

    messages = [{"role": "user", "content": task}]

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            tools=tools,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            return response.content[0].text

        # ツール呼び出しの処理
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                # バリデーション
                approved = validate_tool_call(block.name, block.input)

                if approved:
                    # 実際のツール実行（省略: 適切な実装を入れる）
                    result = f"[{block.name}] 実行完了"
                else:
                    result = f"[{block.name}] 実行を拒否しました"

                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})
```

### 使いどころ

- ファイルシステムや外部サービスを操作するエージェント
- 本番環境への変更を伴うCI/CDパイプライン
- 金銭や個人情報を扱うシステム

## まとめ

5つのパターンの適用場面をまとめる。

| パターン | 主な用途 | 実装コスト |
|---|---|---|
| Guardrail Chain | セキュリティ・コンプライアンス | 低 |
| Retry with Backoff | 構造化出力の安定化 | 低 |
| Critic-Actor | 品質保証 | 中 |
| Context Window Management | 長期会話 | 中 |
| Tool Call Validation | 本番環境の安全運用 | 低〜中 |

これらのパターンを単独で使うのではなく、組み合わせることで堅牢なエージェントシステムを構築できる。特にGuardrail Chain + Tool Call Validationは、ほぼすべての本番エージェントに適用することを推奨する。

---

## 記事3: n8n + Claude APIで朝のルーティン業務を完全自動化した実装メモ

**タイトル**: n8n + Claude APIで朝のルーティン業務を完全自動化した実装メモ

**タグ**: `n8n` `Claude` `自動化` `ワークフロー` `LLM`

---

## はじめに

毎朝9時に行っていたルーティン作業がある。

1. Slackの未読メッセージを確認して、返信が必要なものをリストアップ
2. GitHubのIssue・PRを確認して、今日対応するものを決める
3. カレンダーを確認して、今日のスケジュールを把握
4. 以上をまとめた「今日の作業計画」をSlackに投稿

これを手動でやると20〜30分かかっていた。n8nとClaude APIで自動化した結果、毎朝ゼロ手間で計画が届くようになった。その実装メモを残す。

## アーキテクチャ

```
[毎朝9時 Cron] → n8n
    ├── GitHub API → 担当Issue/PRを取得
    ├── Google Calendar API → 今日の予定を取得
    └── Slack API → 昨日の未返信メッセージを取得
         ↓ (データをまとめてClaude APIに投げる)
    Claude API → 今日の作業計画を生成
         ↓
    Slack API → #daily-planチャンネルに投稿
```

n8nは各種APIの接続・認証を管理し、データのオーケストレーションを担う。実際の判断・文章生成はClaude APIに委譲する。

## Step 1: n8nのワークフロー設定

n8nのワークフローは以下のノード構成にする。

```
Cron (9:00) → [GitHub, Calendar, Slack] → Function(データ整形) → HTTP Request(Claude) → Slack Post
```

### Cronノードの設定

```json
{
  "rule": {
    "interval": [{"field": "cronExpression", "expression": "0 9 * * 1-5"}]
  }
}
```

月〜金の9時に実行する。

### GitHub APIノードの設定

n8nのHTTP Requestノードを使う。

```
URL: https://api.github.com/search/issues
Method: GET
Query Parameters:
  q: assignee:USERNAME is:open
  sort: updated
  per_page: 10
Headers:
  Authorization: Bearer {{ $env.GITHUB_TOKEN }}
```

### Google Calendar APIノードの設定

```
URL: https://www.googleapis.com/calendar/v3/calendars/primary/events
Method: GET
Query Parameters:
  timeMin: {{ new Date().toISOString() }}
  timeMax: {{ new Date(Date.now() + 86400000).toISOString() }}
  singleEvents: true
  orderBy: startTime
```

### Slack APIノードの設定（未返信メッセージ取得）

```
URL: https://slack.com/api/conversations.history
Method: GET
Query Parameters:
  channel: {{ $env.SLACK_CHANNEL_ID }}
  oldest: {{ Math.floor((Date.now() - 86400000) / 1000) }}
  limit: 50
Headers:
  Authorization: Bearer {{ $env.SLACK_BOT_TOKEN }}
```

## Step 2: データ整形Functionノード

各APIから取得したデータをClaude APIに渡す形に整形する。

```javascript
// n8n Function Node
const githubItems = $node["GitHub"].json.items || [];
const calendarEvents = $node["Calendar"].json.items || [];
const slackMessages = $node["Slack"].json.messages || [];

// GitHub: 今日期限のもの・緊急ラベルを優先
const priorityIssues = githubItems.filter(item => {
  const labels = item.labels.map(l => l.name);
  return labels.includes("urgent") || labels.includes("p0");
});

const normalIssues = githubItems.filter(item => {
  const labels = item.labels.map(l => l.name);
  return !labels.includes("urgent") && !labels.includes("p0");
});

// Calendar: 今日の予定
const todayEvents = calendarEvents.map(event => ({
  time: event.start.dateTime || event.start.date,
  title: event.summary,
  duration: event.end.dateTime
    ? Math.round((new Date(event.end.dateTime) - new Date(event.start.dateTime)) / 60000) + "分"
    : "終日",
}));

// Slack: メンションされているメッセージ
const myUserId = $env.SLACK_USER_ID;
const mentions = slackMessages.filter(msg =>
  msg.text && msg.text.includes(`<@${myUserId}>`)
);

const context = `
## 今日の日付
${new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}

## GitHub: 緊急Issue/PR (${priorityIssues.length}件)
${priorityIssues.map(i => `- [#${i.number}] ${i.title} (${i.html_url})`).join("\n") || "なし"}

## GitHub: 通常Issue/PR (${normalIssues.length}件)
${normalIssues.slice(0, 5).map(i => `- [#${i.number}] ${i.title}`).join("\n") || "なし"}

## 今日のカレンダー予定
${todayEvents.map(e => `- ${e.time}: ${e.title} (${e.duration})`).join("\n") || "予定なし"}

## Slackのメンション (${mentions.length}件)
${mentions.map(m => `- ${m.text.substring(0, 100)}`).join("\n") || "なし"}
`;

return { context };
```

## Step 3: Claude APIへのリクエスト

HTTP RequestノードでClaude APIを呼び出す。

```
URL: https://api.anthropic.com/v1/messages
Method: POST
Headers:
  x-api-key: {{ $env.ANTHROPIC_API_KEY }}
  anthropic-version: 2023-06-01
  Content-Type: application/json
Body (JSON):
{
  "model": "claude-haiku-4-5",
  "max_tokens": 1024,
  "system": "あなたはエンジニアのアシスタントです。提供された情報をもとに、今日の作業計画を作成してください。\n\n出力フォーマット:\n1. 今日のハイライト（1-2文）\n2. 優先タスク（最大3つ、番号付き）\n3. 今日の予定（箇条書き）\n4. 返信が必要なSlackメッセージ（あれば）\n\n簡潔に、行動可能な形で書いてください。",
  "messages": [
    {
      "role": "user",
      "content": "{{ $node['Function'].json.context }}"
    }
  ]
}
```

低コスト・高速なHaikuモデルを使う。日次の計画生成はこれで十分だ。

## Step 4: Slackへの投稿

Claude APIのレスポンスをSlackに投稿する。

```javascript
// Slackへの投稿用にフォーマット
const planText = $node["Claude API"].json.content[0].text;
const today = new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });

return {
  channel: process.env.SLACK_CHANNEL_ID,
  text: `*${today}の作業計画* :sunrise:\n\n${planText}`,
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${today}の作業計画`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: planText,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `_自動生成 by Claude Haiku | ${new Date().toLocaleTimeString("ja-JP")}_`,
        },
      ],
    },
  ],
};
```

## 実際の出力例

```
11月18日（月）の作業計画

【今日のハイライト】
緊急IssueとPRレビューが積んでいます。午前中に集中して対応しましょう。

【優先タスク】
1. #423 認証エラーの修正 (urgent) - 本番障害のため最優先
2. PR #89 のレビュー - Kさんが待機中
3. Slackでの@メンションへの返信 (3件)

【今日の予定】
- 10:00 週次チームMTG (60分)
- 14:00 デザインレビュー (30分)

【返信必要なSlack】
- Aさん: 「APIの仕様について確認したい」
- Bさん: 「明日のリリース確認できますか？」
```

## 実装のポイント

**エラーハンドリング**: n8nのError Triggerノードを使い、APIエラー時はSlackにエラー通知を送る設定を追加する。毎朝の通知が来なければ異常に気づけない。

**コストの最適化**: Claude Haikuを使うことで、1回の実行コストは約$0.001（月20回で約$0.02）。実質無料に近い。

**カスタマイズ**: システムプロンプトを変更するだけで、出力のトーンや構造を変えられる。「もっと詳細に」「英語で」「箇条書きなし」などの指示を追加するだけでよい。

**プライバシー**: Slackのメッセージ本文をClaude APIに送信するため、機密情報が含まれる可能性がある。APIキーの管理と、Claude APIのデータ保持ポリシーを確認すること。

## まとめ

n8n + Claude APIで朝のルーティンを自動化した。

- **削減時間**: 20〜30分/日 → 0分/日
- **コスト**: 月$0.02程度（Claude API）+ n8nのホスティング費
- **カスタマイズ性**: プロンプト変更のみで出力を調整可能

n8nのビジュアルワークフローとClaude APIの判断力を組み合わせることで、「データ収集はn8n、判断はLLM」という明確な役割分担ができる。これは他の定型業務にも応用できるパターンだ。

次のステップとして、週次レポート自動生成、コードレビューの自動プリチェック、MTG前の事前調査まとめなどへの展開を検討している。
