#!/bin/bash

###############################################################################
# VPS Health Monitor - Slack Integration
#
# Collects VPS health metrics (disk, memory, CPU, Docker, uptime) and
# sends periodic reports to a Slack channel via webhook.
#
# Usage:
#   chmod +x scripts/vps-health-monitor.sh
#   ./scripts/vps-health-monitor.sh
#
# Environment Variables:
#   SLACK_WEBHOOK_URL  - Slack Incoming Webhook URL (required)
#   HEALTH_CHECK_URL   - Application health endpoint (optional)
#   REPORT_MODE        - "compact" or "detailed" (default: alternating)
#
# Crontab (every 30 minutes):
#   */30 * * * * /var/www/wallestars/scripts/vps-health-monitor.sh
#
# For alternating compact/detailed reports every 30 min:
#   0 * * * *    REPORT_MODE=compact  /var/www/wallestars/scripts/vps-health-monitor.sh
#   30 * * * *   REPORT_MODE=detailed /var/www/wallestars/scripts/vps-health-monitor.sh
###############################################################################

set -euo pipefail

# Load environment from .env if available
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

# Configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-http://localhost:3000/api/health}"
REPORT_MODE="${REPORT_MODE:-auto}"
LOG_FILE="${LOG_FILE:-/var/log/wallestars-slack-monitor.log}"

# Thresholds
DISK_WARN=80
DISK_CRIT=90
MEM_WARN=80
MEM_CRIT=90
CPU_WARN=2.0
CPU_CRIT=5.0

# Logging
log() {
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $1" >> "$LOG_FILE" 2>/dev/null || true
}

# Validate webhook URL
if [ -z "$SLACK_WEBHOOK_URL" ]; then
  log "ERROR: SLACK_WEBHOOK_URL is not set"
  echo "Error: SLACK_WEBHOOK_URL environment variable is required" >&2
  exit 1
fi

# Collect metrics
get_disk_usage() {
  df -h / | tail -1 | awk '{print $5}' | sed 's/%//'
}

get_memory_usage() {
  free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}'
}

get_cpu_load() {
  cat /proc/loadavg | awk '{print $1}'
}

get_docker_status() {
  if command -v docker &>/dev/null; then
    if docker info &>/dev/null; then
      echo "active"
    else
      echo "inactive"
    fi
  else
    echo "not installed"
  fi
}

get_uptime() {
  local uptime_seconds
  uptime_seconds=$(cat /proc/uptime | awk '{print int($1)}')

  local days=$((uptime_seconds / 86400))
  local hours=$(( (uptime_seconds % 86400) / 3600 ))
  local minutes=$(( (uptime_seconds % 3600) / 60 ))

  local parts=()
  [ "$days" -gt 0 ] && parts+=("$days days")
  [ "$hours" -gt 0 ] && parts+=("$hours hours")
  [ "$minutes" -gt 0 ] && parts+=("$minutes minutes")

  local result=""
  for i in "${!parts[@]}"; do
    if [ "$i" -gt 0 ]; then
      result+=", "
    fi
    result+="${parts[$i]}"
  done

  echo "up $result"
}

check_app_health() {
  if curl -f -s -o /dev/null --connect-timeout 5 "$HEALTH_CHECK_URL"; then
    echo "healthy"
  else
    echo "unhealthy"
  fi
}

# Determine report mode (auto alternates based on minute)
determine_report_mode() {
  if [ "$REPORT_MODE" != "auto" ]; then
    echo "$REPORT_MODE"
    return
  fi

  local minute
  minute=$(date '+%M')
  if [ "$((minute % 60))" -lt 30 ]; then
    echo "compact"
  else
    echo "detailed"
  fi
}

# Determine health status
get_health_status() {
  local disk=$1
  local memory=$2
  local cpu=$3
  local docker=$4

  if [ "$disk" -ge "$DISK_CRIT" ] || [ "$memory" -ge "$MEM_CRIT" ] || [ "$docker" != "active" ]; then
    echo "critical"
  elif [ "$disk" -ge "$DISK_WARN" ] || [ "$memory" -ge "$MEM_WARN" ]; then
    echo "warning"
  else
    echo "healthy"
  fi
}

# Send compact health check to Slack
send_compact_report() {
  local disk=$1
  local memory=$2
  local cpu=$3
  local docker=$4
  local timestamp=$5
  local status=$6

  local status_emoji=":white_check_mark:"
  local status_text="VPS Health Check"
  if [ "$status" = "critical" ]; then
    status_emoji=":rotating_light:"
    status_text="VPS Health CRITICAL"
  elif [ "$status" = "warning" ]; then
    status_emoji=":warning:"
    status_text="VPS Health Warning"
  fi

  local message="${status_emoji} ${status_text}

:bar_chart: Disk: ${disk}%
:floppy_disk: Memory: ${memory}%
:zap: CPU: ${cpu}
:whale: Docker: ${docker}

:alarm_clock: ${timestamp}"

  send_slack_message "$message"
}

