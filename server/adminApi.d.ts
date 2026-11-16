import type { IncomingMessage, ServerResponse } from "node:http";
export function verifyAdminPassword(password: unknown, encoded: string): Promise<boolean>;
export function createAdminApi(env?: Record<string, string | undefined>, local?: boolean, store?: unknown): (req: IncomingMessage, res: ServerResponse, publicRead?: boolean) => Promise<void>;
