import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { randomBytes, scryptSync } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

if (!process.stdin.isTTY) throw new Error("Execute em um terminal interativo. Não informe a senha como argumento.");
const silent = new Writable({ write(_chunk, _encoding, callback) { callback(); } });
const prompt = createInterface({ input: process.stdin, output: silent, terminal: true });
try {
  process.stdout.write("Nova senha administrativa (entrada oculta): ");
  const password = await prompt.question("");
  process.stdout.write("\nConfirme a senha: ");
  const confirmation = await prompt.question("");
  if (password !== confirmation || password.length < 8 || password.length > 128) throw new Error("Senhas diferentes ou tamanho inválido (8–128 caracteres).");
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex");
  let text = await readFile(".env.local", "utf8").catch(e => { if (e.code === "ENOENT") return ""; throw e; });
  const line = `ADMIN_PASSWORD_HASH=scrypt:${salt}:${key}`;
  text = /^ADMIN_PASSWORD_HASH=.*$/m.test(text) ? text.replace(/^ADMIN_PASSWORD_HASH=.*$/m, () => line) : `${text.trimEnd()}\n${line}\n`;
  await writeFile(".env.local", text, { mode: 0o600 });
  console.log("\nHash salvo em .env.local. Reinicie o Vite e atualize a variável privada ADMIN_PASSWORD_HASH na Vercel.");
} finally { prompt.close(); }
