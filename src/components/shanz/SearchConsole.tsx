import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, ShieldCheck, BrainCircuit, KeyRound, Info } from "lucide-react";
import type { ResearchInput } from "@/lib/types";

interface Props {
  onRun: (input: ResearchInput) => void;
  loading: boolean;
  stealth: boolean;
  setStealth: (v: boolean) => void;
  deepResearch: boolean;
  setDeepResearch: (v: boolean) => void;
  niche: ResearchInput["niche"];
  setNiche: (n: ResearchInput["niche"]) => void;
  userApiKey: string;
  setUserApiKey: (k: string) => void;
}

export function SearchConsole(p: Props) {
  const [q, setQ] = useState("");
  const [showKey, setShowKey] = useState(false);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim() || p.loading) return;
    p.onRun({
      query: q.trim(),
      deepResearch: p.deepResearch,
      stealth: p.stealth,
      userApiKey: p.userApiKey || undefined,
      niche: p.niche,
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <form
        onSubmit={submit}
        className="glass scanline relative rounded-2xl p-6 md:p-8 ring-1 ring-white/5"
      >
        <div className="absolute inset-0 -z-10 glow-grid opacity-40 rounded-2xl" />
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <Sparkles className="size-4 text-neon" />
          <span className="font-mono uppercase tracking-[0.2em] text-xs">Shan Z Console</span>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">
            t=0.0 · top_p=0.1 · zero-hallucination
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask anything. Shan Z verifies, cross-checks, and cites."
            className="h-14 text-base md:text-lg bg-background/40 border-white/10 focus-visible:ring-neon font-display"
            disabled={p.loading}
          />
          <Button
            type="submit"
            disabled={p.loading || !q.trim()}
            className="h-14 px-8 bg-neon text-neon-foreground hover:bg-neon/90 ring-neon font-mono uppercase tracking-wider"
          >
            {p.loading ? "Running…" : "Execute"}
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <ShieldCheck className="size-4 text-acid" />
            <span>Zero-Leak Stealth Mode</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                In-memory only. No IndexedDB. No cache. Sends no-log signals where supported.
                On export or refresh, all session memory is purged.
              </TooltipContent>
            </Tooltip>
            <Switch checked={p.stealth} onCheckedChange={p.setStealth} />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <BrainCircuit className="size-4 text-neon" />
            <span>Deep Research</span>
            <Switch checked={p.deepResearch} onCheckedChange={p.setDeepResearch} />
          </label>

          <Select value={p.niche} onValueChange={(v) => p.setNiche(v as ResearchInput["niche"])}>
            <SelectTrigger className="w-[180px] h-9 bg-background/30 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="quantum">Quantum Computing</SelectItem>
              <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="biotech">Biotechnology</SelectItem>
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={() => setShowKey((s) => !s)}
            className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <KeyRound className="size-3.5" />
            {p.userApiKey ? "Personal key active" : "Use my Gemini key"}
          </button>
        </div>

        {showKey && (
          <div className="mt-3">
            <Input
              type="password"
              value={p.userApiKey}
              onChange={(e) => p.setUserApiKey(e.target.value)}
              placeholder="Paste Google AI Studio key — unlocks live web grounding"
              className="bg-background/40 border-white/10 font-mono text-xs"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Stored in memory only. Never persisted, never sent to logging.
            </p>
          </div>
        )}
      </form>
    </TooltipProvider>
  );
}