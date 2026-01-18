# 🚀 WALLESTARS v2.2 - QUICK START для Cline

## Копирай в Cline с тези файлове:
1. `WALLESTARS_CLINE_MASTER_PROMPT.md` (този документ)
2. `Claude_PRD_Prompt.pdf` (методология)
3. `YouTube_MacroVoice.json` (референтен workflow)

---

## 🎯 ЗАДАЧА

Създай n8n workflow система за **Wallestars v2.2** - Bulgarian business automation platform.

## 📐 АРХИТЕКТУРА
```
Claude 3.5 Sonnet ←→ Multi-Agent Orch. ←→ GitHub
                          ↓
       ┌──────────────────┼──────────────────┐
       ↓                  ↓                  ↓
  MCP Server      Quality Scoring    Knowledge Indexer
       ↓                  ↓                  ↓
  SMS Monitor     Email Monitor    Company Enrichment
       ↓                  ↓                  ↓
     Redis ←────→ n8n Orchestrator ←────→ Supabase
                          ↓
                   System Health
```

## 🔧 ENDPOINTS
- VPS: `srv1201204.hstgr.cloud`
- n8n: `https://n8n.srv1201204.hstgr.cloud`
- Supabase: `ansiaiuaygcfztabtknl`

## 📋 ПРИОРИТЕТ
1. **MCP Server** - Redis tool registry
2. **Quality Scoring** - AI response evaluation  
3. **Email Monitor** - Hostinger IMAP (993)
4. **SMS Monitor** - smstome.com scraping
5. **CompanyBook** - Bulgarian business API
6. **Knowledge Indexer** - GitHub → pgvector
7. **Multi-Agent** - Parallel AI sessions
8. **System Health** - Infrastructure monitoring

## 📁 OUTPUT
```
n8n_workflows/*.json
supabase/migrations/*.sql
scripts/import-workflows.sh
docs/ARCHITECTURE.md
```

## 🔑 KEY PATTERNS (от MacroVoice)
- Webhook trigger + callback
- Code nodes за transformation
- OpenAI за AI processing
- IF nodes за branching
- x-webhook-secret header

## ⚡ START
Създай `mcp-server.json` първо - той е основа за останалите.
