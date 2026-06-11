import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SearchConsole } from "@/components/shanz/SearchConsole";
import { ExecutionTerminal, type TerminalLine } from "@/components/shanz/ExecutionTerminal";
import { ReportCanvas } from "@/components/shanz/ReportCanvas";
import { SourceSidebar } from "@/components/shanz/SourceSidebar";
import { HistoryPanel } from "@/components/shanz/HistoryPanel";
import { runResearch } from "@/lib/research.functions";
import { getCached, saveReport } from "@/lib/db";
import type { ResearchInput, ResearchReport } from "@/lib/types";
import { ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shan Z — Zero-Hallucination Research Engine" },
      {
        name: "description",
        content:
          "Dark-themed kinetic research dashboard with verified citations, exact-quote enforcement, and stealth in-memory mode.",
      },
      { property: "og:title", content: "Shan Z — Zero-Hallucination Research" },
    ],
  }),
  component: Index,
});

function Index() {
  const research = useServerFn(runResearch);
  const [stealth, setStealth] = useState(false);
  const [deep, setDeep] = useState(false);
  const [niche, setNiche] = useState<ResearchInput["niche"]>("general");
  const [userApiKey, setUserApiKey] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [activeCite, setActiveCite] = useState<number | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Stealth purge on unmount / refresh
  useEffect(() => {
    const beforeUnload = () => {
      if (stealth) {
        setReport(null);
        setLines([]);
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [stealth]);

  const pushLine = (text: string, tone?: TerminalLine["tone"]) =>
    setLines((arr) => [...arr, { ts: Date.now(), text, tone }]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const scheduleStages = (stealthOn: boolean, deepOn: boolean) => {
    const stages: { delay: number; text: string; tone?: TerminalLine["tone"] }[] = [
      stealthOn
        ? { delay: 80, text: "🛡️ [STEALTH ACTIVE] Processing in ephemeral memory…", tone: "stealth" }
        : { delay: 80, text: "💾 Standard mode: results cached locally (IndexedDB).", tone: "info" },
      { delay: 350, text: "⚡ Parsing query intent · gemini-2.5-flash @ t=0.0", tone: "info" },
      { delay: 900, text: "🌐 Issuing 3 web search strings · google_search tool", tone: "info" },
      { delay: 1800, text: "🧹 Stripping HTML · ~85% token reduction", tone: "info" },
      ...(deepOn
        ? [
            { delay: 3000, text: "🧠 Deep mode: cross-checking sources A↔B↔C · gemini-2.5-pro", tone: "info" as const },
            { delay: 4200, text: "🔍 Auditing numeric agreement · flagging single-source claims", tone: "warn" as const },
          ]
        : []),
      { delay: deepOn ? 5500 : 3200, text: "📐 Enforcing JSON schema · responseMimeType=application/json", tone: "info" },
      { delay: deepOn ? 6500 : 4000, text: "🔗 Verifying exact_quote substrings · purging unsupported claims", tone: "info" },
    ];
    stages.forEach((s) => {
      const id = setTimeout(() => pushLine(s.text, s.tone), s.delay);
      timers.current.push(id);
    });
  };

  const handleRun = async (input: ResearchInput) => {
    setRunning(true);
    setReport(null);
    setActiveCite(null);
    setLines([]);
    clearTimers();
    pushLine(`$ shanz run "${input.query}" --${input.deepResearch ? "deep" : "std"}${input.stealth ? " --stealth" : ""}`, "ok");

    try {
      // Strict semantic cache (off in stealth)
      if (!input.stealth) {
        const cached = await getCached(input.query, input.deepResearch);
        if (cached) {
          pushLine("⚡ Cache hit (<48h). Zero tokens spent.", "ok");
          setReport(cached);
          setRunning(false);
          return;
        }
      }
      scheduleStages(input.stealth, input.deepResearch);
      const result = await research({ data: input });
      clearTimers();
      pushLine(`✅ Report compiled · ${result.sources.length} sources · ${result.grounded ? "grounded" : "ungrounded"}`, "ok");
      if (result.notes?.length) {
        result.notes.forEach((n) => pushLine(`ℹ ${n}`, "warn"));
      }
      setReport(result);
      if (!input.stealth) {
        await saveReport(result);
        setHistoryKey((k) => k + 1);
      }
    } catch (e) {
      clearTimers();
      const msg = e instanceof Error ? e.message : String(e);
      pushLine(`✖ ${msg}`, "warn");
      toast.error("Research failed", { description: msg.slice(0, 200) });
    } finally {
      setRunning(false);
    }
  };

  const afterExport = () => {
    if (stealth) {
      setReport(null);
      setLines([]);
      toast.success("Session ended", {
        description: "✨ All research data permanently purged from local memory.",
      });
    } else {
      toast.success("Exported");
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="bottom-right" />
      <header className="border-b border-white/5 sticky top-0 z-20 backdrop-blur-xl bg-background/60">
        <div className="mx-auto max-w-[1400px] px-6 h-14 flex items-center gap-3">
          <div className="size-7 rounded-md bg-gradient-to-br from-neon to-acid grid place-items-center text-neon-foreground font-bold font-mono text-sm">
            S
          </div>
          <span className="font-display font-semibold tracking-tight text-lg">
            shan<span className="text-neon">z</span>
          </span>
          <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-muted-foreground ml-1">
            v1 · zero-hallucination
          </span>
          <nav className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#dashboard" className="hover:text-foreground transition flex items-center gap-1.5">
              <Zap className="size-3.5" /> dashboard
            </a>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className={`size-3.5 ${stealth ? "text-acid" : ""}`} />
              {stealth ? "stealth on" : "standard"}
            </span>
          </nav>
        </div>
      </header>

      <main id="dashboard" className="mx-auto max-w-[1400px] px-4 md:px-6 py-8 md:py-12 space-y-8">
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon">
            switch to shan z
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] text-gradient">
            Research that<br />refuses to hallucinate.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Gemini-grounded. Exact-quote verified. Cross-source contradictions surfaced, never averaged.
            Built for builders, researchers, and the chronically skeptical.
          </p>
        </section>

        <SearchConsole
          onRun={handleRun}
          loading={running}
          stealth={stealth}
          setStealth={setStealth}
          deepResearch={deep}
          setDeepResearch={setDeep}
          niche={niche}
          setNiche={setNiche}
          userApiKey={userApiKey}
          setUserApiKey={setUserApiKey}
        />

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-6 min-w-0">
            <ExecutionTerminal lines={lines} running={running} />
            {report ? (
              <ReportCanvas
                report={report}
                onAfterExport={afterExport}
                onCiteHover={setActiveCite}
              />
            ) : (
              <EmptyReport />
            )}
          </div>
          <div className="space-y-6 lg:sticky lg:top-20">
            <SourceSidebar sources={report?.sources ?? []} activeIndex={activeCite} />
            <HistoryPanel stealth={stealth} onSelect={setReport} refreshKey={historyKey} />
          </div>
        </div>

        <footer className="text-center text-xs text-muted-foreground pt-12 pb-6 border-t border-white/5">
          shanz.co.in · built to defeat hallucination · gemini · zero-cost client architecture
        </footer>
      </main>
    </div>
  );
}

function EmptyReport() {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
        Ready
      </p>
      <h3 className="text-xl font-semibold mb-2">Drop a query into the console.</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Shan Z will parse intent, query the live web, strip noise, verify quotes, and render a
        cited report — usually faster than your tab finishes loading the competitors.
      </p>
    </div>
  );
}
