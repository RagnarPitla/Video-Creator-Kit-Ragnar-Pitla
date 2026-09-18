<#
.SYNOPSIS
  Install the Video Creator Kit into GitHub Copilot CLI on Windows.

.DESCRIPTION
  The Windows counterpart to install.sh. Links every agent and skill in this
  repo into %USERPROFILE%\.copilot\ so the CLI discovers them, and optionally
  installs the two things the kit cannot work without: ffmpeg and Node.

  Linking rather than copying means `git pull` updates your agents without a
  reinstall. Windows makes that conditional, so read the note below.

.PARAMETER WithDeps
  Install ffmpeg and Node LTS through winget before linking.

.PARAMETER Check
  Verify the toolchain and report. Changes nothing. Run this first.

.PARAMETER DryRun
  Show what would happen and change nothing.

.PARAMETER Uninstall
  Remove only what this script created, tracked in the install manifest.

.EXAMPLE
  .\install.ps1 -Check
.EXAMPLE
  .\install.ps1 -WithDeps
.EXAMPLE
  .\install.ps1 -Uninstall

.NOTES
  Symlinks vs copies. Creating a file symlink on Windows needs either
  Developer Mode or an elevated shell. Directory junctions need neither.

  So skills, which are folders, are linked as junctions and always track the
  repo. Agents are single .md files: this script tries a symlink first and
  falls back to copying, which works everywhere but means a later `git pull`
  will not update those agents until you re-run this script. The summary tells
  you which mode you got, because the difference matters later and is silent.

  Turn on Developer Mode to get symlinks:
  Settings > System > For developers > Developer Mode.
#>

