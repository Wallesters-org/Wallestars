# ИНФРАСТРУКТУРА - Ubuntu Pro VM и Tails USB Конфигурация

## Преглед

Този документ съдържа подробна информация за конфигурацията и управлението на 10-те Ubuntu Pro виртуални машини, BIOS настройките, и Tails USB setup за Wallestars проекта.

---

## 1. Ubuntu Pro Виртуални Машини

### Обща Информация

**Налични VMs**: 10 броя Ubuntu Pro виртуални машини  
**Състояние**: 1 вече конфигурирана към локален Ubuntu laptop  
**Provider**: Предполагаем Hostinger VPS или подобен cloud provider

### VM Specifications (Типични)

```
┌─────────────────────────────────────────┐
│       Ubuntu Pro VM Specification       │
├─────────────────────────────────────────┤
│ OS: Ubuntu Pro 22.04 LTS                │
│ vCPUs: 2-4 cores                        │
│ RAM: 4-8 GB                             │
│ Storage: 50-100 GB SSD                  │
│ Network: 1 Gbps                         │
│ Security: Ubuntu Pro (ESM, Livepatch)   │
└─────────────────────────────────────────┘
```

---

## 2. Архитектура на VM Инфраструктурата

### Предложена Структура

```
┌──────────────────────────────────────────────────────────────┐
│                    10 Ubuntu Pro VMs                          │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  VM-01: Production API Server                                 │
│    - FastAPI приложения                                       │
│    - Claude Agent API                                         │
│    - RAG System API                                           │
│                                                                │
│  VM-02: Database Server                                       │
│    - PostgreSQL                                               │
│    - Redis cache                                              │
│    - Vector DB (Weaviate/Qdrant)                             │
│                                                                │
│  VM-03: n8n Automation Server                                 │
│    - n8n workflows                                            │
│    - Automation pipelines                                     │
│    - Webhook handlers                                         │
│                                                                │
│  VM-04: Development/Staging Environment                       │
│    - Testing environment                                      │
│    - CI/CD pipelines                                          │
│    - Development tools                                        │
│                                                                │
│  VM-05: Monitoring & Logging                                  │
│    - Prometheus                                               │
│    - Grafana                                                  │
│    - ELK Stack (Elasticsearch, Logstash, Kibana)             │
│                                                                │
│  VM-06: Backup & Storage Server                               │
│    - Automated backups                                        │
│    - File storage                                             │
│    - Archive management                                       │
│                                                                │
│  VM-07: Load Balancer / Reverse Proxy                         │
│    - Nginx/HAProxy                                            │
│    - SSL/TLS termination                                      │
│    - Traffic distribution                                     │
│                                                                │
│  VM-08: Security & VPN Server                                 │
│    - VPN gateway                                              │
│    - Firewall management                                      │
│    - Security monitoring                                      │
│                                                                │
│  VM-09: AI/ML Processing Server                               │
│    - Model training                                           │
│    - Batch processing                                         │
│    - Heavy computations                                       │
│                                                                │
│  VM-10: Reserved/Hot Standby                                  │
│    - Backup server                                            │
│    - Failover capacity                                        │
│    - Future expansion                                         │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Конфигурация на Първата VM

### Стъпки за Setup (Вече Завършени)

1. **Получаване на VM достъп**
   ```bash
   ssh ubuntu@<VM_IP_ADDRESS>
   ```

2. **Първоначална конфигурация**
   ```bash
   # Update система
   sudo apt update && sudo apt upgrade -y
   
   # Install основни tools
   sudo apt install -y git curl wget vim htop net-tools
   
   # Configure firewall
   sudo ufw allow OpenSSH
   sudo ufw enable
   ```

3. **Ubuntu Pro активация**
   ```bash
   # Ако не е активирана
   sudo pro attach <UBUNTU_PRO_TOKEN>
   
   # Проверка на статус
   sudo pro status
   ```

4. **SSH Key конфигурация**
   ```bash
   # Генериране на SSH key (ако няма)
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Копиране на public key към VM
   ssh-copy-id ubuntu@<VM_IP_ADDRESS>
   ```

---

## 4. Конфигурация на Останалите 9 VMs

### Automated Setup Script

```bash
#!/bin/bash
# setup_vm.sh - Автоматизиран script за VM setup

VM_IP=$1
VM_NAME=$2

if [ -z "$VM_IP" ] || [ -z "$VM_NAME" ]; then
    echo "Usage: ./setup_vm.sh <VM_IP> <VM_NAME>"
    exit 1
fi

