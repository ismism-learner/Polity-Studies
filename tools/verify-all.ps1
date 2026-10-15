# Full verification chain for the manuscript pipeline (ASCII messages only:
# Windows PowerShell 5.1 reads .ps1 without BOM as ANSI, so keep this file ASCII).
# Usage: pwsh -File tools/verify-all.ps1
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Output '=== 1/5  assemble parts -> 文稿/*.md  (length ratio must be 80%-110%) ==='
node tools/assemble-parts.mjs

Write-Output ''
Write-Output '=== 2/5  polish: strip filler particles + repair punctuation (writes) ==='
node tools/polish-particles.mjs --write --show 0

Write-Output ''
Write-Output '=== 3/5  coverage check: source vs organized (4-gram containment) ==='
node tools/check-coverage.mjs --top 6

Write-Output ''
Write-Output '=== 4/5  build texts.js ==='
node tools/build-texts.mjs

Write-Output ''
Write-Output '=== 5/5  strategy citations resolvable ==='
node tools/check-cites.mjs

Write-Output ''
Write-Output '=== note: assemble regenerates 文稿/*.md from parts, so always run polish (step 2) after assemble ==='
Write-Output ''
Write-Output '=== extras: syntax ==='
foreach ($f in @('model.js', 'strategy.js', 'reader.js')) {
  node --check $f
  if ($LASTEXITCODE -eq 0) { Write-Output "ok $f" } else { Write-Output "SYNTAX FAIL $f" }
}
