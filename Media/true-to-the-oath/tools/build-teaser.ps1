# Build True to the Oath 60s YouTube Short teaser
$ErrorActionPreference = "Stop"
$python = "S:/venvs/ffpac-media-publish/Scripts/python.exe"
$build = "S:/projects/FutureFoundations/Media/true-to-the-oath/tools/build_teaser_short.py"
& $python $build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "`nOutput: S:/projects/FutureFoundations/Media/true-to-the-oath/04-vertical/teaser_60s_youtube_short.mp4"
Write-Host "Metadata: S:/projects/FutureFoundations/Media/true-to-the-oath/02-build/teaser_60s/youtube_metadata.json"
