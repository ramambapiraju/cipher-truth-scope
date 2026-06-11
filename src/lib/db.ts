import Dexie, { type Table } from "dexie";
import type { ResearchReport } from "./types";

export interface CachedReport {
  id?: number;
  queryKey: string; // normalized query + deep flag
  query: string;
  deepResearch: boolean;
  createdAt: number;
  report: ResearchReport;
}

class ShanZDB extends Dexie {
  reports!: Table<CachedReport, number>;

  constructor() {
    super("shanz_db");
    this.version(1).stores({
      reports: "++id, queryKey, createdAt",
    });
  }
}

let _db: ShanZDB | null = null;
function db() {
  if (typeof window === "undefined") throw new Error("IndexedDB only");
  if (!_db) _db = new ShanZDB();
  return _db;
}

export function normalizeKey(query: string, deep: boolean) {
  return `${deep ? "D|" : "S|"}${query.trim().toLowerCase().replace(/\s+/g, " ")}`;
}

const CACHE_TTL = 48 * 60 * 60 * 1000;

export async function getCached(query: string, deep: boolean): Promise<ResearchReport | null> {
  const key = normalizeKey(query, deep);
  const hit = await db().reports.where("queryKey").equals(key).last();
  if (!hit) return null;
  if (Date.now() - hit.createdAt > CACHE_TTL) return null;
  return hit.report;
}

export async function saveReport(report: ResearchReport) {
  await db().reports.add({
    queryKey: normalizeKey(report.query, report.deep_research),
    query: report.query,
    deepResearch: report.deep_research,
    createdAt: report.generated_at,
    report,
  });
}

export async function listHistory(limit = 30): Promise<CachedReport[]> {
  return db().reports.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function deleteHistory(id: number) {
  await db().reports.delete(id);
}

export async function purgeAll() {
  await db().reports.clear();
}