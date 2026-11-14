import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

// A build must not publish privileged Supabase keys or server credentials.
const secrets = [process.env.TMDB_READ_ACCESS_TOKEN];
try {
  const local = await readFile(".env.local", "utf8");
  secrets.push(local.match(/^TMDB_READ_ACCESS_TOKEN=(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, ""));
} catch { /* CI uses environment variables */ }
let checked = 0;
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await inspect(file); continue; }
    if (!/\.(?:js|css|html|json|map)$/.test(entry.name)) continue;
    const text = await readFile(file, "utf8");
    let unsafe = secrets.some((secret) => secret && secret.length >= 16 && text.includes(secret));
    unsafe ||= /sb_secret_[A-Za-z0-9_-]+|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text);
    for (const match of text.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
      try { unsafe ||= JSON.parse(Buffer.from(match[1], "base64url").toString()).role === "service_role"; } catch { /* not JWT */ }
    }
    if (unsafe) throw new Error(`Credencial privada encontrada no artefato público: ${file}. Valor omitido.`);
    checked++;
  }
}
await inspect("dist");
console.log(`Security build check: ${checked} public files checked; no configured server token or privileged key detected.`);
