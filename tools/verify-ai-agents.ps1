# verify-ai-agents.ps1
# Validates that all 15 AI agents and skills are properly configured
# Run from project root: .\tools\verify-ai-agents.ps1

$ErrorActionPreference = "Continue"
$projectRoot = Split-Path -Parent $PSScriptRoot
$agentsDir = Join-Path $projectRoot ".opencode\agents"
$skillsDir = Join-Path $projectRoot ".opencode\skills"
$opencodeJsonGlobal = Join-Path $env:USERPROFILE ".config\opencode\opencode.json"
$opencodeJsonLocal = Join-Path $projectRoot "opencode.json"
$opencodeJson = if (Test-Path $opencodeJsonLocal) { $opencodeJsonLocal } else { $opencodeJsonGlobal }
$skillRegistry = Join-Path $projectRoot ".atl\skill-registry.md"

$expectedAgents = @(
    "code-review",
    "testing",
    "documentation",
    "security-audit",
    "database",
    "performance",
    "deployment-release",
    "ui-ux",
    "api-design",
    "refactoring",
    "x-marketing",
    "instagram-marketing",
    "tiktok-marketing",
    "youtube-marketing",
    "lms-architect"
)

$passed = 0
$failed = 0
$warnings = @()

function Test-Pass {
    param([string]$msg)
    Write-Host "  PASS: $msg" -ForegroundColor Green
    $script:passed++
}

function Test-Fail {
    param([string]$msg)
    Write-Host "  FAIL: $msg" -ForegroundColor Red
    $script:failed++
}

function Test-Warn {
    param([string]$msg)
    Write-Host "  WARN: $msg" -ForegroundColor Yellow
    $script:warnings += $msg
}

Write-Host "`n=== AI Agent Team Validation ===" -ForegroundColor Cyan
Write-Host "Project: $projectRoot`n"

# 1. Check agent files exist
Write-Host "[1] Agent Files" -ForegroundColor Yellow
foreach ($agent in $expectedAgents) {
    $agentFile = Join-Path $agentsDir "$agent.md"
    if (Test-Path $agentFile) {
        Test-Pass "Agent file exists: $agent.md"
    } else {
        Test-Fail "Agent file missing: $agent.md"
    }
}

# 2. Check skill directories and SKILL.md exist
Write-Host "`n[2] Skill Files" -ForegroundColor Yellow
foreach ($agent in $expectedAgents) {
    $skillFile = Join-Path $skillsDir "$agent\SKILL.md"
    if (Test-Path $skillFile) {
        Test-Pass "Skill file exists: $agent/SKILL.md"
    } else {
        Test-Fail "Skill file missing: $agent/SKILL.md"
    }
}

# 3. Validate SKILL.md frontmatter
Write-Host "`n[3] SKILL.md Frontmatter" -ForegroundColor Yellow
foreach ($agent in $expectedAgents) {
    $skillFile = Join-Path $skillsDir "$agent\SKILL.md"
    if (Test-Path $skillFile) {
        $content = Get-Content $skillFile -Raw
        if ($content -match "^---\r?\nname:\s+(\S+)") {
            $name = $Matches[1]
            if ($name -eq $agent) {
                Test-Pass "Frontmatter name matches: $agent"
            } else {
                Test-Fail ("Frontmatter name mismatch for " + $agent + ": got '" + $name + "'")
            }
        } else {
            Test-Fail "Frontmatter missing name for: $agent"
        }
        
        if ($content -match "description:") {
            Test-Pass "Description present: $agent"
        } else {
            Test-Fail "Description missing: $agent"
        }
    }
}

# 4. Check for duplicate agents
Write-Host "`n[4] Duplicate Check" -ForegroundColor Yellow
$agentNames = @()
foreach ($agent in $expectedAgents) {
    if ($agentNames -contains $agent) {
        Test-Fail "Duplicate agent found: $agent"
    } else {
        $agentNames += $agent
    }
}
Test-Pass "No duplicate agents found"

# 5. Check opencode.json has all agents
Write-Host "`n[5] opencode.json Agent Registration" -ForegroundColor Yellow
if (Test-Path $opencodeJson) {
    Write-Host "  Config: $opencodeJson" -ForegroundColor Gray
    $json = Get-Content $opencodeJson -Raw | ConvertFrom-Json
    foreach ($agent in $expectedAgents) {
        if ($json.agent.PSObject.Properties.Name -contains $agent) {
            Test-Pass "Registered in opencode.json: $agent"
        } else {
            Test-Fail "Not registered in opencode.json: $agent"
        }
    }
    
    # Check orchestrator permissions
    $orchPerms = $json.agent."gentle-orchestrator".permission.task
    foreach ($agent in $expectedAgents) {
        if ($orchPerms.PSObject.Properties.Name -contains $agent) {
            if ($orchPerms.$agent -eq "allow") {
                Test-Pass "Orchestrator can delegate to: $agent"
            } else {
                Test-Warn "Orchestrator permission not 'allow' for: $agent"
            }
        } else {
            Test-Fail "Orchestrator cannot delegate to: $agent"
        }
    }
} else {
    Test-Fail "opencode.json not found"
}

# 6. Check skill registry
Write-Host "`n[6] Skill Registry" -ForegroundColor Yellow
if (Test-Path $skillRegistry) {
    $registry = Get-Content $skillRegistry -Raw
    foreach ($agent in $expectedAgents) {
        if ($registry -match $agent) {
            Test-Pass "In skill registry: $agent"
        } else {
            Test-Warn "Not in skill registry: $agent (run skill-registry refresh)"
        }
    }
} else {
    Test-Warn "Skill registry not found at .atl/skill-registry.md"
}

# 7. Check SDD agents are untouched
Write-Host "`n[7] SDD Agents Intact" -ForegroundColor Yellow
$sddAgents = @("sdd-apply", "sdd-archive", "sdd-design", "sdd-explore", "sdd-init", "sdd-onboard", "sdd-propose", "sdd-spec", "sdd-tasks", "sdd-verify")
if (Test-Path $opencodeJson) {
    $json = Get-Content $opencodeJson -Raw | ConvertFrom-Json
    foreach ($sdd in $sddAgents) {
        if ($json.agent.PSObject.Properties.Name -contains $sdd) {
            Test-Pass "SDD agent intact: $sdd"
        } else {
            Test-Fail "SDD agent missing: $sdd"
        }
    }
}

# 8. Check marketing agents are DRAFT MODE
Write-Host "`n[8] Marketing DRAFT MODE" -ForegroundColor Yellow
$marketingAgents = @("x-marketing", "instagram-marketing", "tiktok-marketing", "youtube-marketing")
foreach ($agent in $marketingAgents) {
    $skillFile = Join-Path $skillsDir "$agent\SKILL.md"
    if (Test-Path $skillFile) {
        $content = Get-Content $skillFile -Raw
        if ($content -match "DRAFT MODE") {
            Test-Pass "DRAFT MODE enforced: $agent"
        } else {
            Test-Warn "DRAFT MODE not explicitly stated: $agent"
        }
    }
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "Warnings: $($warnings.Count)" -ForegroundColor $(if ($warnings.Count -gt 0) { "Yellow" } else { "Green" })

if ($failed -eq 0) {
    Write-Host "`nAll checks passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nSome checks failed. Review the output above." -ForegroundColor Red
    exit 1
}
