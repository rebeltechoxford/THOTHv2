param([int]$Port = 8765)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$venvPython = Join-Path $projectRoot '.venv/Scripts/python.exe'
if (-not (Test-Path -LiteralPath $venvPython)) {
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) { throw 'Could not create Python environment.' }
}
# distutils can miss newly released Visual Studio installations; import its supported development environment.
$vswherePath = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
if (Test-Path -LiteralPath $vswherePath) {
    $vsInstall = & $vswherePath -latest -products '*' -property installationPath
    $devCommand = Join-Path $vsInstall 'Common7/Tools/VsDevCmd.bat'
    if (Test-Path -LiteralPath $devCommand) {
        $environmentLines = & $env:ComSpec /d /c "call `"$devCommand`" -arch=x64 -host_arch=x64 >nul && set"
        foreach ($line in $environmentLines) {
            if ($line -match '^([^=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') }
        }
        $env:DISTUTILS_USE_SDK = '1'
    }
}
& $venvPython -m pip install -e '.[dev]'
if ($LASTEXITCODE -ne 0) { throw 'Native build failed. Install the C++ build tools and Windows SDK.' }
Write-Host "THOTHv2: http://127.0.0.1:$Port"
& $venvPython -m thoth.cli serve --port $Port
