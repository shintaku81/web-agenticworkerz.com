import { createHighlighter } from "shiki";

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["one-dark-pro"],
      langs: ["javascript", "typescript", "bash", "shell", "sql", "yaml", "ini", "json"],
    });
  }
  return highlighterPromise;
}

const LANG_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  sh: "bash",
  zsh: "bash",
  "": "bash",
};

/**
 * HTML 文字列内の <pre><code> ブロックにシンタックスハイライトを適用する
 */
export async function highlightCodeBlocks(html: string): Promise<string> {
  const highlighter = await getHighlighter();

  return html.replace(
    /<pre><code(?:\s+class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_, rawLang: string | undefined, rawCode: string) => {
      // HTML エンティティを戻す
      const code = rawCode
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      const lang = LANG_ALIASES[rawLang ?? ""] ?? rawLang ?? "bash";

      try {
        const highlighted = highlighter.codeToHtml(code, {
          lang,
          theme: "one-dark-pro",
        });
        // shiki が生成する <pre> の inline style を除去して prose と競合させない
        return highlighted
          .replace(/style="[^"]*"/, 'class="shiki-block not-prose" style="margin:0"')
          .replace(/<pre /, '<pre ');
      } catch {
        // ハイライト失敗時はそのまま返す
        return `<pre><code>${rawCode}</code></pre>`;
      }
    }
  );
}
