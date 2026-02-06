param(
    [string]$NginxLogPath = "",
    [switch]$TestMode
)

$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Run this script in PowerShell as Administrator."
    exit 1
}

if (-not $NginxLogPath) {
    $NginxLogPath = Join-Path $PSScriptRoot "nginx-logs\access.log"
}

$logDir = Split-Path $NginxLogPath -Parent
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# Ensure IPBan service (LocalSystem) can read logs
try {
    icacls $logDir /grant "NT AUTHORITY\SYSTEM:(RX)" /T | Out-Null
} catch {
    Write-Warning "Failed to grant SYSTEM read access to $logDir."
}

Write-Host "Installing IPBan..."
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
iex "& { $((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/DigitalRuby/IPBan/master/IPBanCore/Windows/Scripts/install_latest.ps1')) } -startupType 'delayed-auto' -silent `$True -autostart `$True"

$possibleConfigs = @(
    "C:\Program Files\IPBan\ipban.config",
    "C:\Program Files (x86)\IPBan\ipban.config",
    "C:\ProgramData\IPBan\ipban.config"
)

$configPath = $possibleConfigs | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $configPath) {
    Write-Error "Unable to locate ipban.config. IPBan may not have installed. Please re-run as Admin or try again after install completes."
    exit 1
}

[xml]$xml = Get-Content $configPath
$root = $xml.SelectSingleNode("/configuration")
if (-not $root) {
    Write-Error "Invalid ipban.config format."
    exit 1
}

if ($TestMode) {
    $appSettings = $root.SelectSingleNode("appSettings")
    if (-not $appSettings) {
        $appSettings = $xml.CreateElement("appSettings")
        $root.AppendChild($appSettings) | Out-Null
    }

    function Set-AppSetting($key, $value) {
        $existingSetting = $appSettings.SelectSingleNode("add[@key='$key']")
        if (-not $existingSetting) {
            $newSetting = $xml.CreateElement("add")
            $newSetting.SetAttribute("key", $key)
            $newSetting.SetAttribute("value", $value)
            $appSettings.AppendChild($newSetting) | Out-Null
        } else {
            $existingSetting.SetAttribute("value", $value)
        }
    }

    # Enable internal IP processing for local Docker testing
    Set-AppSetting -key "ProcessInternalIPAddresses" -value "true"
    # Low threshold for testing
    Set-AppSetting -key "FailedLoginAttemptsBeforeBan" -value "3"
    # Short ban time for testing (00:00:05:00 = 5 minutes)
    Set-AppSetting -key "BanTime" -value "00:00:05:00"
}

$logFilesNode = $root.SelectSingleNode("LogFilesToParse")
if (-not $logFilesNode) {
    $logFilesNode = $xml.CreateElement("LogFilesToParse")
    $root.AppendChild($logFilesNode) | Out-Null
}

$logFiles = $logFilesNode.SelectSingleNode("LogFiles")
if (-not $logFiles) {
    $logFiles = $xml.CreateElement("LogFiles")
    $logFilesNode.AppendChild($logFiles) | Out-Null
}

$existing = $logFiles.SelectSingleNode("LogFile[PathAndMask[contains(., '$NginxLogPath')]]")
$logFile = $existing
if (-not $logFile) {
    $logFile = $xml.CreateElement("LogFile")

    $source = $xml.CreateElement("Source")
    $source.InnerText = "nginx"
    $logFile.AppendChild($source) | Out-Null

    $path = $xml.CreateElement("PathAndMask")
    $path.InnerText = $NginxLogPath
    $logFile.AppendChild($path) | Out-Null

    $logFiles.AppendChild($logFile) | Out-Null
}

$regexValue = '^(?<ipaddress>\S+)\s+\S+\s+\S+\s+\[[^\]]+\]\s+"(?:GET|POST)\s+/(?:api/auth/(?:callback/credentials|signin|session)|login)[^"]*"\s+(?:401|403|404|429)\s+'

if ($logFile.SelectSingleNode("FailedLoginRegex")) {
    $logFile.SelectSingleNode("FailedLoginRegex").InnerText = $regexValue
} else {
    $regex = $xml.CreateElement("FailedLoginRegex")
    $regex.InnerText = $regexValue
    $logFile.AppendChild($regex) | Out-Null
}

if ($logFile.SelectSingleNode("FailedLoginThreshold")) {
    if ($TestMode) {
        $logFile.SelectSingleNode("FailedLoginThreshold").InnerText = "3"
    } else {
        $logFile.SelectSingleNode("FailedLoginThreshold").InnerText = "3"
    }
} else {
    $threshold = $xml.CreateElement("FailedLoginThreshold")
    if ($TestMode) {
        $threshold.InnerText = "3"
    } else {
        $threshold.InnerText = "3"
    }
    $logFile.AppendChild($threshold) | Out-Null
}

if (-not $logFile.SelectSingleNode("PlatformRegex")) {
    $platform = $xml.CreateElement("PlatformRegex")
    $platform.InnerText = "Windows"
    $logFile.AppendChild($platform) | Out-Null
}

if (-not $logFile.SelectSingleNode("PingInterval")) {
    $ping = $xml.CreateElement("PingInterval")
    $ping.InnerText = "10000"
    $logFile.AppendChild($ping) | Out-Null
}

$xml.Save($configPath)

Write-Host "IPBan configured with Nginx log path: $NginxLogPath"
if ($TestMode) {
    Write-Host "TestMode enabled: Internal IPs allowed, threshold=3, ban=5 minutes"
} else {
    Write-Host "Production mode: threshold=3"
}
Write-Host "Restarting IPBan service..."
Restart-Service ipban
Write-Host "Done."
