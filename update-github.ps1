param(
  [string]$Message = "",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".git")) {
  throw "This folder is not a Git repository."
}

$branch = (git branch --show-current).Trim()
if (-not $branch) {
  throw "Could not detect the current Git branch."
}

Write-Host "Checking local website changes..."
git status --short

if ($DryRun) {
  Write-Host ""
  Write-Host "Dry run only. Nothing was committed or pushed."
  exit 0
}

git add -A

$pending = git status --porcelain
if (-not $pending) {
  Write-Host "No local changes to update."
  exit 0
}

if (-not $Message.Trim()) {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  $Message = "Update website content $timestamp"
}

Write-Host ""
Write-Host "Creating commit: $Message"
git commit -m $Message

Write-Host ""
Write-Host "Syncing with GitHub..."
git pull --rebase origin $branch

Write-Host ""
Write-Host "Uploading to GitHub..."
git push origin $branch

Write-Host ""
Write-Host "Done. GitHub Pages will update shortly."