echo "Setting up VM: $VM_NAME ($VM_IP)"

# 1. Basic update and upgrade
ssh ubuntu@$VM_IP << 'EOF'
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget vim htop net-tools docker.io docker-compose

# Enable docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Install monitoring agent
wget -O /tmp/node_exporter.tar.gz https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar -xzf /tmp/node_exporter.tar.gz -C /tmp/
sudo mv /tmp/node_exporter-*/node_exporter /usr/local/bin/
rm -rf /tmp/node_exporter*

# Create systemd service for node_exporter
sudo tee /etc/systemd/system/node_exporter.service << 'SYSTEMD'
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=ubuntu
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
SYSTEMD

sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter

# Set hostname
sudo hostnamectl set-hostname $VM_NAME

echo "VM setup completed!"
EOF

echo "VM $VM_NAME ($VM_IP) configured successfully!"
```

### Използване на Script

```bash
# Дай execute permissions
chmod +x setup_vm.sh

# Setup всяка VM
./setup_vm.sh 192.168.1.101 wallestars-vm-01
./setup_vm.sh 192.168.1.102 wallestars-vm-02
./setup_vm.sh 192.168.1.103 wallestars-vm-03
# ... и т.н.
```

---

## 5. BIOS Конфигурация и Secure Boot

### Защо Secure Boot?

**Secure Boot** е security feature, който:
- Предотвратява зареждането на неподписан/malicious код при boot
- Гарантира, че системата стартира само с trusted software
- Необходим за някои security features на Ubuntu Pro
- **Важен за Tails USB** защото Tails изисква secure boot за някои функции

### BIOS Setup Стъпки

#### 1. Влизане в BIOS
```
1. Рестартирай компютъра
2. Натисни F2/F10/F12/Del (зависи от производител)
   - Dell: F2
   - HP: F10
   - Lenovo: F1 или F2
   - ASUS: F2 или Del
3. Навигирай до Security или Boot меню
```

#### 2. Настройка на Secure Boot

```
BIOS > Security Tab
    └── Secure Boot
        ├── Enabled: [X] YES  ← Твоята настройка
        ├── Secure Boot Mode: Standard
        └── Key Management
            ├── Install Default Keys
            └── Clear All Keys (ако има проблем)
