import { jsPDF } from "jspdf";
import type { ResearchReport } from "./types";

export function reportToMarkdown(r: ResearchReport): string {
  const lines: string[] = [];
  lines.push(`# Shan Z — ${r.query}\n`);
  lines.push(`*Generated ${new Date(r.generated_at).toISOString()} · model: \`${r.model}\` · ${r.grounded ? "web-grounded" : "ungrounded"} · ${r.deep_research ? "deep mode" : "standard"}*\n`);
  lines.push(`## Shan Z Truth Index — ${r.truth_index.score}/100`);
  lines.push(r.truth_index.consensus, "");
  for (const b of r.truth_index.bullets) lines.push(`- ${b}`);
  lines.push("\n## Verified Deep Dive");
  for (const s of r.sections) {
    lines.push(`\n### ${s.heading}\n`);
    lines.push(s.body_markdown);
    if (s.claims.length) {
      lines.push("\n**Verified claims:**");
      for (const c of s.claims) {
        lines.push(`- [S${c.source_index}] (${c.confidence}) ${c.text} — *"${c.exact_quote}"*`);
      }
    }
  }
  if (r.contradictions.length) {
    lines.push("\n## Contradictions & Unverified Outliers");
    for (const cd of r.contradictions) {
      lines.push(`\n### ${cd.topic}`);
      for (const p of cd.positions) {
        lines.push(`- **[S${p.source_index}]** ${p.claim} — *"${p.exact_quote}"*`);
      }
    }
  }
  lines.push("\n## Bibliography");
  for (const s of r.sources) {
    lines.push(`${s.index}. [${s.title}](${s.url}) — ${s.domain} · confidence: ${s.confidence}`);
  }
  if (r.notes?.length) {
    lines.push("\n---\n");
    for (const n of r.notes) lines.push(`> ${n}`);
  }
  return lines.join("\n");
}

export function downloadMarkdown(r: ResearchReport) {
  const md = reportToMarkdown(r);
  const blob = new Blob([md], { type: "text/markdown" });
  triggerDownload(blob, `shanz-${slug(r.query)}.md`);
}

export function downloadPdf(r: ResearchReport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;
  const line = (txt: string, size = 11, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const wrapped = doc.splitTextToSize(txt, width);
    for (const w of wrapped) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(w, margin, y);
      y += size * 1.3;
    }
  };
  line(`Shan Z — ${r.query}`, 18, true);
  line(`${new Date(r.generated_at).toISOString()} · ${r.model}`, 9);
  y += 8;
  line(`Truth Index ${r.truth_index.score}/100`, 14, true);
  line(r.truth_index.consensus);
  for (const b of r.truth_index.bullets) line(`• ${b}`);
  y += 8;
  for (const s of r.sections) {
    line(s.heading, 13, true);
    line(s.body_markdown);
    for (const c of s.claims) line(`[S${c.source_index}] ${c.text} — "${c.exact_quote}"`, 9);
    y += 6;
  }
  if (r.contradictions.length) {
    line("Contradictions", 14, true);
    for (const cd of r.contradictions) {
      line(cd.topic, 12, true);
      for (const p of cd.positions) line(`[S${p.source_index}] ${p.claim} — "${p.exact_quote}"`, 9);
    }
  }
  line("Bibliography", 14, true);
  for (const s of r.sources) line(`${s.index}. ${s.title} — ${s.url}`, 9);
  doc.save(`shanz-${slug(r.query)}.pdf`);
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "report";
}