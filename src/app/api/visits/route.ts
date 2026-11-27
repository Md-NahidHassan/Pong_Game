import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

export const dynamic = "force-dynamic";

const STARTING_VISITS = 150;
const BASE_OFFSET = STARTING_VISITS - 1;
const REDIS_KEY = "neon_pong:visits";
const LOCAL_COUNTER_FILE = path.join(os.tmpdir(), "neon-pong-visits.json");

let memoryFallbackCount = 0;

interface RedisConfig {
  url: string;
  token: string;
}

function getRedisConfig(): RedisConfig | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ""), token };
}

async function queryRedis(
  config: RedisConfig,
  command: "get" | "incr"
): Promise<number> {
  const res = await fetch(`${config.url}/${command}/${REDIS_KEY}`, {
    method: command === "incr" ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Redis REST request failed with status ${res.status}`);
  }

  const data = (await res.json()) as { result?: number | string | null };
  const parsed = Number(data.result ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function readLocalFallbackCount(): Promise<number> {
  try {
    const raw = await fs.readFile(LOCAL_COUNTER_FILE, "utf8");
    const parsed = JSON.parse(raw) as { count?: unknown };
    const count = Number(parsed.count ?? 0);
    if (Number.isFinite(count) && count >= 0) {
      memoryFallbackCount = count;
      return count;
    }
  } catch {
    // File may not exist yet or temp dir may not be readable
  }
  return memoryFallbackCount;
}

async function incrementLocalFallbackCount(): Promise<number> {
  const current = await readLocalFallbackCount();
  const next = current + 1;
  memoryFallbackCount = next;
  try {
    await fs.writeFile(
      LOCAL_COUNTER_FILE,
      JSON.stringify({ count: next }),
      "utf8"
    );
  } catch {
    // Ignore filesystem errors on read-only environments
  }
  return next;
}

function toDisplayVisits(rawCount: number): number {
  return Math.max(STARTING_VISITS, BASE_OFFSET + rawCount);
}

export async function GET() {
  const redis = getRedisConfig();

  if (redis) {
    try {
      const rawCount = await queryRedis(redis, "get");
      return NextResponse.json(
        { visits: toDisplayVisits(rawCount), persistent: true },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch {
      // Fall through to local fallback if Redis temporarily fails
    }
  }

  const rawCount = await readLocalFallbackCount();
  return NextResponse.json(
    { visits: toDisplayVisits(rawCount), persistent: false },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST() {
  const redis = getRedisConfig();

  if (redis) {
    try {
      const rawCount = await queryRedis(redis, "incr");
      return NextResponse.json(
        { visits: toDisplayVisits(rawCount), persistent: true },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch {
      // Fall through to local fallback if Redis temporarily fails
    }
  }

  const rawCount = await incrementLocalFallbackCount();
  return NextResponse.json(
    { visits: toDisplayVisits(rawCount), persistent: false },
    { headers: { "Cache-Control": "no-store" } }
  );
}
