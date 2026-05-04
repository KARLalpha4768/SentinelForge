$f = Get-Content "frontend/sentinel_drilldown.js" -Raw
$old = 'return `<tr style="cursor:pointer" onclick="openSiteDetail(''${s.id}'')">'
$new = 'const _clickFn = s.id.startsWith(''SLING-NUM'') ? `openSlingshotDetail(''${s.id}'')` : `openSiteDetail(''${s.id}'')`; return `<tr style="cursor:pointer" onclick="${_clickFn}" title="Click for detailed site profile">'
$f = $f.Replace($old, $new)
[System.IO.File]::WriteAllText("frontend/sentinel_drilldown.js", $f)
Write-Host "Done"
