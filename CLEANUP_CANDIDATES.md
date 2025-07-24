# SpreadAPI Cleanup Candidates

This document lists all files, API routes, and code that can potentially be deleted from the SpreadAPI project. Items are categorized by type and include justification for deletion.

## ✅ COMPLETED ACTIONS
- **README.md** - Replaced with proper SpreadAPI documentation
- **Warming Service** - Repurposed `test1234_mdejqoua8ptor` as demo service for unauthenticated users

## API Routes (Can be deleted)

### Debug/Test Endpoints
1. **`/app/api/test/route.js`** - Simple test endpoint, no actual usage
2. **`/app/api/debug-cache/route.js`** - Debug endpoint, no usage found
3. **`/app/api/debug-service/route.js`** - Debug endpoint, no usage found
4. **`/app/api/performance-diagnostic/route.js`** - Diagnostic endpoint, no usage found
5. **`/app/api/timing-breakdown/route.js`** - Diagnostic endpoint, no usage found
6. **`/app/api/manageapi/route.js`** - Management endpoint, referenced in comments but not actually used

## React Components (Never imported/used)

1. **`/app/components/PWAInstallPrompt.tsx`** - PWA installation prompt, completely unused
2. **`/app/components/AreaParameterEditor.tsx`** - Complex form component, completely unused
3. **`/app/components/ServiceListWrapper.tsx`** - Unused wrapper around ServiceList
4. **`/app/components/ServiceListServer.tsx`** - Unused server component implementation
5. **`/app/components/UserStats.tsx`** - React component for user statistics display, never used

## Standalone Scripts (Root directory)

1. **`check-mcp-setup.js`** - MCP setup verification script
2. **`check-mcp.mjs`** - Another MCP checking script
3. **`check-service.js`** - Service checking utility
4. **`create-published.js`** - Script to create published services
5. **`create-test-token.js`** - Test token creation script
6. **`debug-mcp.js`** - MCP debugging utility
7. **`fix-service.js`** - Service fixing utility
8. **`suggested-publish-improvement.js`** - Contains improvement suggestions
9. **`test-add-fields.js`** - Test script for adding fields
10. **`test-redis-multi.js`** - Redis multi-command test script

## Scripts Directory

1. **`/scripts/cleanup-orphaned-data.js`** - Not referenced anywhere
2. **`/scripts/createTestUser.mjs`** - Not referenced anywhere

## Library Files (/lib)

### Unused Redis Implementations
1. **`/lib/redis-optimized.js`** - Only referenced by redis-upstash.js, not used in production
2. **`/lib/redis-upstash.js`** - Upstash Redis implementation, not used in production
3. **`/lib/redis-pooled.js`** - Pooled Redis client wrapper, not used in production

### Deprecated Versions
4. **`/lib/cellAreaHandlerV2.js`** - Enhanced version that's never imported (V1 is used)
5. **`/lib/cacheHelpers.ts`** - TypeScript duplicate of cacheHelpers.js (only .js version is used)

## Utility Files (/utils)

1. **`/utils/browserEnv.js`** - Not imported anywhere
2. **`/utils/debounce.ts`** - Duplicate of /app/utils/debounce.ts (app version is used)

## Documentation Files (Outdated/Completed)

1. **`GOOGLE_SEO_TODO.md`** - Completed TODO list
2. **`EDITABLE_AREAS_COMPLETE_IMPLEMENTATION.md`** - Implementation already completed
3. **`CELL_AREA_IMPLEMENTATION.md`** - Implementation already completed
4. **`EDITABLE_AREAS_UI_SECTION.md`** - Superseded by complete implementation
5. **`EDITABLE_AREA_PARAMETER_DESIGN.md`** - Design for already implemented feature
6. **`EDITABLE_AREA_UI_IMPLEMENTATION.md`** - Implementation already completed
7. **`README_EDITABLE_AREAS.md`** - Documentation for already implemented feature

## Files to Keep (Despite limited usage)

### API Routes
- **`/app/api/diagnose-cache/route.js`** - Used by cache diagnostics UI
- **`/app/api/warm/route.js`** - Used by Vercel cron job (runs every 4 minutes)
- **`/app/api/redis-pool-stats/route.js`** - Documented in Redis guides, useful for monitoring

### Scripts
- **`/scripts/verify-redis-pool.js`** - Referenced in documentation
- **`test-mcp-generic-tools.js`** - Referenced in MCP_GENERIC_TOOLS_MIGRATION.md

### Components
- **`ServiceListClient.tsx`** - Used by ServiceListServer.tsx (even though server component is unused)
- **`ServiceListSkeleton.tsx`** - Used by both wrapper and server components

## Summary Statistics

- **API Routes to delete**: 6
- **React Components to delete**: 5
- **Standalone scripts to delete**: 10
- **Scripts directory files to delete**: 2
- **Library files to delete**: 5
- **Utility files to delete**: 2
- **Documentation files to delete/archive**: 7

**Total files that can be deleted: 37**

## Recommendations

1. **Before deleting**: Create a backup branch with all these files in case any are needed later
2. **Consider archiving**: Move completed implementation docs to `/docs/archive/` instead of deleting
3. **Update imports**: After deletion, ensure no broken imports remain
4. **Update documentation**: Remove references to deleted endpoints from any remaining docs
5. **Clean package.json**: Remove any scripts that reference deleted files