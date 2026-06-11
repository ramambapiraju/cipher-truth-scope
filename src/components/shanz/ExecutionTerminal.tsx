import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TerminalLine {
  ts: number;
  text: string;
  tone?: "info" | "stealth" | "warn" | "ok";
}

export function ExecutionTerminal({
  lines,
  running,
}: {
  lines: TerminalLine[];
  running: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [lines.length]);

  return (
    <div className="glass rounded-2xl p-4 font-mono text-[12px] leading-relaxed">
      <div className="flex items-center gap-2 mb-2 text-xs">
        <span className="size-2.5 rounded-full bg-destructive/80" />
        <span className="size-2.5 rounded-full bg-warn/80" />
        <span className="size-2.5 rounded-full bg-neon/80" />
        <span className="ml-2 text-muted-foreground uppercase tracking-[0.2em] text-[10px]">
          shanz://exec
        </span>
        {running && (
          <span className="ml-auto text-neon animate-pulse">● live</span>
        )}
      </div>
      <div ref={ref} className="h-48 overflow-y-auto pr-2 space-y-1">
        {lines.length === 0 && (
          <div className="text-muted-foreground">
            $ awaiting query... <span className="animate-pulse">▌</span>
          </div>
        )}
        {lines.map((l, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-muted-foreground/60 shrink-0">
              {fmtElapsed(l.ts - (lines[0]?.ts ?? l.ts))}
            </span>
            <span
              className={cn(
                "whitespace-pre-wrap break-words",
                l.tone === "stealth" && "text-acid",
                l.tone === "warn" && "text-warn",
                l.tone === "ok" && "text-neon",
                !l.tone && "text-foreground/85",
              )}
            >
              {l.text}
            </span>
          </div>
        ))}
        {running && lines.length > 0 && (
          <div className="flex gap-3 text-muted-foreground/60">
            <span>{fmtElapsed(now - (lines[0]?.ts ?? now))}</span>
            <span className="animate-pulse">▌</span>
          </div>
        )}
      </div>
    </div>
  );
}

function fmtElapsed(ms: number) {
  const s = (ms / 1000).toFixed(2);
  return `+${s.padStart(6, "0")}s`;
}