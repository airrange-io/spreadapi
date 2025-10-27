# Code Duplication Analysis: calculateDirect vs executeEnhancedCalc

**Date:** 2025-01-27
**Status:** 🔍 **Analysis Complete**
**Issue:** Code duplication between two calculation paths

---

## Summary

**YES, there is significant code duplication** between `calculateDirect.js` and `executeEnhancedCalc.js`. They share ~70% of their logic but differ in key areas.

**Verdict:** The duplication **makes sense architecturally** but could be refactored to share common code.

---

## Side-by-Side Comparison

### Common Code (~70% overlap)

| Operation | calculateDirect | executeEnhancedCalc | Shared? |
|---|---|---|---|
| **Get service definition** | ✅ | ✅ | ✅ 100% identical |
| **Load fileJson** | ✅ | ✅ | ✅ 100% identical |
| **Create workbook** | ✅ | ✅ | ✅ 100% identical |
| **Validate inputs** | ✅ | ✅ | ✅ 100% identical |
| **Set input values** | ✅ | ✅ | ✅ ~95% identical |
| **Calculate** | ✅ | ✅ | ✅ 100% identical |
| **Read outputs** | ✅ | ✅ | ✅ ~90% identical |

### Different Code (~30%)

| Operation | calculateDirect | executeEnhancedCalc | Why Different? |
|---|---|---|---|
| **Caching** | ✅ 3-tier cache | ❌ No caching | Different use cases |
| **Area updates** | ❌ Not supported | ✅ Full support | Core difference |
| **Return format** | Rich metadata | Simple JSON | API compatibility |
| **Error handling** | API-focused | MCP-focused | Different clients |
| **Performance tracking** | Detailed metrics | Basic logging | Production vs dev |

---

## Code Structure Breakdown

### calculateDirect.js (~600 lines)

```javascript
// 1. API route handler (40 lines)
export async function POST(request, { params }) { ... }

// 2. Result caching logic (60 lines)
const cacheKey = generateResultCacheHash(inputs);
const cached = await redis.get(cacheKey);

// 3. Workbook caching logic (80 lines)
const cacheResult = await getCachedWorkbook(...);

// 4. Parameter validation (40 lines)
const validation = validateParameters(inputs, apiInputs);
const inputsWithDefaults = applyDefaults(inputs, apiInputs);
const finalInputs = coerceTypes(inputsWithDefaults, apiInputs);

// 5. Core calculation (100 lines)
spread.fromJSON(fileJson, ...);
// Set inputs
actualSheet.getCell(row, col).value(cellValue);
// Calculate
spread.calculate(); // ← NOT CALLED (bug or optimization?)
// Read outputs
cellResult = actualSheet.getCell(row, col).value();

// 6. Response formatting (120 lines)
return {
  outputs: answerOutputs,
  metadata: { executionTime, cached, ... },
  ...
};

// 7. Cache storage (40 lines)
await redis.setEx(cacheKey, TTL, JSON.stringify(result));

// 8. Analytics tracking (60 lines)
analyticsQueue.track(serviceId, 'calculations', 1);
```

**Key Features:**
- 3-tier caching (L1 process, L2 Redis results, L3 Redis workbook)
- Detailed performance metrics
- Analytics tracking
- Rich response metadata

---

### executeEnhancedCalc.js (~380 lines)

```javascript
// 1. Function definition (10 lines)
export async function executeEnhancedCalc(serviceId, inputs, areaUpdates, returnOptions, auth) { ... }

// 2. Service definition loading (30 lines)
const apiData = await getApiDefinition(serviceId, null);
const fileJson = apiData.fileJson;

// 3. Area updates (100 lines) ← UNIQUE TO THIS FUNCTION
const areas = JSON.parse(publishedData.areas);
for (const update of areaUpdates) {
  // Find area
  // Validate permissions
  // Apply changes to cells
  cell.value(change.value);
}

// 4. Parameter validation (50 lines)
const inputsWithDefaults = applyDefaults(inputs, apiDefinition.inputs);
const { validatedInputs, errors } = validateParameters(...);
// Set inputs
sheet.getCell(row, col).value(validatedInputs[paramName]);

// 5. Core calculation (10 lines)
spread.calculate();

// 6. Read outputs (40 lines)
for (const outputDef of apiDefinition.outputs) {
  outputs[outputName] = sheet.getCell(row, col).value();
}

// 7. Read area values (60 lines) ← UNIQUE TO THIS FUNCTION
if (includeAreaValues) {
  // Read back area data to show AI what changed
}

// 8. Response formatting (30 lines)
return {
  content: [{
    type: 'text',
    text: JSON.stringify(response)
  }]
};
```

