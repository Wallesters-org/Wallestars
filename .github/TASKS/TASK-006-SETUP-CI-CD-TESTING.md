# Task 006: Set Up CI/CD Testing Workflow

**Priority**: P1 (High)  
**Estimated Effort**: 1-2 hours  
**Assignee**: Claude Code / Cursor Agent  
**Language Preference**: 🇧🇬 Bulgarian (за по-добро разбиране и инструкции)

---

## Описание на задачата (Task Description)

Проектът има само deployment workflow, но няма CI/CD workflow за тестване на code changes.

**Current Status**: ❌ No CI/CD testing workflow

---

## Prerequisite

⚠️ **Важно**: Зависи от **TASK-001** (Add Testing Infrastructure).

---

## Цели (Objectives)

1. ✅ Създаване на GitHub Actions workflow за CI/CD
2. ✅ Автоматично изпълнение на тестове при PRs
3. ✅ Build verification
4. ✅ Security scanning

---

## Стъпки за изпълнение

Create `.github/workflows/ci.yml` with:
- Test execution job
- Build verification job
- Security audit job
- Dependency review (for PRs)

Add CI badges to README.md.

---

## Критерии за приемане (Acceptance Criteria)

- [ ] CI workflow created
- [ ] Tests run automatically
- [ ] Build verified
- [ ] Security audit runs
- [ ] CI badges added to README

---

## Related Issues

- Resolves: Missing CI/CD testing pipeline (from PR_REVIEW_FINDINGS.md)
- Depends on: TASK-001