```

**Твоята ситуация**: ✅ Вече си настроил Secure Boot на `true` - Отлично!

#### 3. Boot Options Configuration

##### Добавяне на New Boot Option

Ти споменаваш, че избираш "Add New Boot Option" понеже имаш само една boot опция.

**Стъпки**:
```
BIOS > Boot Tab
    └── Boot Options
        ├── Existing Boot Options:
        │   └── [Boot Option #1]: Ubuntu (или Windows)
        │
        └── Add New Boot Option
            ├── Boot Option Name: "Tails USB" ← Дай име
            ├── Select Filesystem:
            │   ├── <DIR> BOOT    ← Избери този!
            │   └── <DIR> debian
            │
            └── Path for boot option:
                ├── GRUBX64.EFI     ← Препоръчвам този за Tails
                ├── BOOTX64.EFI     ← Generic fallback
                └── BOOTIA32.EFI    ← За 32-bit (не е нужен)
```

### Кой Файл Да Избереш?

#### 📁 Директория: `<DIR> BOOT` (Препоръчва се)

**GRUBX64.EFI** - ✅ **ПРЕПОРЪЧВАМ**
- Това е GRUB bootloader за 64-bit UEFI системи
- Използва се от повечето Linux дистрибуции включително Tails
- Най-добрият избор за Tails USB

**BOOTX64.EFI** - ⚠️ Generic fallback
- Generic/default UEFI bootloader
- Използва се като fallback ако GRUBX64 не работи
- По-малко опции за конфигурация

**BOOTIA32.EFI** - ❌ Не препоръчвам
- За 32-bit системи
- Твоят laptop вероятно е 64-bit
- Не е нужен

#### 📁 Директория: `<DIR> debian` (Алтернатива)

Тази директория може да съдържа Debian-specific boot файлове, но за Tails трябва да използваш `<DIR> BOOT` директорията.

### Правилната Конфигурация за Tails

```
Препоръчвана BIOS Boot Configuration:

1. Boot Option #1: Ubuntu (или твоя основен OS)
   Path: /EFI/ubuntu/grubx64.efi

2. Boot Option #2: Tails USB (нова опция)
   Path: /EFI/BOOT/GRUBX64.EFI
   
Boot Order:
   1. Ubuntu
   2. Tails USB
   3. Network Boot (optional)
```

---

## 6. Tails USB Конфигурация

### Какво е Tails?

**Tails** (The Amnesic Incognito Live System) е:
- Security-focused Linux дистрибуция
- Базирана на Debian
- Designed за privacy и anonymity
- Всички connections минават през Tor network
- Не оставя следи на компютъра (amnesic)

### Защо Tails в Wallestars Проекта?

#### ✅ Предимства

1. **Security Testing**
   - Безопасно тестване на security features
   - Изолирана среда за penetration testing
   - Защитена комуникация

2. **Privacy-First Development**
   - Анонимна работа със sensitive код
   - Защитени API key operations
   - Secure deployment procedures

3. **Clean Testing Environment**
   - Fresh environment за всяка session
   - Няма persistent state (освен ако не е explicit)
   - Идеално за reproducible testing

4. **Secure Communication**
   - Всички connections през Tor
   - Encrypted communication по default
   - Защита от surveillance

#### ⚠️ Недостатъци и Предизвикателства

1. **Performance**
   - По-бавна заради Tor routing
   - Не е подходяща за production deployment
   - Ограничена за heavy development work

2. **Persistence Ограничения**
   - По default не запазва файлове
   - Persistent storage трябва да се configure explicit
   - Може да загубиш работа ако не internal persistent volume

3. **Development Limitations**
   - Няма прям достъп до VM infrastructure
   - Трудно за real-time debugging
   - Incompatible с някои development tools

4. **Сложност**
   - По-сложна setup и configuration
   - Изисква добро разбиране на security concepts
   - Може да забави development процеса

### Моята Честна Препоръка

#### За Wallestars Проекта:

**НЕ използвай Tails за daily development работа** ❌

**Използвай Tails за**:
- Security auditing и penetration testing ✅
- Sensitive operations (API key generation, etc.) ✅
- Privacy-critical communications ✅
- Testing security features ✅
- Emergency access в compromise scenarios ✅

**Използвай Regular Ubuntu за**:
- Daily development ✅
- CI/CD pipelines ✅
- Production deployments ✅
- Team collaboration ✅
- Performance-critical tasks ✅

### Setup на Tails USB

#### 1. Създаване на Tails USB

```bash
# На твоя Ubuntu laptop

# Download Tails image
wget https://tails.boum.org/install/download/index.en.html

# Verify signature (важно!)
wget https://tails.boum.org/torrents/files/tails-amd64-5.22.img.sig
gpg --verify tails-amd64-5.22.img.sig tails-amd64-5.22.img

# Flash към USB (ВНИМАНИЕ: Ще изтрие всичко на USB-то!)
# Замени /dev/sdX с твоя USB device
sudo dd if=tails-amd64-5.22.img of=/dev/sdX bs=4M status=progress && sync
```

#### 2. Boot от Tails USB

```
1. Вкарай Tails USB Type-C в laptop
2. Рестартирай компютъра
3. Натисни F12 (или boot menu key)
4. Избери Tails USB от boot меню
5. Изчакай Tails да се зареди
6. Избери "Start Tails"
```

#### 3. Persistent Storage Setup (Optional)

Ако искаш да запазваш файлове между sessions:

```
1. В Tails, отвори Applications > Tails > Configure persistent volume
2. Set password за encrypted storage
3. Избери какво да се запазва:
   - Personal files
   - SSH client keys
   - GnuPG keys
   - Browser bookmarks
   - Network connections
   - Additional software
4. Restart Tails и unlock persistent storage
```

---

## 7. Интеграция на VM с Local Ubuntu

### SSH Configuration за всички VMs

```bash
# ~/.ssh/config
# Конфигурация за всички 10 VMs

Host vm-01-prod
    HostName 192.168.1.101
    User ubuntu
    IdentityFile ~/.ssh/wallestars_id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 3

Host vm-02-db
    HostName 192.168.1.102
    User ubuntu
    IdentityFile ~/.ssh/wallestars_id_ed25519

Host vm-03-n8n
    HostName 192.168.1.103
    User ubuntu
    IdentityFile ~/.ssh/wallestars_id_ed25519

# ... и т.н. за всички 10 VMs

# Wildcard за всички Wallestars VMs
Host vm-*
    User ubuntu
    IdentityFile ~/.ssh/wallestars_id_ed25519
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    LogLevel ERROR
```

### Използване

```bash
# Connect to specific VM
ssh vm-01-prod

# Run command on VM
ssh vm-02-db "sudo systemctl status postgresql"

# Copy files
scp myfile.txt vm-03-n8n:/home/ubuntu/

# SSH tunnel за database access
ssh -L 5432:localhost:5432 vm-02-db
```

---

## 8. Automation Scripts

### Deploy to All VMs Script

```bash
#!/bin/bash
# deploy_all_vms.sh

VMS=(
    "vm-01-prod:192.168.1.101"
    "vm-02-db:192.168.1.102"
    "vm-03-n8n:192.168.1.103"
    "vm-04-dev:192.168.1.104"
    "vm-05-monitor:192.168.1.105"
    "vm-06-backup:192.168.1.106"
    "vm-07-proxy:192.168.1.107"
    "vm-08-security:192.168.1.108"
    "vm-09-ai:192.168.1.109"
    "vm-10-standby:192.168.1.110"
)

COMMAND=$1

if [ -z "$COMMAND" ]; then
    echo "Usage: ./deploy_all_vms.sh '<command>'"
    exit 1
fi

for vm in "${VMS[@]}"; do
    IFS=':' read -r name ip <<< "$vm"
    echo "Executing on $name ($ip)..."
    ssh ubuntu@$ip "$COMMAND"
    echo "---"
done
```

### Usage Examples

```bash
# Update all VMs
./deploy_all_vms.sh "sudo apt update && sudo apt upgrade -y"

# Check disk space on all VMs
./deploy_all_vms.sh "df -h"

# Check docker status
./deploy_all_vms.sh "sudo systemctl status docker"

# Deploy application to production VM
./deploy_app.sh vm-01-prod
```

---

## 9. Monitoring Setup

### Prometheus + Grafana на VM-05

#### Prometheus Configuration

```yaml
# /etc/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'wallestars_vms'
    static_configs:
      - targets:
        - '192.168.1.101:9100'  # VM-01
        - '192.168.1.102:9100'  # VM-02
        - '192.168.1.103:9100'  # VM-03
        - '192.168.1.104:9100'  # VM-04
        - '192.168.1.105:9100'  # VM-05
        - '192.168.1.106:9100'  # VM-06
        - '192.168.1.107:9100'  # VM-07
        - '192.168.1.108:9100'  # VM-08
        - '192.168.1.109:9100'  # VM-09
        - '192.168.1.110:9100'  # VM-10
```

#### Grafana Dashboard

Access: http://vm-05-monitor:3000
- Default credentials: admin/admin
- Import dashboard ID: 1860 (Node Exporter Full)

---

## 10. Security Best Practices

### 1. SSH Hardening

```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 22
AllowUsers ubuntu
MaxAuthTries 3
```

### 2. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow from 192.168.1.0/24 to any port 22
sudo ufw enable
```

### 3. Automatic Updates

```bash
# Enable unattended upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 11. Backup Strategy

### Automated Backup Script

```bash
#!/bin/bash
# backup_vm.sh

VM_NAME=$1
BACKUP_DIR="/backup/vms"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
ssh ubuntu@$VM_NAME "sudo tar czf - /home /etc /var/lib/docker" > \
    "$BACKUP_DIR/${VM_NAME}_${DATE}.tar.gz"

# Keep only last 7 backups
ls -t $BACKUP_DIR/${VM_NAME}_*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup completed: ${VM_NAME}_${DATE}.tar.gz"
```

---

## 12. Следващи Стъпки

- [ ] Конфигуриране на останалите 9 VMs
- [ ] Setup monitoring на всички VMs
- [ ] Deploy services на съответните VMs
- [ ] Configure backup automation
- [ ] Setup load balancer
- [ ] Implement security monitoring
- [ ] Document disaster recovery procedures
- [ ] Test Tails USB за specific security tasks

---

## Обобщение

### BIOS Boot Configuration
- ✅ Secure Boot е enabled
- ✅ За Tails USB избери: `<DIR>BOOT` → `GRUBX64.EFI`
- ✅ Добави като втора boot опция

### Tails USB
- ✅ Използвай за security testing и sensitive operations
- ❌ НЕ използвай за daily development
- ⚠️ Configure persistent storage ако е нужно

### Ubuntu Pro VMs
- ✅ 1/10 VMs са конфигурирани
- 🔄 9 VMs чакат configuration
- 📋 Използвай automation scripts за ефективност

---

## Контакти и Поддръжка

За въпроси относно инфраструктурата:
- Check REPOSITORY_ANALYSIS.md за architectural overview
- Check EVA_SYSTEM.md за system integration
- Check TASK_MANAGEMENT.md за task tracking
