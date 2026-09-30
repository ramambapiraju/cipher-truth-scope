# Gemini Insight Engine

# Role & System Context
You are a world-class principal software architect and full-stack engineer. Your task is to build a hyper-optimized web application for "Shan Z" (hosted at shanz.co.in). 
The goal of this application is to win the Gemini Prize Challenge by aggressively outperforming competitors like Claude and Consensus in speed, technical accuracy, and structural citation mapping, while maintaining near-zero operational costs and an absolute ZERO-HALLUCINATION data processing engine.
The target audience is Gen Z power-researchers, builders, and academics. The UI must be an ultra-premium, dark-themed, sleek kinetic dashboard utilizing high-contrast accents and smooth CSS transitions.

# App Requirements & Architecture

## 1. Absolute Zero-Hallucination Configuration (Mandatory Engine Rules)
To guarantee zero hallucination and mathematically exact data outputs, the code must hardcode these deterministic execution constraints:
*   Temperature & Top-P Settings: Set `temperature: 0.0` and `topP: 0.1` for all Gemini API calls to eliminate creative random token selection.
*   Structured JSON Outputs: Use Gemini's native `responseSchema` or `responseMimeType: "application/json"` to force deterministic object structures.
*   Strict Text-Attribution Constraint: Enforce a strict localized verification routine. For every factual assertion made by the model, it must extract and return an accompanying `"exact_quote"` property containing a verbatim text string found within the scraped HTML source. 
*   Hallucination Auto-Filter: Implement a client-side verification check. If the returned `"exact_quote"` does not programmatically exist as a substring within the raw local text chunks, the entire claim is instantly purged from the report state before rendering.

## 2. Google Gemini Native Integration (XPRIZE Winner Core)
*   SDK: Use the official Google AI Studio SDK (`@google/generative-ai`).
*   Model Strategy (Maximum Intelligence, Absolute Minimum Cost):
    *   gemini-2.5-flash: Used for 90% of the workflow. It handles initial query parsing, HTML text extraction, automated chunking, and structural markdown building.
    *   gemini-2.0-flash-thinking-exp: Triggered ONLY when "Deep Research" is enabled. It handles complex multi-source truth verification, cross-checking conflicting claims, and validating niche data pipelines.

## 3. IP Protection & Data Privacy ("Zero-Leak Stealth Mode" Feature)
*   UI Input: Include a prominent, highly visible toggle switch on the main search dashboard labeled **"Zero-Leak Stealth Mode"** with an info icon explaining IP protection.
*   Technical Execution (When Stealth Mode is Toggle On):
    1. **API Opt-Out Configurations**: Programmatically adjust the Gemini API request headers/options to enforce zero-data logging and opt-out of content storage wherever supported by the SDK architecture.
    2. **Ephemeral In-Memory Processing**: Bypass the standard IndexedDB/LocalStorage pipeline entirely for this session. The application must process query strings, scraped data chunks, and the final synthesized report strictly within localized client-side React state memory.
    3. **Zero-Trace Auto-Scrub**: As soon as the user exports their PDF or Markdown report, or closes/refreshes the browser tab, the memory is completely wiped clean. Provide a clear visual confirmation: *"✨ Session ended. All research data permanently purged from local memory."*

## 4. Zero-Cost Client-Side Data Architecture (Standard Mode)
*   Data Persistence: When Stealth Mode is OFF, use IndexedDB (via Dexie.js) to store all user reports, custom prompt histories, and reference materials directly in the user's browser.
*   The Consensus-Killer Feature (Strict Semantic Cache): Before sending any standard query to the API or a search engine, check IndexedDB. If an identical query was run within 48 hours, load the cached analytical structure to eliminate redundant token costs.

## 5. Core Functional Defeater Workflows (Shan Z vs. Competitors)

### Phase A: Input & Intent Parsing
*   The dashboard features a prominent "Shan Z" input console with a "Deep Research Mode" toggle and the "Zero-Leak Stealth Mode" toggle.
*   When a user inputs a query, gemini-2.5-flash breaks it into an optimized execution payload: 3 precise web search strings and an isolated list of exact data targets.

### Phase B: Scrape Minimization & Token Strip
*   Do NOT send raw web pages or whole articles to the LLM. 
*   Implement a rigorous browser-side clean-up script to instantly strip HTML scripts, CSS styles, navigation bars, footers, and tracking text.
*   Pass only dense, raw text blocks to gemini-2.5-flash to extract truth-assertions, minimizing input tokens by up to 85%.

### Phase C: Cross-Source Verification
*   Using gemini-2.0-flash-thinking-exp, compare Source A against Source B and Source C. 
*   If a metric or claim differs across sources, isolate it, flag it visually as "[DISPUTED CLAIM]" in a dedicated contradictions block, and detail the conflicting evidence instead of guessing.

### Phase D: Academic-Grade Report Output
Generate highly polished Markdown. The template must strictly enforce this schema:
1. Shan Z Truth Index (A rapid, punchy matrix stating the overall consensus of the web on this topic)
2. Verified Deep Dive (Thematic sections featuring rich technical data, formulas, or system architectures)
3. Contradictions & Unverified Outliers (Where sources clashed or lacked empirical evidence)
4. Interactive Bibliography (Inline clickable annotations linked to source cards on the right sidebar)

## 6. Parallel Niche Deep Research Engines
When "Deep Research" is active, load optimized system instructions instructing gemini-2.0-flash-thinking-exp to analyze content like a dedicated industry model:
*   Quantum Computing: Benchmarks qubit topologies, algorithmic decoherence, and error-correction ceilings.
*   Cybersecurity: Maps threat behaviors to the MITRE ATT&CK matrix and analyzes raw CVE exploit proofs.
*   Electronics: Audits semiconductor node parameters, signal integrity constraints, and hardware schematic variables.
*   Biotechnology: Cross-examines NCBI/GenBank structures, clinical trial phase parameters, and molecular configurations.

## 7. UI/UX Specifications (The "Switch to Shan Z" Experience)
*   Dashboard: Sleek dark theme, local research dashboard showing historical research nodes (hidden in Stealth Mode), and a centralized search matrix.
*   Live Execution Interface: A terminal layout rendering ongoing system thoughts (e.g., "🛡️ [STEALTH ACTIVE] Processing safely in local memory...", "⚡ Stripping text...", "🔗 Finalizing citations...").
*   Interactive Report Canvas: Left panel contains the beautiful interactive markdown document with hoverable citations. Top panel includes high-speed client-side PDF and Markdown download macros. The right sidebar lists interactive source cards that display a confidence rating for every cited website.

Provide the complete full-stack web application structure, layout views, Gemini SDK initialization layers with privacy and zero-hallucination overrides, local storage/in-memory state management schemas, and state drivers optimized for Lovable.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c10d7571-7c57-4052-b2e0-736ae0c8528e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
