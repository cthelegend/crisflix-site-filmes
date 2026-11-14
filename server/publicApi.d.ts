import type { IncomingMessage, ServerResponse } from "node:http";
export function upstreamRequest(url: string, kind: "tmdb" | "football", token?: string): { url: string; headers: Record<string, string> };
export function publicApi(req: IncomingMessage, res: ServerResponse, kind: "tmdb" | "football", token?: string): Promise<void>;