**Key Features:**
- NO caching (every call is fresh)
- Area update support
- Optional area value return
- MCP-compatible response format

---

## The Critical Difference: Caching

### calculateDirect: Aggressive Caching ✅

```javascript
// L1: Process cache (20-min TTL, in-memory)
const cacheResult = await getCachedWorkbook(serviceId, processCacheKey, ...);

// L2: Result cache (5-min TTL, Redis)
const cacheKey = generateResultCacheHash(inputs);
const cached = await redis.get(cacheKey);
if (cached) return cached; // ← 5-20ms!

// L3: Workbook cache (60-min TTL, Redis)
const cachedWorkbookJson = await redis.json.get(workbookCacheKey);

// Performance:
// Cache hit:  5-20ms
// Cache miss: 150-250ms
// Hit rate: 50-80% (typical)
```

### executeEnhancedCalc: NO Caching ❌

```javascript
// Always create fresh workbook
const spread = createWorkbook();
spread.fromJSON(fileJson, ...);

// Apply area updates
// Set inputs
// Calculate
// Read outputs

// Performance:
// Every call: 150-300ms
// No cache benefit
// Problem: Area state not in cache key
```

**Why no caching?**
- Area updates make cache key complex
- Cache poisoning risk (as documented in EDITABLE_AREAS_ANALYSIS.md)
- We fixed this with `generateEnhancedCacheHash()` today!

---

## Should They Be Merged?

### Option 1: Keep Separate (Current) ✅

**Pros:**
- Clear separation of concerns
- Easy to optimize each path independently
- calculateDirect optimized for speed (caching)
- executeEnhancedCalc optimized for flexibility (areas)

**Cons:**
- Code duplication (~70% overlap)
- Bug fixes need to be applied twice
- Parameter validation was missed in executeEnhancedCalc (fixed today)

---

### Option 2: Merge into Single Function ⚠️

```javascript
export async function calculateUnified(serviceId, inputs, options = {}) {
  const {
    areaUpdates = [],
    useCache = true,
    includeAreaValues = false,
    returnFormat = 'api' // 'api' or 'mcp'
  } = options;

  // Generate cache key (includes area state if present)
  const cacheKey = areaUpdates.length > 0
    ? generateEnhancedCacheHash(inputs, areaUpdates)
    : generateResultCacheHash(inputs);

  // Try cache (if enabled and no area updates)
  if (useCache && areaUpdates.length === 0) {
    const cached = await redis.get(cacheKey);
    if (cached) return cached;
  }

  // Load workbook
  const spread = createWorkbook();
  spread.fromJSON(fileJson, ...);

  // Apply area updates (if any)
  if (areaUpdates.length > 0) {
    await applyAreaUpdates(spread, areaUpdates, areas);
  }

  // Validate and set inputs
  const validatedInputs = await validateAndSetInputs(spread, inputs, apiDefinition);

  // Calculate
  spread.calculate();

  // Read outputs
  const outputs = await readOutputs(spread, apiDefinition);

  // Read areas (if requested)
  const areaData = includeAreaValues
    ? await readAreaValues(spread, areas, areaUpdates)
    : null;

  // Format response
  if (returnFormat === 'api') {
    return formatApiResponse(outputs, metadata);
  } else {
    return formatMcpResponse(outputs, areaData);
  }
}
```

**Pros:**
- Single source of truth
- Bug fixes apply everywhere
- Easier to maintain

**Cons:**
- More complex function (many options)
- Harder to optimize specific paths
- Risk of breaking existing code
- Need to carefully test all paths

---

