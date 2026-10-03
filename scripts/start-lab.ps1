param(
    [string]$BindAddress = "0.0.0.0",
    [ValidateRange(1024, 65535)][int]$Port = 8765,
    [string]$Python = "python",
    [ValidatePattern('^[A-Za-z0-9._-]*$')][string]$EnvironmentName = "",
    [switch]$SkipBuild
)
$ErrorActionPreference = "Stop"
$projectPath = Split-Path -Parent $PSScriptRoot
if (-not $EnvironmentName) {
    $EnvironmentName = if (Test-Path -LiteralPath (Join-Path $projectPath '.venv-phone/Scripts/python.exe')) { '.venv-phone' } else { '.venv' }
}
$venvDirectory = Join-Path $projectPath $EnvironmentName
$venvPython = Join-Path $venvDirectory "Scripts/python.exe"
$occupied = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() |
    Where-Object { $_.Port -eq $Port }
if ($occupied) {
    throw "Port $Port is already in use. Leave that server running, or choose another port with -Port 8766."
}

Push-Location -LiteralPath $projectPath
try {
    if (-not $SkipBuild) {
        $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
        if (-not $npmCommand) { throw "Install Node.js 22.12 or newer to build the TypeScript interface." }
        Push-Location -LiteralPath (Join-Path $projectPath "frontend")
        try {
            & $npmCommand.Source ci
            if ($LASTEXITCODE -ne 0) { throw "Frontend dependency installation failed." }
            & $npmCommand.Source run build
            if ($LASTEXITCODE -ne 0) { throw "The TypeScript interface did not compile." }
        } finally { Pop-Location }

        if (-not (Test-Path -LiteralPath $venvPython)) {
            & $Python -m venv $venvDirectory
            if ($LASTEXITCODE -ne 0) { throw "Could not create the local Python environment." }
        }
        # Import a compiler environment for this process, including VS 18 Build Tools.
        $vswherePath = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio/Installer/vswhere.exe"
        if (Test-Path -LiteralPath $vswherePath) {
            $vsInstall = & $vswherePath -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
            if ($vsInstall) {
                $devCommand = Join-Path $vsInstall "Common7/Tools/VsDevCmd.bat"
                if (Test-Path -LiteralPath $devCommand) {
                    $environmentLines = & $env:ComSpec /d /c "call `"$devCommand`" -arch=x64 -host_arch=x64 >nul && set"
                    if ($LASTEXITCODE -ne 0) { throw "Visual Studio could not initialize the C++ compiler environment." }
                    foreach ($line in $environmentLines) {
                        if ($line -match '^([^=]+)=(.*)$') {
                            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
                        }
                    }
                    $env:DISTUTILS_USE_SDK = "1"
                }
            }
        }
        & $venvPython -m pip install -e '.[dev]'
        if ($LASTEXITCODE -ne 0) { throw "Native build failed. Install Visual Studio C++ Build Tools and a Windows SDK." }
    }

    if (-not (Test-Path -LiteralPath $venvPython)) { throw "No local Python environment exists. Launch without -SkipBuild first." }
    & $venvPython -c "from thoth import _native; print('C++ engine:', _native.backend_info())"
    if ($LASTEXITCODE -ne 0) { throw "The native C++ engine is unavailable. Launch without -SkipBuild to build it." }
    if (-not (Test-Path -LiteralPath (Join-Path $projectPath "src/thoth/web/assets"))) {
        throw "Compiled TypeScript assets are missing. Launch without -SkipBuild to build them."
    }
    if (-not $env:OMP_NUM_THREADS) { $env:OMP_NUM_THREADS = "4" }
    if (-not $env:OPENBLAS_NUM_THREADS) { $env:OPENBLAS_NUM_THREADS = "1" }
    Write-Host "THOTH research lab: http://localhost:$Port"
    if ($BindAddress -eq "0.0.0.0") {
        $lanAddresses = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
            Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" }
        foreach ($address in $lanAddresses) {
            Write-Host "Phone on the same network: http://$($address.IPAddress):$Port"
        }
    }
    Write-Host "Leave this terminal running; Ctrl+C stops this server."
    & $venvPython -m thoth.cli serve --host $BindAddress --port $Port
    if ($LASTEXITCODE -ne 0) { throw "The THOTH server exited with an error." }
} finally {
    Pop-Location
}
