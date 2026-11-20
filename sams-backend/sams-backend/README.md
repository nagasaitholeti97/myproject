# SAMS backend (Spring Boot + Supabase)

1. Open `run-supabase.ps1` and replace the two EDIT lines (Supabase host and database password).
2. In PowerShell, in this folder:  `powershell -ExecutionPolicy Bypass -File .\run-supabase.ps1`
3. Wait for `Started SamsApplication`, then open http://localhost:8080/api/reference
4. Login: student `24ECE3002` or faculty `F101`, password `demo123`.

First run on an empty Supabase database creates the tables and loads the demo data.
Afterwards set `$env:SEED_DEMO_DATA = "false"` in the script.

No IPv6 on your network? Use the Supabase Session pooler host (aws-0-<region>.pooler.supabase.com)
and set `$DbUser = "postgres.<project-ref>"`.

`db/` holds optional plain-SQL files (schema + demo data) you can also paste into the Supabase SQL Editor.
Set `SAMS_JWT_SECRET` (32+ characters) before going live.
