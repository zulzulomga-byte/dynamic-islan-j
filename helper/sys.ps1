$ErrorActionPreference = 'SilentlyContinue'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
Add-Type -AssemblyName System.Runtime.WindowsRuntime

$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]

function Await($op, $type) {
  $t = $asTask.MakeGenericMethod($type).Invoke($null, @($op))
  [void]$t.Wait(3000)
  if ($t.IsCompleted) { $t.Result }
}

$tMgr = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]
$tProp = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties, Windows.Media.Control, ContentType = WindowsRuntime]
$mgr = Await ($tMgr::RequestAsync()) $tMgr

function Get-Use($cap) {
  $root = "HKCU:\Software\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\$cap"
  $keys = @(Get-ChildItem $root) + @(Get-ChildItem "$root\NonPackaged")
  foreach ($k in $keys) {
    $p = Get-ItemProperty -LiteralPath $k.PSPath
    if ($p.LastUsedTimeStart -gt 0 -and $p.LastUsedTimeStop -eq 0) {
      $n = $k.PSChildName -replace '^.*#', ''
      return ($n -replace '_[a-z0-9]{13}$', '')
    }
  }
  return ''
}

function Get-Media {
  if (-not $mgr) { return @{ has = $false } }
  $s = $mgr.GetCurrentSession()
  if (-not $s) { return @{ has = $false } }
  $p = Await ($s.TryGetMediaPropertiesAsync()) $tProp
  $st = [int]$s.GetPlaybackInfo().PlaybackStatus
  $tl = $s.GetTimelineProperties()
  $dur = [double]$tl.EndTime.TotalSeconds
  $pos = [double]$tl.Position.TotalSeconds
  if ($st -eq 4 -and $tl.LastUpdatedTime.Year -gt 2000) {
    $pos += ([DateTimeOffset]::UtcNow - $tl.LastUpdatedTime).TotalSeconds
  }
  if ($dur -gt 0 -and $pos -gt $dur) { $pos = $dur }
  if ($pos -lt 0) { $pos = 0 }
  return @{
    has    = $true
    title  = [string]$p.Title
    artist = [string]$p.Artist
    app    = [string]$s.SourceAppUserModelId
    status = $st
    pos    = [math]::Round($pos, 1)
    dur    = [math]::Round($dur, 1)
  }
}

function Do-Cmd($c) {
  if (-not $mgr) { return }
  $s = $mgr.GetCurrentSession()
  if (-not $s) { return }
  if ($c -eq 'toggle') { [void](Await ($s.TryTogglePlayPauseAsync()) ([bool])) }
  elseif ($c -eq 'play') { [void](Await ($s.TryPlayAsync()) ([bool])) }
  elseif ($c -eq 'pause') { [void](Await ($s.TryPauseAsync()) ([bool])) }
  elseif ($c -eq 'next') { [void](Await ($s.TrySkipNextAsync()) ([bool])) }
  elseif ($c -eq 'prev') { [void](Await ($s.TrySkipPreviousAsync()) ([bool])) }
  elseif ($c -match '^seek:(\d+)$') {
    $ticks = [long]([double]$Matches[1] * 10000000)
    [void](Await ($s.TryChangePlaybackPositionAsync($ticks)) ([bool]))
  }
}

# stdin dibaca lewat StreamReader supaya ReadLineAsync benar-benar tidak memblokir
$sr = New-Object System.IO.StreamReader([Console]::OpenStandardInput(), [System.Text.Encoding]::UTF8)
$pending = $sr.ReadLineAsync()
$tick = 0
$mic = ''
$cam = ''

while ($true) {
  $got = $false
  while ($pending.IsCompleted) {
    $line = $pending.Result
    if ($null -eq $line) { exit }
    Do-Cmd $line.Trim()
    $got = $true
    $pending = $sr.ReadLineAsync()
  }
  if ($got -or ($tick % 4 -eq 0)) {
    if ($tick % 4 -eq 0) {
      $mic = Get-Use 'microphone'
      $cam = Get-Use 'webcam'
    }
    $o = @{ media = (Get-Media); mic = $mic; cam = $cam }
    [Console]::Out.WriteLine(($o | ConvertTo-Json -Compress -Depth 4))
    [Console]::Out.Flush()
  }
  $tick++
  Start-Sleep -Milliseconds 250
}
