import { useEffect, useState } from "react";
import { listHistory, deleteHistory, purgeAll, type CachedReport } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { History, Trash2, EyeOff } from "lucide-react";
import type { ResearchReport } from "@/lib/types";

export function HistoryPanel({
  stealth,
  onSelect,
  refreshKey,
}: {
  stealth: boolean;
  onSelect: (r: ResearchReport) => void;
  refreshKey: number;
}) {
  const [items, setItems] = useState<CachedReport[]>([]);
  useEffect(() => {
    if (stealth) {
      setItems([]);
      return;
    }
    listHistory().then(setItems);
  }, [stealth, refreshKey]);

  if (stealth) {
    return (
      <div className="glass rounded-2xl p-5 text-sm">
        <p className="font-mono uppercase tracking-[0.2em] text-[10px] text-acid mb-2 flex items-center gap-2">
          <EyeOff className="size-3.5" /> Stealth Active
        </p>
        <p className="text-muted-foreground">
          History hidden. Nothing is written to local storage this session.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="font-mono uppercase tracking-[0.2em] text-[10px] text-muted-foreground flex items-center gap-1.5">
          <History className="size-3.5" /> History
        </p>
        {items.length > 0 && (
          <button
            onClick={async () => {
              await purgeAll();
              setItems([]);
            }}
            className="text-[10px] text-muted-foreground hover:text-destructive transition"
          >
            clear all
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground px-1 py-2">No reports yet.</p>
      ) : (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {items.map((it) => (
            <li key={it.id} className="group flex items-start gap-2 rounded-md p-2 hover:bg-white/5 transition">
              <button
                onClick={() => onSelect(it.report)}
                className="flex-1 text-left min-w-0"
              >
                <div className="text-sm truncate">{it.query}</div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {new Date(it.createdAt).toLocaleString()} · {it.deepResearch ? "deep" : "std"}
                </div>
              </button>
              <Button
                size="icon"
                variant="ghost"
                className="size-6 opacity-0 group-hover:opacity-100"
                onClick={async () => {
                  if (it.id != null) {
                    await deleteHistory(it.id);
                    setItems((arr) => arr.filter((x) => x.id !== it.id));
                  }
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}