# Database

This directory contains database schemas, migrations, and related configurations.

## 📁 Structure

### `supabase/`

Supabase (PostgreSQL) database schemas and configurations.

**Files:**
- `schema.sql` - Main database schema
- `pr-agent-tracking-schema.sql` - PR agent tracking tables

## 🗄️ Database Setup

### Supabase

1. **Create Project** on [Supabase](https://supabase.com)

2. **Run Migrations**:
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or manually via SQL editor
   # Copy contents of schema files and execute
   ```

3. **Configure Environment**:
   ```env
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   ```

## 📊 Schema Overview

### Main Schema (`schema.sql`)

Core database tables for Wallestars application:
- User management
- Session tracking
- Configuration storage
- Activity logs

### PR Agent Tracking Schema (`pr-agent-tracking-schema.sql`)

Tables for tracking PR automation:
- `pr_sessions` - Track active PR sessions
- `agent_assignments` - Agent-to-PR mappings
- `automation_logs` - Workflow execution logs
- `merge_history` - PR merge tracking

## 🔄 Migrations

Future migrations should be added to `migrations/` directory:

```
database/
├── supabase/
│   ├── schema.sql
│   └── pr-agent-tracking-schema.sql
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_add_pr_tracking.sql
    └── ...
```

## 🔧 Database Management

### Backup

```bash
# Export schema
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# Or use Supabase dashboard
```

### Restore

```bash
# Import schema
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

## 📚 Related Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Project Architecture](../ARCHITECTURE.md)
