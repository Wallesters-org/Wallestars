# Security Debt: Upgrade Vite to 7.x to Fix esbuild Vulnerability

## Issue Description

The current version of Vite (5.x) depends on esbuild <=0.24.2, which has a known moderate severity vulnerability:
- **CVE**: GHSA-67mh-4wv8-2f99
- **Issue**: esbuild enables any website to send requests to the development server and read responses
- **Severity**: Moderate

## Impact

This vulnerability affects:
- Development environments (local development server)
- Does NOT affect production builds

## Required Action

Upgrade Vite from 5.x to 7.x, which includes a fixed version of esbuild.

## Considerations

- **Breaking Changes**: Vite 7.x includes breaking changes from 5.x
- **Testing Required**: Full regression testing needed after upgrade
- **Documentation**: Update documentation for any API changes

## Recommendation

Schedule this upgrade for a dedicated PR focused on the Vite upgrade to:
1. Review Vite 7.x migration guide
2. Update configuration files
3. Test all features thoroughly
4. Update documentation

## References

- Tracked in: netlify.toml (lines 23-24)
- Related: npm audit report
- Priority: Medium (affects dev only, not production)

## Timeline

Suggested timeline: Next sprint/milestone after current testing infrastructure is stable.
