$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $root ".preview.pid"

if (-not (Test-Path $pidFile)) {
  Write-Host "No preview PID file found."
  exit 0
}

$pidValue = (Get-Content $pidFile -Raw).Trim()
if (-not $pidValue) {
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  Write-Host "No PID found."
  exit 0
}

try {
  Stop-Process -Id ([int]$pidValue) -Force -ErrorAction SilentlyContinue
  Write-Host "Stopped preview server (PID $pidValue)."
} finally {
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

