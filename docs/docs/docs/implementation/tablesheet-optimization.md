# TableSheet Save Performance Optimization

## Issue
Saving workbooks with TableSheets takes 3-4 seconds, suggesting that the entire dataset is being serialized into the SJS file rather than just the TableSheet configuration and data source URLs.

## Diagnostic Logging Added
1. **Save timing measurement** - Tracks how long the save operation takes
2. **Blob size reporting** - Shows the size of the saved workbook
3. **TableSheet detection** - Identifies if the workbook contains TableSheets
4. **Upload timing** - Measures the time to upload the blob to the server

## Optimization Strategies Implemented

### 1. Optimized Save Options
When TableSheets are detected, the save uses these options:
```javascript
{
  includeStyles: true,
  includeFormulas: true,
  includeUnusedNames: false,
  saveAsView: false,
  includeBindingSource: false,
  includeData: false,  // Exclude TableSheet data
  fullRecalc: false    // Skip recalculation
}
```

### 2. Alternative Save Method
Added `saveWorkbookStructureOnly()` method that:
- Extracts workbook JSON
- Removes TableSheet data while preserving configuration
- Saves only the structure

## Root Cause Analysis
TableSheets in SpreadJS can work in two modes:
1. **Remote Data Mode** - Data is fetched from URLs dynamically
2. **Local Data Mode** - Data is embedded in the workbook

The slow save performance suggests your TableSheets are operating in local data mode, where the entire dataset is being embedded in the SJS file.

## Recommendations

### 1. Use Remote Data Sources
Configure TableSheets to fetch data from URLs instead of embedding:
```javascript
// Instead of embedding data
tableSheet.setDataSource(largeDataArray);

// Use remote data
tableSheet.options.remote = {
  read: {
    url: "/api/data/source"
  }
};
```

### 2. Implement Lazy Loading
Only load TableSheet data when the sheet is activated:
```javascript
spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, (e, info) => {
  const sheet = info.newSheet;
  if (sheet.getDataView && !sheet.dataLoaded) {
    // Load data only when sheet becomes active
    loadTableSheetData(sheet);
  }
});
```

### 3. Use Data Virtualization
For large datasets, implement data virtualization to load only visible rows:
```javascript
tableSheet.options.viewport = {
  rowCount: 50,  // Load only 50 rows at a time
  pageSize: 50
};
```

### 4. Separate Data Storage
Store TableSheet data separately from the workbook:
- Save workbook structure in SJS format
- Save TableSheet data in a separate JSON file or database
- Reconnect data sources when loading the workbook

## Monitoring
With the diagnostic logging in place, you can now:
1. Monitor save operation duration
2. Track blob sizes to identify large workbooks
3. Identify which workbooks contain TableSheets
4. Compare performance before and after optimizations

## Next Steps
1. Review your TableSheet configuration to identify if data is embedded
2. Consider migrating to remote data sources for large datasets
3. Implement data pagination for better performance
4. Test the `saveWorkbookStructureOnly()` method for specific use cases