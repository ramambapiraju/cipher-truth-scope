import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ResearchReport, SourceCard, Confidence } from "./types";

const InputSchema = z.object({
  query: z.string().min(3).max(1000),
  deepResearch: z.boolean().default(false),
  stealth: z.boolean().default(false),
  userApiKey: z.string().optional(),
  niche: z.enum(["quantum", "cybersecurity", "electronics", "biotech", "general"]).default("general"),
});

const NICHE_PROMPTS: Record<string, string> = {
  general:
    "Behave as a rigorous research synthesizer producing peer-review-grade summaries.",
  quantum:
    "Behave as a quantum computing systems analyst. Pay attention to qubit topology (superconducting, trapped-ion, photonic, neutral-atom), decoherence T1/T2, gate fidelity, error-correction thresholds, and algorithmic complexity claims.",
  cybersecurity:
    "Behave as a threat-intel analyst. Map behaviors to MITRE ATT&CK tactics and techniques where evidence supports it. Cite CVEs by ID, CVSS, and exploit availability.",
  electronics:
    "Behave as a hardware engineer. Audit semiconductor node, process variation, signal integrity, power envelope, and schematic constraints. Preserve exact numeric tolerances.",
  biotech:
    "Behave as a biotech analyst. Reference NCBI/GenBank identifiers, clinical-trial phase, sample size, primary endpoints, and molecular configurations when present.",
};

const SYSTEM = (niche: string, deep: boolean) => `
You are Shan Z, an absolute zero-hallucination research engine.
${NICHE_PROMPTS[niche] ?? NICHE_PROMPTS.general}

ABSOLUTE RULES:
1. Never fabricate. If sources do not support a claim, omit it.
2. Every factual claim MUST include an "exact_quote": a verbatim contiguous substring (5-40 words) copied character-for-character from a retrieved source snippet. Do NOT paraphrase the exact_quote. Do NOT invent quotes.
3. Each claim references the integer "source_index" matching the source list returned to the user.
4. If two sources disagree, surface the contradiction explicitly — do not average them.
5. Output STRICT JSON only. No prose outside JSON. No markdown fences.
${deep ? "6. DEEP MODE: aggressively cross-verify every numeric value across at least two sources; flag any single-source numeric as confidence=\"low\"." : ""}

Output schema (TypeScript):
{
  "truth_index": { "consensus": string, "score": number /* 0-100 */, "bullets": string[] },
  "sections": Array<{
    "heading": string,
    "body_markdown": string,
    "claims": Array<{ "text": string, "exact_quote": string, "source_index": number, "confidence": "high"|"medium"|"low" }>
  }>,
  "contradictions": Array<{
    "topic": string,
    "positions": Array<{ "source_index": number, "claim": string, "exact_quote": string }>
  }>,
  "search_queries": string[] /* the 3 search strings you would have issued */
}
`.trim();

function extractJson(text: string): unknown {
  // strip code fences if present
  const cleaned = text.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }
    throw new Error("Model did not return JSON");
  }
}

function domainOf(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

interface GeminiCallResult {
  text: string;
  sources: SourceCard[];
  groundingCorpus: string;
  grounded: boolean;
  model: string;
}

async function callGeminiDirect(
  apiKey: string,
  model: string,
  system: string,
  user: string,
  stealth: boolean,
): Promise<GeminiCallResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.0,
      topP: 0.1,
      candidateCount: 1,
      maxOutputTokens: 8192,
    },
  };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (stealth) {
    // Best-effort opt-out signaling. Google's REST endpoint does not expose
    // per-call no-log, but we mark our own infra to not retain.
    headers["X-Goog-User-Project-No-Log"] = "1";
    headers["X-Lovable-No-Log"] = "1";
  }
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${errText.slice(0, 400)}`);
  }
  const json: any = await res.json();
  const cand = json?.candidates?.[0];
  const text: string = cand?.content?.parts?.map((p: any) => p.text ?? "").join("") ?? "";
  const meta = cand?.groundingMetadata ?? {};
  const chunks: any[] = meta.groundingChunks ?? [];
  const supports: any[] = meta.groundingSupports ?? [];
  const corpusParts: string[] = [];
  const sources: SourceCard[] = chunks.map((c, i) => {
    const web = c.web ?? {};
    return {
      index: i + 1,
      title: web.title ?? `Source ${i + 1}`,
      url: web.uri ?? "",
      domain: domainOf(web.uri ?? ""),
      snippet: "",
      confidence: "medium" as Confidence,
    };
  });
  for (const s of supports) {
    const seg = s?.segment?.text ?? "";
    if (seg) corpusParts.push(seg);
    for (const idx of s?.groundingChunkIndices ?? []) {
      if (sources[idx]) sources[idx].snippet = (sources[idx].snippet + " " + seg).trim().slice(0, 500);
    }
  }
  return {
    text,
    sources,
    groundingCorpus: corpusParts.join("\n"),
    grounded: chunks.length > 0,
    model,
  };
}

async function callGateway(
  model: string,
  system: string,
  user: string,
): Promise<GeminiCallResult> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      top_p: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gateway ${res.status}: ${t.slice(0, 400)}`);
  }
  const json: any = await res.json();
  const text: string = json?.choices?.[0]?.message?.content ?? "";
  return { text, sources: [], groundingCorpus: "", grounded: false, model };
}

