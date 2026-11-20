# SAMS: run the backend on Supabase (Windows PowerShell)
# Put this file next to pom.xml, edit ONLY the 2 lines marked EDIT, then run:
#   powershell -ExecutionPolicy Bypass -File .\run-supabase.ps1

$ErrorActionPreference = "Stop"

# ---- EDIT THESE 2 LINES ----
$DbHost     = "aws-0-ap-southeast-1.pooler.supabase.com"   # EDIT 1: your Supabase host
$DbPassword = "Nagasai@117899"                 # EDIT 2: your Supabase database password
# ----------------------------

# ---- Leave these as they are (change only if your paths differ) ----
$JavaHome = "C:\Program Files\Java\jdk-21.0.12.1"
$MavenBin = "$HOME\maven\apache-maven-3.9.9\bin"
$DbName   = "postgres"
$DbUser   = "postgres.qpzszzrsrracedrgpwlp"   # if you use the Session pooler, change to: postgres.YOUR_PROJECT_REF
$DbPort   = "5432"
# --------------------------------------------------------------------

if ($DbHost -like "*PASTE_*" -or $DbPassword -like "PASTE_*") {
    throw "Open this file and replace the host and password on the 2 EDIT lines first."
}

$env:JAVA_HOME = $JavaHome
$env:Path     += ";$JavaHome\bin;$MavenBin"

$env:DB_URL      = "jdbc:postgresql://${DbHost}:${DbPort}/${DbName}?sslmode=require"
$env:DB_USER     = $DbUser
$env:DB_PASSWORD = $DbPassword

# First run on an empty database: creates tables and loads demo data. Set to "false" afterwards.
$env:SEED_DEMO_DATA = "true"

Set-Location $PSScriptRoot
if (-not (Test-Path "pom.xml")) { throw "pom.xml not found next to this script." }

Write-Host "Starting backend on Supabase (wait for 'Started SamsApplication') ..." -ForegroundColor Green
Write-Host "Check: http://localhost:8080/api/reference" -ForegroundColor Green
mvn spring-boot:run "-Dspring-boot.run.profiles=postgres" "-Dspring-boot.run.arguments=--sams.demo-today=2026-11-11"
