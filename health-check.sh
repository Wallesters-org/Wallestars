#!/bin/bash

###############################################################################
# Wallestars Health Check Script
# 
# Monitors the health of Wallestars and N8N services
# Automatically restarts services if they are down
# 
# Usage:
#   chmod +x health-check.sh
#   ./health-check.sh
#
# Add to crontab for automatic monitoring:
#   crontab -e
#   */5 * * * * /var/www/wallestars/health-check.sh >> /var/log/wallestars-health.log 2>&1
###############################################################################

# Configuration
WALLESTARS_URL="http://localhost:3000/api/health"
N8N_URL="http://localhost:5678/healthz"
LOG_FILE="/var/log/wallestars-health.log"
MAX_RETRIES=3
RETRY_DELAY=5
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Timestamp function
timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# Log function
log() {
    echo "[$(timestamp)] $1" | tee -a "$LOG_FILE"
}

# Check service health with retries
check_service() {
    local service_name=$1
    local service_url=$2
    local pm2_name=$3
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if curl -f -s -o /dev/null "$service_url"; then
            log "$(echo -e ${GREEN}✅ $service_name is healthy${NC})"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MAX_RETRIES ]; then
            log "$(echo -e ${YELLOW}⚠️  $service_name check failed, retrying... ($retry_count/$MAX_RETRIES)${NC})"
            sleep $RETRY_DELAY
        fi
    done
    
    # Service is down after retries
    log "$(echo -e ${RED}❌ $service_name is DOWN after $MAX_RETRIES attempts${NC})"
    
    # Attempt restart
    log "$(echo -e ${YELLOW}🔄 Attempting to restart $service_name...${NC})"
    pm2 restart "$pm2_name"
    
    # Wait and verify
    sleep 10
    if curl -f -s -o /dev/null "$service_url"; then
        log "$(echo -e ${GREEN}✅ $service_name successfully restarted${NC})"
        return 0
    else
        log "$(echo -e ${RED}❌ $service_name restart failed - manual intervention required${NC})"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    local usage=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$usage" -gt 90 ]; then
        log "$(echo -e ${RED}❌ Disk space critical: ${usage}% used${NC})"
    elif [ "$usage" -gt 80 ]; then
        log "$(echo -e ${YELLOW}⚠️  Disk space warning: ${usage}% used${NC})"
    else
        log "$(echo -e ${GREEN}✅ Disk space OK: ${usage}% used${NC})"
    fi
}

# Check memory usage
check_memory() {
    local mem_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    if [ "$mem_usage" -gt 90 ]; then
        log "$(echo -e ${RED}❌ Memory critical: ${mem_usage}% used${NC})"
    elif [ "$mem_usage" -gt 80 ]; then
        log "$(echo -e ${YELLOW}⚠️  Memory warning: ${mem_usage}% used${NC})"
    else
        log "$(echo -e ${GREEN}✅ Memory OK: ${mem_usage}% used${NC})"
    fi
}

# Check PM2 processes
check_pm2_status() {
    local status=$(pm2 jlist 2>/dev/null)
    
    if [ -z "$status" ] || [ "$status" = "[]" ]; then
        log "$(echo -e ${RED}❌ PM2 has no running processes${NC})"
        return 1
    fi
    
    # Check for errored processes
    local errored=$(echo "$status" | grep -o '"status":"errored"' | wc -l)
    if [ "$errored" -gt 0 ]; then
        log "$(echo -e ${RED}❌ PM2 has $errored errored process(es)${NC})"
        return 1
    fi
    
    log "$(echo -e ${GREEN}✅ PM2 processes OK${NC})"
    return 0
}

# Check SSL certificates expiration
check_ssl_certificates() {
    local domains=("srv1201204.hstgr.cloud" "n8n.srv1201204.hstgr.cloud")
    
    for domain in "${domains[@]}"; do
        local cert_file="/etc/letsencrypt/live/$domain/cert.pem"
        
        if [ -f "$cert_file" ]; then
            local expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
            local expiry_epoch=$(date -d "$expiry_date" +%s)
            local current_epoch=$(date +%s)
            local days_remaining=$(( ($expiry_epoch - $current_epoch) / 86400 ))
            
            if [ "$days_remaining" -lt 7 ]; then
                log "$(echo -e ${RED}❌ SSL certificate for $domain expires in $days_remaining days${NC})"
            elif [ "$days_remaining" -lt 30 ]; then
                log "$(echo -e ${YELLOW}⚠️  SSL certificate for $domain expires in $days_remaining days${NC})"
            else
                log "$(echo -e ${GREEN}✅ SSL certificate for $domain OK ($days_remaining days remaining)${NC})"
            fi
        fi
    done
}

# Send Slack notification
send_slack_notification() {
    local message=$1

    if [ -z "$SLACK_WEBHOOK_URL" ]; then
        return 0
    fi

    local payload
    payload=$(printf '{"text": %s}' "$(echo "$message" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo "\"$message\"")")

    curl -s -o /dev/null \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        --connect-timeout 10 \
        --max-time 15 \
        "$SLACK_WEBHOOK_URL" 2>/dev/null || log "⚠️  Failed to send Slack notification"
}

# Main health check
main() {
    log "=========================================="
    log "🔍 Starting health check"
    log "=========================================="

    # Check services
    check_service "Wallestars" "$WALLESTARS_URL" "wallestars"
    local wallestars_status=$?
    check_service "N8N" "$N8N_URL" "n8n"
    local n8n_status=$?

    # Check system resources
    check_disk_space
    check_memory

    # Check PM2
    check_pm2_status

    # Check SSL certificates
    check_ssl_certificates

    # Send Slack alert if any service is down
    if [ "$wallestars_status" -ne 0 ] || [ "$n8n_status" -ne 0 ]; then
        local alert_msg=":rotating_light: *Service Alert*"
        [ "$wallestars_status" -ne 0 ] && alert_msg+="\n• Wallestars is DOWN"
        [ "$n8n_status" -ne 0 ] && alert_msg+="\n• N8N is DOWN"
        alert_msg+="\n\n:alarm_clock: $(date -u '+%Y-%m-%dT%H:%M:%S.%3NZ')"
        send_slack_notification "$alert_msg"
    fi

    log "=========================================="
    log "✅ Health check complete"
    log "=========================================="
    echo ""
}

# Run main function
main
