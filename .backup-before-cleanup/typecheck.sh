#!/bin/bash

echo "Running TypeScript type check..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
  echo "✅ No TypeScript errors found!"
else
  echo "❌ TypeScript errors found. Please fix them before committing."
  exit 1
fi