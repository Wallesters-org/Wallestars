# Wallestars Dev Container - Custom Dockerfile
# Базиран на официалния Node.js image с допълнителни инструменти

FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Metadata
LABEL maintainer="Wallesters-org"
LABEL description="Wallestars AI Platform - Development Container"
LABEL version="1.0.0"

# === Аргументи ===
ARG DEBIAN_FRONTEND=noninteractive
ARG NODE_VERSION=22
ARG PYTHON_VERSION=3.12

# === Системни пакети ===
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build tools
    build-essential \
    cmake \
    pkg-config \
    # Security tools
    gnupg2 \
    pass \
    keepassxc-cli \
    age \
    # Database clients
    postgresql-client \
    redis-tools \
    # Network tools
    net-tools \
    iputils-ping \
    netcat-openbsd \
    # File tools
    tree \
    file \
    rsync \
    # Archive tools
    zip \
    unzip \
    p7zip-full \
    # Development tools
    vim \
    nano \
    htop \
    tmux \
    screen \
    # Git extras
    git-lfs \
    git-flow \
    # Crypto tools
    openssl \
    # Additional utilities
    jq \
    yq \
    httpie \
    && rm -rf /var/lib/apt/lists/*

# === Python dependencies за automation ===
RUN pip3 install --no-cache-dir \
    python-dotenv \
    requests \
    pyyaml \
    cryptography \
    pycryptodome \
    keyring \
    secretstorage

# === Node.js global packages ===
RUN npm install -g \
    # n8n workflow automation
    n8n \
    # Development tools
    nodemon \
    pm2 \
    # Testing
    jest \
    playwright \
    # Build tools
    webpack \
    vite \
    # Linting & Formatting
    eslint \
    prettier \
    # Type checking
    typescript \
    ts-node \
    # Database tools
    prisma \
    # API tools
    openapi-typescript \
    # Security
    snyk \
    # Utilities
    dotenv-cli \
    cross-env

# === Supabase CLI ===
RUN curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | \
    tar xz -C /usr/local/bin

# === GitHub CLI extensions ===
RUN gh extension install github/gh-copilot || true

# === Setup directories ===
RUN mkdir -p \
    /workspace/.secrets \
    /workspace/.cache \
    /workspace/.logs \
    /workspace/.keepass \
    && chown -R node:node /workspace

# === Setup node user environment ===
USER node
WORKDIR /workspace

# === Setup shell enhancements ===
RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && \
    echo 'alias ll="ls -alF"' >> ~/.bashrc && \
    echo 'alias la="ls -A"' >> ~/.bashrc && \
    echo 'alias l="ls -CF"' >> ~/.bashrc && \
    echo 'alias eva="cd /workspace/Wallestars/eva-core"' >> ~/.bashrc && \
    echo 'alias platforms="cd /workspace/Wallestars/platforms"' >> ~/.bashrc && \
    echo 'alias workflows="cd /workspace/Wallestars/workflows"' >> ~/.bashrc

# === Health check ===
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --version && npm --version || exit 1

# === Default command ===
CMD ["/bin/bash"]
