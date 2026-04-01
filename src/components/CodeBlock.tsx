"use client";

import { useEffect } from "react";

/**
 * コードブロックにコピーボタンを注入するクライアントコンポーネント
 * article の dangerouslySetInnerHTML 内の <pre> にボタンを追加する
 */
export default function CodeBlockEnhancer() {
  useEffect(() => {
    const pres = document.querySelectorAll<HTMLPreElement>("article pre");

    pres.forEach((pre) => {
      // 既にボタン追加済みならスキップ
      if (pre.querySelector(".copy-btn")) return;

      // wrapper で position:relative を確保
      pre.style.position = "relative";

      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.textContent = "コピー";
      btn.style.cssText = [
        "position:absolute",
        "top:10px",
        "right:10px",
        "background:#374151",
        "color:#e5e7eb",
        "border:none",
        "border-radius:6px",
        "padding:3px 10px",
        "font-size:11px",
        "font-family:monospace",
        "cursor:pointer",
        "opacity:0.7",
        "transition:opacity 0.15s",
        "z-index:10",
      ].join(";");

      btn.addEventListener("mouseenter", () => { btn.style.opacity = "1"; });
      btn.addEventListener("mouseleave", () => { btn.style.opacity = "0.7"; });

      btn.addEventListener("click", async () => {
        const code = pre.querySelector("code")?.innerText ?? "";
        await navigator.clipboard.writeText(code).catch(() => {
          // fallback for older browsers
          const ta = document.createElement("textarea");
          ta.value = code;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        });
        btn.textContent = "✓ コピー済み";
        btn.style.background = "#065f46";
        btn.style.color = "#a7f3d0";
        setTimeout(() => {
          btn.textContent = "コピー";
          btn.style.background = "#374151";
          btn.style.color = "#e5e7eb";
        }, 1800);
      });

      pre.appendChild(btn);
    });
  }, []);

  return null;
}
