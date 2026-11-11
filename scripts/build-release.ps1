$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$version = $package.version
$releaseName = "Core-Field-Guide-v$version"
$distRoot = Join-Path $projectRoot 'dist'
$stageRoot = Join-Path $distRoot ("stage-" + [guid]::NewGuid().ToString('N'))
$bundleRoot = Join-Path $stageRoot $releaseName
$archivePath = Join-Path $distRoot "$releaseName-win.zip"

New-Item -ItemType Directory -Path $bundleRoot -Force | Out-Null

$files = @('app.js', 'package.json', 'package-lock.json', 'README.md', '.env.example', 'run-local.bat')
$folders = @('middleware', 'models', 'public', 'routes', 'scripts', 'views')
foreach ($file in $files) {
  Copy-Item -LiteralPath (Join-Path $projectRoot $file) -Destination (Join-Path $bundleRoot $file) -Force
}
foreach ($folder in $folders) {
  Copy-Item -LiteralPath (Join-Path $projectRoot $folder) -Destination (Join-Path $bundleRoot $folder) -Recurse -Force
}

Compress-Archive -Path $bundleRoot -DestinationPath $archivePath -CompressionLevel Optimal -Force

$resolvedDist = [IO.Path]::GetFullPath($distRoot).TrimEnd('\') + '\'
$resolvedStage = [IO.Path]::GetFullPath($stageRoot)
if (-not $resolvedStage.StartsWith($resolvedDist, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Build staging directory escaped dist: $resolvedStage"
}
Remove-Item -LiteralPath $resolvedStage -Recurse -Force

$archive = Get-Item -LiteralPath $archivePath
$hash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
Write-Output "Release archive: $($archive.FullName)"
Write-Output "Size: $($archive.Length) bytes"
Write-Output "SHA256: $hash"
