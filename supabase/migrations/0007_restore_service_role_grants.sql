-- Restores the DML privileges Supabase normally grants on a public table.
-- service_role held only Dxtm (TRUNCATE, REFERENCES, TRIGGER, MAINTAIN), so every
-- insert from /api/contact and /api/lead was refused by PostgREST with
-- 403 permission denied, and the contact form failed for every visitor.
--
-- Granted to service_role ONLY. anon and authenticated are intentionally left
-- with no DML: the browser never touches this table, all access is server-side
-- through the service-role key, and RLS remains enabled with no policies so
-- anonymous requests stay locked out.
--
-- ALREADY APPLIED to project ejhbldcnuaperkcfotxz as migration
-- 20260828072658_0007_restore_service_role_grants. Kept so the repo matches
-- Supabase migration history. Do not run it again.

grant select, insert, update, delete on table public.inquiries to service_role;
