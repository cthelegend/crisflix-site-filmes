import { it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { defaultSiteContent } from "../shared/siteContent.js";

it("applies the admin migration twice and enforces permissions, revisions, history and login limits in PostgreSQL", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
    const sql = readFileSync(new URL("../supabase/migrations/20261115_site_editor.sql", import.meta.url), "utf8");
    await db.exec(sql); await db.exec(sql);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      for (const table of ["site_editor", "admin_sessions", "admin_login_limits"]) await expect(db.query(`select * from public.${table}`)).rejects.toThrow(/permission denied/);
      await expect(db.query("select public.admin_login_attempt($1)", ["a".repeat(64)])).rejects.toThrow(/permission denied/);
      await expect(db.query("select public.save_site_editor(0, $1::jsonb, true)", [JSON.stringify(defaultSiteContent)])).rejects.toThrow(/permission denied/);
      await db.exec("reset role");
    }
    await db.exec("set role service_role");
    const save = async (revision, content, publish) => (await db.query("select public.save_site_editor($1, $2::jsonb, $3) as state", [revision, JSON.stringify(content), publish])).rows[0].state;
    expect((await save(0, defaultSiteContent, false)).revision).toBe(1);
    expect(await save(0, defaultSiteContent, true)).toBeNull();
    const content = structuredClone(defaultSiteContent); content.appearance.slogan = "Publicação validada";
    expect((await save(1, content, true)).published.appearance.slogan).toBe("Publicação validada");
    for (let revision = 2; revision < 14; revision++) await save(revision, content, true);
    expect((await db.query("select jsonb_array_length(history) as total from public.site_editor")).rows[0].total).toBe(10);
    for (let i = 0; i < 8; i++) expect((await db.query("select public.admin_login_attempt($1) as allowed", ["a".repeat(64)])).rows[0].allowed).toBe(true);
    expect((await db.query("select public.admin_login_attempt($1) as allowed", ["a".repeat(64)])).rows[0].allowed).toBe(false);
  } finally { await db.close(); }
}, 30000);
