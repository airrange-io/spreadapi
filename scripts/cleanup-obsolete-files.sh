#!/bin/bash

echo "=== CLEANUP OBSOLETE FILES ==="
echo ""
echo "This script will remove temporary files that are no longer needed."
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Create backup directory just in case
mkdir -p .backup-before-cleanup

# 1. Remove temporary scripts
echo "Removing temporary scripts..."
if [ -f scripts/add-internal-links.js ]; then
  mv scripts/add-internal-links.js .backup-before-cleanup/
  echo "✓ Removed add-internal-links.js"
fi

if [ -f scripts/rename-translated-files.js ]; then
  mv scripts/rename-translated-files.js .backup-before-cleanup/
  echo "✓ Removed rename-translated-files.js"
fi

if [ -f scripts/typecheck.sh ]; then
  mv scripts/typecheck.sh .backup-before-cleanup/
  echo "✓ Removed typecheck.sh"
fi

# 2. Remove old content planning docs (now in CLAUDE.md or completed)
echo ""
echo "Removing old planning documents..."
for file in content/*.md; do
  if [ -f "$file" ]; then
    mv "$file" .backup-before-cleanup/
    echo "✓ Removed $(basename $file)"
  fi
done

# 3. Remove SEO docs (project complete)
echo ""
echo "Removing completed SEO documentation..."
if [ -d docs/seo ]; then
  mv docs/seo .backup-before-cleanup/
  echo "✓ Removed docs/seo directory"
fi

# 4. Remove LinkedIn marketing doc (if complete)
echo ""
echo "Removing marketing planning docs..."
if [ -f docs/linkedin-post-ideas-ai-confessions.md ]; then
  mv docs/linkedin-post-ideas-ai-confessions.md .backup-before-cleanup/
  echo "✓ Removed linkedin-post-ideas-ai-confessions.md"
fi

echo ""
echo "=== CLEANUP COMPLETE ==="
echo "Files have been moved to .backup-before-cleanup/ (not deleted)"
echo "You can safely delete .backup-before-cleanup/ after verifying everything works"
echo ""
echo "To permanently delete the backup:"
echo "rm -rf .backup-before-cleanup"