[CmdletBinding()]
param(
    [switch]$WithDeps,
    [switch]$Check,
    [switch]$DryRun,
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

$KitRoot     = Split-Path -Parent $MyInvocation.MyCommand.Path
$CopilotDir  = if ($env:COPILOT_HOME) { $env:COPILOT_HOME } else { Join-Path $env:USERPROFILE '.copilot' }
$AgentDest   = Join-Path $CopilotDir 'agents'
$SkillDest   = Join-Path $CopilotDir 'skills'
# A copy is indistinguishable from a file the user wrote themselves, so
# uninstall cannot be safe without a record of what we put there.
$Manifest    = Join-Path $CopilotDir 'video-creator-kit-installed.txt'

function Write-Head($t) { Write-Host ""; Write-Host $t -ForegroundColor Cyan }
function Write-Ok  ($t) { Write-Host "  [ok]   $t" -ForegroundColor Green }
function Write-Warn($t) { Write-Host "  [warn] $t" -ForegroundColor Yellow }
function Write-Bad ($t) { Write-Host "  [FAIL] $t" -ForegroundColor Red }

function Test-Cmd($name) {
    $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

<#
  winget installs land on the machine PATH, but this process inherited its
  environment when it started and will not see them. Anyone who installs and
  then runs a gate in the same window gets "ffmpeg is not recognized" on a
  machine where ffmpeg is present, which reads as a failed install.
#>
function Update-PathFromRegistry {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user    = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = (@($machine, $user) | Where-Object { $_ }) -join ';'
}

function Install-Dependencies {
    Write-Head "Dependencies"

    if (-not (Test-Cmd 'winget')) {
        Write-Bad "winget not found."
        Write-Host "         winget ships with App Installer. Install it from the Microsoft Store,"
        Write-Host "         or install these two by hand and re-run without -WithDeps:"
        Write-Host "           ffmpeg  https://www.gyan.dev/ffmpeg/builds/"
        Write-Host "           Node    https://nodejs.org/en/download"
        return $false
    }

    # -e --id pins the exact package. Without -e, a fuzzy name match can select
    # a different publisher's package of a similar name.
    $deps = @(
        @{ Name = 'ffmpeg'; Id = 'Gyan.FFmpeg';       Cmd = 'ffmpeg' },
        @{ Name = 'Node';   Id = 'OpenJS.NodeJS.LTS'; Cmd = 'node'   }
    )

    foreach ($d in $deps) {
        if (Test-Cmd $d.Cmd) { Write-Ok "$($d.Name) already installed"; continue }
        if ($DryRun) { Write-Host "  would install $($d.Name) ($($d.Id))"; continue }

        Write-Host "  installing $($d.Name) ..."
        winget install -e --id $d.Id --accept-package-agreements --accept-source-agreements --silent
        if ($LASTEXITCODE -ne 0) {
            Write-Bad "$($d.Name) install exited $LASTEXITCODE"
            return $false
        }
        Update-PathFromRegistry
        if (Test-Cmd $d.Cmd) {
            Write-Ok "$($d.Name) installed"
        } else {
            Write-Warn "$($d.Name) installed but not on PATH in this window. Open a new terminal."
        }
    }
    return $true
}

function Invoke-Doctor {
    Write-Head "Toolchain"
    $bad = 0

    if (Test-Cmd 'node') {
        $v = (node --version)
        # Remotion 4 needs Node 18 or newer. Older versions fail deep inside a
        # render with an error that does not mention the Node version.
        $major = [int](($v -replace '^v','') -split '\.')[0]
        if ($major -ge 18) { Write-Ok "node $v" }
        else { Write-Bad "node $v is too old, Remotion 4 needs 18 or newer"; $bad = 1 }
    } else { Write-Bad "node not found"; $bad = 1 }

    if (Test-Cmd 'npm') { Write-Ok "npm $(npm --version)" } else { Write-Bad "npm not found"; $bad = 1 }

    if (Test-Cmd 'ffmpeg') {
        $line = (ffmpeg -version 2>&1 | Select-Object -First 1)
        Write-Ok $line
    } else {
        Write-Bad "ffmpeg not found. Every verification gate in this kit needs it."
        $bad = 1
    }

    if (Test-Cmd 'ffprobe') { Write-Ok "ffprobe present" }
    else { Write-Bad "ffprobe not found. It ships with ffmpeg; a partial install will do this."; $bad = 1 }

    $enginePkg = Join-Path $KitRoot 'engine\node_modules\remotion'
    if (Test-Path $enginePkg) { Write-Ok "Remotion installed in engine\" }
    else { Write-Warn "Remotion not installed. Run: cd engine; npm install" }

    if (Test-Cmd 'copilot') { Write-Ok "GitHub Copilot CLI present" }
    else { Write-Warn "Copilot CLI not found. The agents install fine without it, but nothing will run them." }

    # Developer Mode decides whether agents track the repo or get frozen copies.
    $devMode = $false
    try {
        $k = Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock' -ErrorAction Stop
        $devMode = ($k.AllowDevelopmentWithoutDevLicense -eq 1)
    } catch { }
    if ($devMode) { Write-Ok "Developer Mode on, agents will be symlinked and track git pull" }
    else { Write-Warn "Developer Mode off, agents will be copied and will NOT update on git pull" }

    return $bad
}

# Returns 'link' or 'copy' so the summary can be honest about what happened.
function Install-One($src, $destDir) {
    $name = Split-Path -Leaf $src
    $dest = Join-Path $destDir $name
    $isDir = (Get-Item $src).PSIsContainer

    if (Test-Path -LiteralPath $dest) {
        $item = Get-Item -LiteralPath $dest -Force
        $isOurs = $item.LinkType -and ($item.Target -join '') -like "$KitRoot*"
        $inManifest = (Test-Path $Manifest) -and (Select-String -Path $Manifest -SimpleMatch $dest -Quiet)

        if ($isOurs -or $inManifest) {
            if ($DryRun) { Write-Host "  would refresh $name"; return 'link' }
            Remove-Item -LiteralPath $dest -Recurse -Force
        } else {
            # Same rule as install.sh: never overwrite something the user wrote.
            Write-Warn "SKIP $name - you already have your own, not overwriting"
            return 'skip'
        }
    }

    if ($DryRun) { Write-Host "  would install $name"; return 'link' }

    if ($isDir) {
        # Junctions need no privilege, so skills always track the repo.
        New-Item -ItemType Junction -Path $dest -Target $src | Out-Null
        Write-Host "  linked  $name"
        return 'link'
    }

    try {
        New-Item -ItemType SymbolicLink -Path $dest -Target $src -ErrorAction Stop | Out-Null
        Write-Host "  linked  $name"
        $mode = 'link'
    } catch {
        Copy-Item -LiteralPath $src -Destination $dest -Force
        Write-Host "  copied  $name"
        $mode = 'copy'
    }
    Add-Content -Path $Manifest -Value $dest
    return $mode
}

# ---------------------------------------------------------------- main

Write-Host "Video Creator Kit" -ForegroundColor Cyan
Write-Host "  repo:   $KitRoot"
Write-Host "  target: $CopilotDir"

if ($Check) { exit (Invoke-Doctor) }

if ($Uninstall) {
    Write-Head "Uninstall"
    if (-not (Test-Path $Manifest)) { Write-Host "  nothing installed by this script"; exit 0 }
    $removed = 0
    foreach ($p in Get-Content $Manifest | Where-Object { $_ }) {
        if (Test-Path -LiteralPath $p) {
            if ($DryRun) { Write-Host "  would remove $p" }
            else { Remove-Item -LiteralPath $p -Recurse -Force; Write-Host "  removed $(Split-Path -Leaf $p)" }
            $removed++
        }
    }
    if (-not $DryRun) { Remove-Item $Manifest -Force }
    Write-Host ""
    Write-Host "Removed $removed."
    exit 0
}

if ($WithDeps) {
    if (-not (Install-Dependencies)) { exit 1 }
}

if (-not $DryRun) {
    New-Item -ItemType Directory -Force -Path $AgentDest, $SkillDest | Out-Null
    if (-not (Test-Path $Manifest)) { New-Item -ItemType File -Path $Manifest -Force | Out-Null }
}

$linked = 0; $copied = 0; $skipped = 0
function Tally($r) {
    switch ($r) {
        'link' { $script:linked++ }
        'copy' { $script:copied++ }
        'skip' { $script:skipped++ }
    }
}

Write-Head "Agents"
Get-ChildItem -Path (Join-Path $KitRoot 'agents') -Filter *.md -File |
    ForEach-Object { Tally (Install-One $_.FullName $AgentDest) }

Write-Head "Skills"
Get-ChildItem -Path (Join-Path $KitRoot 'skills') -Directory |
    ForEach-Object { Tally (Install-One $_.FullName $SkillDest) }

Write-Host ""
if ($DryRun) { Write-Host "Dry run. Nothing changed."; exit 0 }

Write-Host "Linked $linked, copied $copied, skipped $skipped."
if ($copied -gt 0) {
    Write-Warn "$copied were copied, not linked. They will not update on git pull."
    Write-Host "         Turn on Developer Mode and re-run this script to fix that:"
    Write-Host "         Settings > System > For developers > Developer Mode."
}

$doctorBad = Invoke-Doctor

Write-Head "Next"
Write-Host "  1. cd engine; npm install       # Remotion render engine"
Write-Host "  2. .\install.ps1 -Check         # confirm the toolchain"
Write-Host "  3. Start Copilot CLI and ask: `"make a 60 second explainer about X`""
Write-Host ""
Write-Host "  Remotion downloads its own Chrome on the first render, so expect"
Write-Host "  that one to take several minutes longer than the rest."
Write-Host ""
Write-Host "  Read README.md before your first video. The verification gates in"
Write-Host "  docs\verification-gates.md are the part people skip and regret."

exit $doctorBad