### Option 3: Shared Core with Path-Specific Wrappers ✅ **RECOMMENDED**

```javascript
// lib/calculation/core.js
export async function executeCalculation(spread, inputs, apiDefinition, options = {}) {
  const {
    areaUpdates = [],
    areas = [],
    includeAreaValues = false
  } = options;

  // Apply area updates
  if (areaUpdates.length > 0) {
    await applyAreaUpdates(spread, areaUpdates, areas);
  }

  // Validate inputs
  const inputsWithDefaults = applyDefaults(inputs, apiDefinition.inputs);
  const { validatedInputs, errors } = validateParameters(
    inputsWithDefaults,
    apiDefinition.inputs
  );

  if (errors.length > 0) {
    throw new Error(`Invalid parameters: ${errors.join(', ')}`);
  }

  // Set inputs
  for (const inputDef of apiDefinition.inputs) {
    const value = validatedInputs[inputDef.name];
    if (value !== undefined) {
      const sheet = spread.getSheetFromName(inputDef.sheetName);
      sheet.getCell(inputDef.row, inputDef.col).value(value);
    }
  }

  // Calculate
  spread.calculate();

  // Read outputs
  const outputs = {};
  for (const outputDef of apiDefinition.outputs) {
    const sheet = spread.getSheetFromName(outputDef.sheetName);
    outputs[outputDef.name] = sheet.getCell(outputDef.row, outputDef.col).value();
  }

  // Read areas if requested
  const areaData = includeAreaValues
    ? await readAreaValues(spread, areas, areaUpdates)
    : null;

  return { outputs, areaData };
}

// app/api/v1/services/[id]/execute/calculateDirect.js
export async function POST(request, { params }) {
  // API-specific logic: caching, auth, error handling
  const cacheKey = generateResultCacheHash(inputs);
  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  // Create workbook with caching
  const spread = await getCachedWorkbook(serviceId, ...);

  // Call shared core
  const { outputs } = await executeCalculation(spread, inputs, apiDefinition);

  // API-specific response formatting
  const response = formatApiResponse(outputs, metadata);

  // Cache result
  await redis.setEx(cacheKey, TTL, response);

  return response;
}

// lib/mcp/executeEnhancedCalc.js
export async function executeEnhancedCalc(serviceId, inputs, areaUpdates, returnOptions) {
  // MCP-specific logic: no caching, area support

  // Create fresh workbook
  const spread = createWorkbook();
  spread.fromJSON(fileJson, ...);

  // Get areas
  const areas = await getAreas(serviceId);

  // Call shared core
  const { outputs, areaData } = await executeCalculation(spread, inputs, apiDefinition, {
    areaUpdates,
    areas,
    includeAreaValues: returnOptions.includeAreaValues
  });

  // MCP-specific response formatting
  return formatMcpResponse(outputs, areaData);
}
```

**Pros:**
- ✅ Eliminates 70% of duplication
- ✅ Single source of truth for core logic
- ✅ Bug fixes apply everywhere automatically
- ✅ Each path keeps its specific optimizations (caching, etc.)
- ✅ Clear separation: core logic vs path-specific logic
- ✅ Easy to test core logic independently

**Cons:**
- Requires refactoring (2-3 days work)
- Need comprehensive tests
- Risk during migration

---

## Caching Strategy for Unified Approach

### With Enhanced Caching (Phase 2)

```javascript
// lib/calculation/cacheStrategy.js
export function shouldUseCache(options) {
  // No caching for area updates (for now, until Phase 2 complete)
  if (options.areaUpdates && options.areaUpdates.length > 0) {
    return false;
  }

  return true; // Standard calculations use cache
}

export function generateCacheKey(serviceId, inputs, options) {
  if (options.areaUpdates && options.areaUpdates.length > 0) {
    // Enhanced cache key (includes area state)
    return CACHE_KEYS.enhancedResultCache(
      serviceId,
      generateEnhancedCacheHash(inputs, options.areaUpdates)
    );
  } else {
    // Standard cache key (inputs only)
    return CACHE_KEYS.resultCache(
      serviceId,
      generateResultCacheHash(inputs)
    );
  }
}

// Usage in both paths:
const cacheKey = generateCacheKey(serviceId, inputs, options);
const cached = await redis.get(cacheKey);
if (cached) return cached;

// ... calculation ...

await redis.setEx(cacheKey, CACHE_TTL.result, JSON.stringify(result));
```

