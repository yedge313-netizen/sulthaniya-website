# Sync local project files from GitHub when origin/main is ahead.
# Used by Cursor hooks after git push and when the agent session stops.

$ErrorActionPreference = "SilentlyContinue"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

if (-not (Test-Path (Join-Path $projectRoot ".git"))) {
  exit 0
}

Set-Location $projectRoot

git fetch origin main 2>$null
if ($LASTEXITCODE -ne 0) {
  exit 0
}

$behind = git rev-list --count HEAD..origin/main 2>$null
if (-not $behind) {
  exit 0
}

if ([int]$behind -gt 0) {
  git reset --hard origin/main 2>$null
}

exit 0
