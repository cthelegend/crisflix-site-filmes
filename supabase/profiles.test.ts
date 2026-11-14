import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const account = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const other = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
let second = "";
let third = "";
const db = new PGlite();
const source = (name: string) => readFileSync(new URL(name, import.meta.url), "utf8");
const asAccount = () => db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${account}',false)`);

beforeAll(async () => {
  // Supabase-managed schemas are represented only by the pieces our migrations use.
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text unique);
    alter table storage.objects enable row level security;
    create function storage.foldername(name text) returns text[] language sql as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'),1)-1] $$;
    grant usage on schema auth, storage, public to anon, authenticated;
    grant select, insert, update on storage.objects to authenticated;
    grant select on storage.objects to anon;
  `);
  await db.exec(source("schema.sql"));
  await db.exec(source("migrations/20261114_security_hardening.sql"));
  await db.query("insert into auth.users values ($1,'account@example.test','{\"display_name\":\"Original\"}')", [account]);
  await db.query("insert into public.user_media_state (user_id,media_type,media_id,title,in_watchlist,progress_seconds) values ($1,'movie',550,'Original film',true,120)", [account]);
  const migration = source("migrations/20261115_multiple_profiles.sql");
  await db.exec(migration);
  await db.exec(migration);
  await db.query("insert into auth.users values ($1,'other@example.test','{}')", [other]);
  await asAccount();
  second = (await db.query<{ id: string }>("select id from public.create_viewing_profile('Segundo','/avatars/preset-2.svg')")).rows[0].id;
  third = (await db.query<{ id: string }>("select id from public.create_viewing_profile('Terceiro','/avatars/preset-3.svg')")).rows[0].id;
  await db.query("insert into public.user_media_state(user_id,profile_id,media_type,media_id,title,in_watchlist,progress_seconds) values ($1,$2,'movie',550,'Second film',false,600)", [account, second]);
}, 20000);
afterAll(async () => { await db.close(); });

describe("Multiple profiles: actual PostgreSQL constraints and RLS", () => {
  it("preserves the original profile and history during repeatable migration", async () => {
    await asAccount();
    const profile = (await db.query<{ display_name: string }>("select display_name from public.viewing_profiles where id=$1", [account])).rows[0];
    expect(profile.display_name).toBe("Original");
    const media = (await db.query<{ profile_id: string; progress_seconds: number; in_watchlist: boolean }>("select profile_id,progress_seconds,in_watchlist from public.user_media_state where profile_id=$1", [account])).rows[0];
    expect(media).toEqual({ profile_id: account, progress_seconds: 120, in_watchlist: true });
  });
  it("enforces exactly three available slots even through the RPC", async () => {
    await asAccount();
    expect((await db.query("select * from public.viewing_profiles")).rows).toHaveLength(3);
    await expect(db.query("select public.create_viewing_profile('Fourth',null)")).rejects.toThrow("3 perfis");
  });
  it("cannot bypass the limit through direct writes", async () => {
    await asAccount();
    await expect(db.query("insert into public.viewing_profiles(user_id,slot,display_name) values ($1,4,'Fourth')", [account])).rejects.toThrow("check constraint");
    await expect(db.query("insert into public.viewing_profiles(user_id,slot,display_name) values ($1,2,'Duplicate')", [account])).rejects.toThrow("unique constraint");
  });
  it("allows personalization without allowing profile identity/slot mutation or deletion", async () => {
    await asAccount();
    await expect(db.query("update public.viewing_profiles set slot=slot where id=$1", [second])).rejects.toThrow("permission denied");
    await expect(db.query("delete from public.viewing_profiles where id=$1", [second])).rejects.toThrow("permission denied");
    expect((await db.query("update public.viewing_profiles set display_name=display_name where id=$1 returning id", [second])).rows).toHaveLength(1);
  });
  it("stores different lists/progress for the same film in different profiles", async () => {
    await asAccount();
    const rows = (await db.query<{ profile_id: string; progress_seconds: number; in_watchlist: boolean }>("select profile_id,progress_seconds,in_watchlist from public.user_media_state where media_id=550 order by progress_seconds")).rows;
    expect(rows).toEqual([
      { profile_id: account, progress_seconds: 120, in_watchlist: true },
      { profile_id: second, progress_seconds: 600, in_watchlist: false },
    ]);
    expect((await db.query("select * from public.user_media_state where profile_id=$1", [third])).rows).toHaveLength(0);
  });
  it("cannot attach another account's profile to one's own history", async () => {
    await asAccount();
    await expect(db.query("insert into public.user_media_state(user_id,profile_id,media_type,media_id,title) values ($1,$2,'movie',123,'Invalid')", [account, other])).rejects.toThrow("foreign key constraint");
    await expect(db.query("insert into public.viewing_profiles(user_id,slot,display_name) values ($1,2,'Invalid')", [other])).rejects.toThrow("row-level security");
    expect((await db.query("select * from public.viewing_profiles where user_id=$1", [other])).rows).toHaveLength(0);
  });
  it("keeps existing account data invisible to another signed-in account", async () => {
    await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${other}',false)`);
    expect((await db.query("select * from public.viewing_profiles")).rows).toHaveLength(1);
    expect((await db.query("select * from public.user_media_state")).rows).toHaveLength(0);
    expect((await db.query("update public.viewing_profiles set display_name='Changed' where id=$1 returning id", [second])).rows).toHaveLength(0);
  });
  it("rejects stale account identity when creating a profile", async () => {
    await asAccount();
    await expect(db.query("select public.create_viewing_profile('Wrong',null,$1)", [other])).rejects.toThrow("Sessão alterada");
  });
  it("isolates avatar paths and allows only owned profile PNGs", async () => {
    await asAccount();
    await db.query("insert into storage.objects(bucket_id,name) values ('avatars',$1)", [`${account}/${second}.png`]);
    await expect(db.query("insert into storage.objects(bucket_id,name) values ('avatars',$1)", [`${account}/${other}.png`])).rejects.toThrow("row-level security");
    await expect(db.query("insert into storage.objects(bucket_id,name) values ('avatars',$1)", [`${other}/${second}.png`])).rejects.toThrow("row-level security");
  });
  it("denies anonymous profile access and profile creation", async () => {
    await db.exec("reset role; set role anon");
    await expect(db.query("select * from public.viewing_profiles")).rejects.toThrow("permission denied");
    await expect(db.query("select public.create_viewing_profile('Anon',null)")).rejects.toThrow("permission denied");
  });
  it("can reapply both migrations atomically without losing edited profiles or media", async () => {
    await asAccount();
    await db.query("update public.viewing_profiles set display_name='Personalizado' where id=$1", [second]);
    await db.exec("reset role");
    const stripTransaction = (sql: string) => sql.replace(/^begin;\s*$/gmi, "").replace(/^commit;\s*$/gmi, "");
    await db.exec(`begin;\n${stripTransaction(source("migrations/20261114_security_hardening.sql"))}\n${stripTransaction(source("migrations/20261115_multiple_profiles.sql"))}\ncommit;`);
    expect((await db.query("select * from public.user_media_state")).rows).toHaveLength(2);
    expect((await db.query<{ display_name: string }>("select display_name from public.viewing_profiles where id=$1", [second])).rows[0].display_name).toBe("Personalizado");
  });
});
