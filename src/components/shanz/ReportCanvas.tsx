import type { ResearchReport } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, AlertTriangle, Quote } from "lucide-react";
import { downloadMarkdown, downloadPdf } from "@/lib/export";

export function ReportCanvas({
  report,
  onAfterExport,
  onCiteHover,
}: {
  report: ResearchReport;
  onAfterExport: () => void;
  onCiteHover: (sourceIndex: number | null) => void;
}) {
  const exportPdf = () => {
    downloadPdf(report);
    onAfterExport();
  };
  const exportMd = () => {
    downloadMarkdown(report);
    onAfterExport();
  };
  return (
    <article className="glass rounded-2xl p-6 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-[0.2em] text-muted-foreground">
            <span>Truth Index</span>
            <span className="text-neon">{report.truth_index.score}/100</span>
            {report.deep_research && (
              <Badge variant="outline" className="border-neon/40 text-neon">DEEP</Badge>
            )}
            {report.grounded ? (
              <Badge variant="outline" className="border-acid/40 text-acid">GROUNDED</Badge>
            ) : (
              <Badge variant="outline" className="border-warn/40 text-warn">UNGROUNDED</Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient leading-tight">
            {report.query}
          </h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={exportMd} className="border-white/10">
            <FileText className="size-4" /> Markdown
          </Button>
          <Button size="sm" onClick={exportPdf} className="bg-neon text-neon-foreground hover:bg-neon/90">
            <Download className="size-4" /> PDF
          </Button>
        </div>
      </header>

      <section className="space-y-2">
        <p className="text-base text-foreground/90">{report.truth_index.consensus}</p>
        <ul className="grid sm:grid-cols-2 gap-2 mt-3">
          {report.truth_index.bullets.map((b, i) => (
            <li key={i} className="rounded-lg bg-surface-2/50 border border-white/5 p-3 text-sm">
              {b}
            </li>
          ))}
        </ul>
      </section>

      {report.sections.map((s, i) => (
        <section key={i} className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground/95 flex items-center gap-2">
            <span className="text-neon font-mono text-sm">{String(i + 1).padStart(2, "0")}.</span>
            {s.heading}
          </h2>
          <div className="prose prose-invert prose-sm max-w-none text-foreground/85 leading-relaxed">
            {s.body_markdown.split("\n").filter(Boolean).map((p, k) => (
              <p key={k}>{p}</p>
            ))}
          </div>
          {s.claims.length > 0 && (
            <ul className="space-y-1.5">
              {s.claims.map((c, k) => (
                <li
                  key={k}
                  onMouseEnter={() => onCiteHover(c.source_index)}
                  onMouseLeave={() => onCiteHover(null)}
                  className="group flex items-start gap-3 text-sm rounded-md border border-white/5 bg-surface-2/30 hover:bg-surface-2/60 transition p-3"
                >
                  <button
                    type="button"
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neon/15 text-neon shrink-0"
                  >
                    S{c.source_index}
                  </button>
                  <div className="space-y-1">
                    <p className="text-foreground/90">{c.text}</p>
                    <p className="text-xs text-muted-foreground italic flex gap-1.5">
                      <Quote className="size-3 mt-0.5 shrink-0" />
                      {c.exact_quote}
                    </p>
                  </div>
                  <span
                    className={
                      "ml-auto text-[10px] font-mono uppercase shrink-0 " +
                      (c.confidence === "high"
                        ? "text-neon"
                        : c.confidence === "medium"
                        ? "text-acid"
                        : "text-warn")
                    }
                  >
                    {c.confidence}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {report.contradictions.length > 0 && (
        <section className="space-y-3 rounded-xl border border-warn/30 bg-warn/5 p-5">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-warn">
            <AlertTriangle className="size-5" /> Contradictions &amp; Unverified Outliers
          </h2>
          {report.contradictions.map((c, i) => (
            <div key={i} className="space-y-2">
              <div className="font-medium">[DISPUTED] {c.topic}</div>
              <ul className="space-y-1.5">
                {c.positions.map((p, k) => (
                  <li key={k} className="text-sm pl-3 border-l-2 border-warn/50">
                    <span className="font-mono text-xs text-warn mr-2">S{p.source_index}</span>
                    {p.claim} <span className="italic text-muted-foreground">— "{p.exact_quote}"</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {report.notes?.length ? (
        <footer className="border-t border-white/5 pt-4 text-xs text-muted-foreground space-y-1">
          {report.notes.map((n, i) => <div key={i}>· {n}</div>)}
        </footer>
      ) : null}
    </article>
  );
}