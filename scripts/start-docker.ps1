param(
    [string]$BindAddress = "0.0.0.0",
    [ValidateRange(1024, 65535)][int]$Port = 8765,
    [ValidateRange(1, 128)][int]$Cpus = 4,
    [string]$Memory = "2g"
)
$ErrorActionPreference = "Stop"
$projectPath = Split-Path -Parent $PSScriptRoot
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker is not installed. See docs/INTERNAL_RUN.md for Docker prerequisites and the working native Windows launch."
}
& docker info --format '{{.ServerVersion}}'
if ($LASTEXITCODE -ne 0) { throw "Docker Engine is unavailable. Start the Linux-container engine, then retry." }
$env:THOTH_BIND = $BindAddress
$env:THOTH_PORT = "$Port"
$env:THOTH_CPUS = "$Cpus"
$env:THOTH_NATIVE_THREADS = "$Cpus"
$env:THOTH_MEMORY = $Memory
Push-Location -LiteralPath $projectPath
try {
    & docker compose config --quiet
    if ($LASTEXITCODE -ne 0) { throw "The Compose configuration is invalid." }
    & docker compose up --build --detach --wait --wait-timeout 180
    if ($LASTEXITCODE -ne 0) { throw "THOTH failed to become healthy. Run docker compose logs observatory." }
    Write-Host "THOTH is running at http://localhost:$Port"
    if ($BindAddress -eq "0.0.0.0") {
        $lanAddresses = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
            Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" }
        foreach ($address in $lanAddresses) {
            Write-Host "Phone on the same network: http://$($address.IPAddress):$Port"
        }
    }
} finally {
    Pop-Location
}