# Send detailed health report to Slack
send_detailed_report() {
  local disk=$1
  local memory=$2
  local cpu=$3
  local docker=$4
  local uptime=$5

  local message=":desktop_computer: *VPS Health Report*
• Disk: ${disk}%
• Memory: ${memory}%
• CPU Load: ${cpu}
• Docker: ${docker}
• ${uptime}"

  send_slack_message "$message"
}

# Send alert for critical/warning conditions
send_alert() {
  local severity=$1
  local message=$2
  local disk=$3
  local memory=$4
  local cpu=$5

  local emoji=":warning:"
  [ "$severity" = "critical" ] && emoji=":rotating_light:"

  local alert_text="${emoji} *VPS Health Alert - ${severity^^}*

${message}

*Current Metrics:*
• Disk: ${disk}%
• Memory: ${memory}%
• CPU Load: ${cpu}
• Time: $(date -u '+%Y-%m-%dT%H:%M:%S.%3NZ')"

  send_slack_message "$alert_text"
}

# Send message to Slack webhook
send_slack_message() {
  local text=$1

  local payload
  payload=$(printf '{"text": %s}' "$(echo "$text" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo "\"$text\"")")

  local response
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$payload" \
    --connect-timeout 10 \
    --max-time 15 \
    "$SLACK_WEBHOOK_URL")

  if [ "$response" = "200" ]; then
    log "Slack message sent successfully"
    return 0
  else
    log "ERROR: Failed to send Slack message (HTTP $response)"
    return 1
  fi
}

# Also send health data to Wallestars dashboard
send_to_dashboard() {
  local disk=$1
  local memory=$2
  local cpu=$3
  local docker=$4

  local payload="{
    \"healthReport\": {
      \"timestamp\": \"$(date -u '+%Y-%m-%dT%H:%M:%S.%3NZ')\",
      \"overallStatus\": \"$([ "$docker" = "active" ] && [ "$disk" -lt "$DISK_WARN" ] && [ "$memory" -lt "$MEM_WARN" ] && echo "healthy" || echo "unhealthy")\",
      \"services\": {
        \"wallestars\": { \"status\": \"$(check_app_health)\", \"needsRestart\": false },
        \"n8n\": { \"status\": \"up\", \"needsRestart\": false }
      },
      \"resources\": {
        \"disk\": { \"usage\": $disk, \"status\": \"$([ "$disk" -lt "$DISK_WARN" ] && echo "ok" || echo "warning")\", \"critical\": $([ "$disk" -ge "$DISK_CRIT" ] && echo "true" || echo "false") },
        \"memory\": { \"usage\": $memory, \"status\": \"$([ "$memory" -lt "$MEM_WARN" ] && echo "ok" || echo "warning")\", \"critical\": $([ "$memory" -ge "$MEM_CRIT" ] && echo "true" || echo "false") }
      },
      \"alerts\": []
    }
  }"

  curl -s -o /dev/null \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$payload" \
    --connect-timeout 5 \
    --max-time 10 \
    "http://localhost:3000/api/webhooks/n8n/health-report" 2>/dev/null || true
}

# Main
main() {
  log "Starting VPS health monitor"

  # Collect all metrics
  local disk memory cpu docker_status uptime_str timestamp

  disk=$(get_disk_usage)
  memory=$(get_memory_usage)
  cpu=$(get_cpu_load)
  docker_status=$(get_docker_status)
  uptime_str=$(get_uptime)
  timestamp=$(date -u '+%Y-%m-%dT%H:%M:%S.%3NZ')

  log "Metrics: disk=${disk}% memory=${memory}% cpu=${cpu} docker=${docker_status}"

  # Determine health status
  local status
  status=$(get_health_status "$disk" "$memory" "$cpu" "$docker_status")

  # Determine report mode
  local mode
  mode=$(determine_report_mode)

  # Send the appropriate report
  if [ "$mode" = "compact" ]; then
    send_compact_report "$disk" "$memory" "$cpu" "$docker_status" "$timestamp" "$status"
  else
    send_detailed_report "$disk" "$memory" "$cpu" "$docker_status" "$uptime_str"
  fi

  # Send alerts for warning/critical conditions
  if [ "$status" = "critical" ]; then
    local alert_msg=""
    [ "$disk" -ge "$DISK_CRIT" ] && alert_msg+="Disk usage is critically high at ${disk}%.\n"
    [ "$memory" -ge "$MEM_CRIT" ] && alert_msg+="Memory usage is critically high at ${memory}%.\n"
    [ "$docker_status" != "active" ] && alert_msg+="Docker is ${docker_status}.\n"
    send_alert "critical" "$alert_msg" "$disk" "$memory" "$cpu"
  elif [ "$status" = "warning" ]; then
    local alert_msg=""
    [ "$disk" -ge "$DISK_WARN" ] && alert_msg+="Disk usage is elevated at ${disk}%.\n"
    [ "$memory" -ge "$MEM_WARN" ] && alert_msg+="Memory usage is elevated at ${memory}%.\n"
    send_alert "warning" "$alert_msg" "$disk" "$memory" "$cpu"
  fi

  # Also forward to dashboard
  send_to_dashboard "$disk" "$memory" "$cpu" "$docker_status"

  log "Health monitor complete (mode=${mode}, status=${status})"
}

main "$@"