function verifyAndPurge(
  parsed: any,
  corpus: string,
  sources: SourceCard[],
  grounded: boolean,
): { sections: any[]; contradictions: any[]; purgedCount: number } {
  const normalized = corpus.toLowerCase().replace(/\s+/g, " ");
  const verify = (q: string) => {
    if (!grounded) return true; // no corpus to verify against
    if (!q) return false;
    return normalized.includes(q.toLowerCase().replace(/\s+/g, " "));
  };
  let purged = 0;
  const sections = (parsed.sections ?? []).map((s: any) => ({
    heading: String(s.heading ?? "Untitled"),
    body_markdown: String(s.body_markdown ?? ""),
    claims: (s.claims ?? []).filter((c: any) => {
      const ok = verify(c.exact_quote) && Number.isInteger(c.source_index) && c.source_index >= 1 && c.source_index <= sources.length || !grounded;
      if (!ok) purged++;
      return ok;
    }),
  }));
  const contradictions = (parsed.contradictions ?? []).map((cd: any) => ({
    topic: String(cd.topic ?? ""),
    positions: (cd.positions ?? []).filter((p: any) => verify(p.exact_quote)),
  })).filter((cd: any) => cd.positions.length >= 2);
  return { sections, contradictions, purgedCount: purged };
}

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }): Promise<ResearchReport> => {
    const deep = data.deepResearch;
    const flashModel = "google/gemini-2.5-flash";
    const proModel = deep ? "google/gemini-2.5-pro" : flashModel;
    const directFlash = "gemini-2.5-flash";
    const directPro = deep ? "gemini-2.5-pro" : "gemini-2.5-flash";

    const system = SYSTEM(data.niche, deep);
    const userPrompt = `Research question: """${data.query}"""\n\nReturn ONLY the JSON object per the schema. Use the live web search tool to ground every numeric or factual claim.`;

    let result: GeminiCallResult;
    const notes: string[] = [];
    if (data.userApiKey) {
      result = await callGeminiDirect(data.userApiKey, directPro, system, userPrompt, data.stealth);
    } else {
      result = await callGateway(proModel, system, userPrompt);
      notes.push("Web grounding unavailable on the Lovable AI fallback. Provide a Google AI Studio key for live search.");
    }

    let parsed: any;
    try {
      parsed = extractJson(result.text);
    } catch (e) {
      throw new Error(`Parse failure: ${(e as Error).message}. Raw: ${result.text.slice(0, 300)}`);
    }

    const { sections, contradictions, purgedCount } = verifyAndPurge(
      parsed,
      result.groundingCorpus,
      result.sources,
      result.grounded,
    );
    if (purgedCount > 0) notes.push(`${purgedCount} unverifiable claim(s) auto-purged.`);

    // upgrade source confidence based on how many supported claims point at it
    const refCount = new Map<number, number>();
    for (const s of sections) for (const c of s.claims) {
      refCount.set(c.source_index, (refCount.get(c.source_index) ?? 0) + 1);
    }
    for (const src of result.sources) {
      const n = refCount.get(src.index) ?? 0;
      src.confidence = n >= 3 ? "high" : n >= 1 ? "medium" : "low";
    }

    const report: ResearchReport = {
      query: data.query,
      truth_index: {
        consensus: String(parsed?.truth_index?.consensus ?? ""),
        score: Math.max(0, Math.min(100, Number(parsed?.truth_index?.score ?? 0))),
        bullets: Array.isArray(parsed?.truth_index?.bullets) ? parsed.truth_index.bullets.map(String) : [],
      },
      sections,
      contradictions,
      sources: result.sources,
      search_queries: Array.isArray(parsed?.search_queries) ? parsed.search_queries.map(String).slice(0, 5) : [],
      generated_at: Date.now(),
      deep_research: deep,
      model: result.model,
      grounded: result.grounded,
      notes,
    };
    return report;
  });