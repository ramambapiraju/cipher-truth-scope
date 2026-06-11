import type { SourceCard } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function SourceSidebar({
  sources,
  activeIndex,
}: {
  sources: SourceCard[];
  activeIndex: number | null;
}) {
  if (sources.length === 0) {
    return (
      <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
        <p className="font-mono uppercase tracking-[0.2em] text-[10px] mb-2">Sources</p>
        No web-grounded sources. Connect a Gemini key to enable live citation grounding.
      </div>
    );
  }
  return (
    <aside className="glass rounded-2xl p-4 space-y-2">
      <p className="font-mono uppercase tracking-[0.2em] text-[10px] text-muted-foreground px-1">
        Citations · {sources.length}
      </p>
      <ul className="space-y-2">
        {sources.map((s) => (
          <li key={s.index}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className={cn(
                "block rounded-lg border p-3 transition group",
                activeIndex === s.index
                  ? "border-neon/60 bg-neon/5 ring-neon"
                  : "border-white/5 bg-surface-2/40 hover:border-white/15 hover:bg-surface-2/70",
              )}
            >
              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background/60 text-neon shrink-0">
                  S{s.index}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate group-hover:text-neon transition">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                    {s.domain} <ExternalLink className="size-3 opacity-60" />
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[9px] font-mono uppercase shrink-0 mt-0.5",
                    s.confidence === "high" && "text-neon",
                    s.confidence === "medium" && "text-acid",
                    s.confidence === "low" && "text-warn",
                  )}
                >
                  {s.confidence}
                </span>
              </div>
              {s.snippet && (
                <p className="text-[11px] text-muted-foreground mt-2 line-clamp-3">
                  {s.snippet}
                </p>
              )}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}