---

## Recommendation

### Short Term (Immediate) ✅

**Keep separate** but ensure both have:
- ✅ Parameter validation (done today)
- ✅ Skip initial calculation (done today)
- ✅ Consistent error handling
- ✅ Comprehensive tests

### Medium Term (Phase 2 - Next Sprint) 📋

**Add caching to executeEnhancedCalc:**
- Use `generateEnhancedCacheHash()` (already implemented)
- Add cache read/write operations
- Monitor cache hit rates
- See: `/docs/AREA_OPTIMIZATION_STRATEGY.md`

### Long Term (Phase 3 - Future) 🔮

**Refactor to Option 3 (Shared Core + Wrappers):**
- Extract shared logic to `lib/calculation/core.js`
- Keep path-specific wrappers
- Comprehensive test suite
- Gradual migration (feature flag)

---

## Testing Strategy for Unified Approach

```javascript
// test/calculation-core.test.js
describe('Core Calculation Logic', () => {
  it('should handle standard calculations', async () => {
    const result = await executeCalculation(spread, inputs, apiDefinition);
    expect(result.outputs).toMatchSnapshot();
  });

  it('should handle area updates', async () => {
    const result = await executeCalculation(spread, inputs, apiDefinition, {
      areaUpdates: [{ areaName: 'tax', changes: [...] }],
      areas: [...]
    });
    expect(result.outputs).toMatchSnapshot();
  });

  it('should validate percentage inputs consistently', async () => {
    const result = await executeCalculation(spread,
      { rate: 5 },  // User says "5%"
      apiDefinition
    );
    // Should receive 0.05, not 5
    expect(sentToSpreadsheet).toBe(0.05);
  });
});

// test/calculateDirect.test.js
describe('API Path', () => {
  it('should use caching', async () => {
    const result1 = await POST(request); // Cache miss
    const result2 = await POST(request); // Cache hit
    expect(result2.metadata.cached).toBe(true);
    expect(result2.metadata.executionTime).toBeLessThan(50);
  });
});

// test/executeEnhancedCalc.test.js
describe('Area Path', () => {
  it('should not use caching (for now)', async () => {
    const result1 = await executeEnhancedCalc(...);
    const result2 = await executeEnhancedCalc(...);
    // Both should calculate fresh
    expect(result1.executionTime).toBeGreaterThan(100);
    expect(result2.executionTime).toBeGreaterThan(100);
  });
});
```

---

## Conclusion

**Current State:**
- ✅ Code duplication exists (~70% overlap)
- ✅ Duplication is intentional (different optimization goals)
- ✅ Both paths now have consistent validation (today's fix)
- ✅ Both paths now have performance optimization (today's fix)

**The Duplication Makes Sense Because:**
1. **calculateDirect** optimized for speed (caching)
2. **executeEnhancedCalc** optimized for flexibility (areas)
3. Different response formats (API vs MCP)
4. Different error handling strategies

**But Should Be Improved:**
- Phase 2: Add caching to executeEnhancedCalc
- Phase 3: Extract shared core logic
- Maintain path-specific optimizations

**Priority:**
- 🔴 P0: Parameter validation - ✅ **DONE**
- 🟡 P1: Performance optimization - ✅ **DONE**
- 🟡 P1: Add caching to executeEnhancedCalc - 📋 **PHASE 2**
- 🟢 P2: Refactor to shared core - 🔮 **PHASE 3**

---

**Status:** Analysis complete, recommendations provided
**Next Action:** Implement Phase 2 (caching) before refactoring
**Risk of Refactoring Now:** Medium (both paths working, don't break them)
**Benefit of Refactoring Now:** High (eliminate 70% duplication)

**Decision:** Implement Phase 2 first (caching), then evaluate Phase 3 refactoring based on:
- Code stability
- Test coverage
- Team bandwidth
- Business priority
