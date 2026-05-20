$ErrorActionPreference = "Stop"

$port = 5173
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $root ".preview.pid"

if (Test-Path $pidFile) {
  try {
    $existingPid = Get-Content $pidFile -Raw
    if ($existingPid) {
      $proc = Get-Process -Id ([int]$existingPid) -ErrorAction SilentlyContinue
      if ($proc) {
        Write-Host "Preview server already running (PID $existingPid)."
        Start-Process "http://localhost:$port/"
        exit 0
      }
    }
  } catch {}
}

Push-Location $root
try {
  $python = Get-Command python -ErrorAction SilentlyContinue

  if ($python) {
    $proc = Start-Process -FilePath "python" -ArgumentList @("-m", "http.server", "$port") -WorkingDirectory $root -WindowStyle Hidden -PassThru
  } else {
    $proc = Start-Process -FilePath "npx" -ArgumentList @("http-server", "-p", "$port", "-c-1") -WorkingDirectory $root -WindowStyle Hidden -PassThru
  }

  Set-Content -Path $pidFile -Value $proc.Id -Encoding ascii
  Start-Sleep -Milliseconds 400

  Write-Host "Local website running at http://localhost:$port/"
  Write-Host "Admin panel at http://localhost:$port/admin/"
  Start-Process "http://localhost:$port/"
} finally {
  Pop-Location
}

