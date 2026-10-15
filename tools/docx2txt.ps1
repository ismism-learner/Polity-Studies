# Extract plain text from a .docx (reads word/document.xml only, no dependencies).
# Usage: pwsh -File tools/docx2txt.ps1 -Path <docx> [-Out <txt>]
param(
  [Parameter(Mandatory = $true)][string]$Path,
  [string]$Out
)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$full = (Resolve-Path $Path).Path
$zip = [System.IO.Compression.ZipFile]::OpenRead($full)
try {
  $entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
  if (-not $entry) { throw 'no word/document.xml in this docx' }
  $sr = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
  $xml = $sr.ReadToEnd()
  $sr.Close()
} finally { $zip.Dispose() }

$t = $xml -replace '<w:tab[^>]*/>', '    '
$t = $t -replace '<w:br[^>]*/>', "`n"
$t = $t -replace '</w:p>', "`n"
$t = $t -replace '<[^>]+>', ''
$t = $t -replace '&lt;', '<' -replace '&gt;', '>' -replace '&quot;', '"' -replace '&apos;', "'" -replace '&amp;', '&'
$t = $t -replace "[ \t]+`n", "`n"
$t = $t -replace "(`r?`n){3,}", "`n`n"
$t = $t.Trim() + "`n"

$lines = ($t -split "`n" | Where-Object { $_.Trim() -ne '' }).Count
if ($Out) {
  [System.IO.File]::WriteAllText($Out, $t, (New-Object System.Text.UTF8Encoding($false)))
  Write-Output ("wrote $Out : {0} chars, {1} non-empty lines" -f $t.Length, $lines)
} else { Write-Output $t }
