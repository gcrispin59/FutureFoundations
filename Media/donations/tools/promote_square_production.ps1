# Promote Square donations from sandbox to production.
# Usage:
#   $env:SQUARE_PRODUCTION_TOKEN = "EAAA..."   # from developer.squareup.com → Production
#   ./promote_square_production.ps1
$ErrorActionPreference = "Stop"
$python = "S:/venvs/ffpac-media-publish/Scripts/python.exe"
$root = "S:/projects/FutureFoundations"
$envFile = "$root/.env"

$token = $env:SQUARE_PRODUCTION_TOKEN
if (-not $token) {
    Write-Host "Set SQUARE_PRODUCTION_TOKEN to your Production access token (Square Developer → Production tab)."
    exit 1
}

# Resolve production location ID
$headers = @{
    Authorization = "Bearer $token"
    "Square-Version" = "2024-01-18"
}
$locations = Invoke-RestMethod -Uri "https://connect.squareup.com/v2/locations" -Headers $headers
$locationId = $locations.locations[0].id
Write-Host "Production location: $locationId ($($locations.locations[0].name))"

# Patch local .env (sandbox lines remain commented backup)
$lines = Get-Content $envFile -ErrorAction SilentlyContinue | Where-Object {
    $_ -notmatch '^SQUARE_ENVIRONMENT=|^SQUARE_ACCESS_TOKEN=|^SQUARE_LOCATION_ID=|^SQUARE_LINK_'
}
$lines += @(
    "SQUARE_ENVIRONMENT=production",
    "SQUARE_ACCESS_TOKEN=$token",
    "SQUARE_LOCATION_ID=$locationId"
)
$lines | Set-Content $envFile -Encoding utf8

# Create production payment links + donate-links.json
& $python "$root/Media/donations/tools/create_square_links.py"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Read generated links from JSON
$json = Get-Content "$root/public/config/donate-links.json" | ConvertFrom-Json
$byId = @{}
foreach ($t in $json.tiers) { $byId[$t.id] = $t.url }

# Push to Netlify
netlify link --id 743a62bf-d53e-424d-87b2-29b1d5dc9ce1 | Out-Null
netlify env:set SQUARE_ENVIRONMENT production
netlify env:set SQUARE_ACCESS_TOKEN $token
netlify env:set SQUARE_LOCATION_ID $locationId
netlify env:set SQUARE_LINK_SUPPORTER_5 $byId.supporter_5
netlify env:set SQUARE_LINK_DEFENDER_25 $byId.defender_25
netlify env:set SQUARE_LINK_GUARDIAN_50 $byId.guardian_50
netlify env:set SQUARE_LINK_PROTECTOR_100 $byId.protector_100
netlify env:set SQUARE_DONATE_REDIRECT_URL "https://futurefoundationspac.org/donate/thank-you"

Write-Host "`nDeploying..."
netlify deploy --prod

Write-Host "`nProduction Square live. Test: https://futurefoundationspac.org/donate/"
