#!/bin/bash

echo "Testing SpreadAPI Migration Redirects..."
echo "========================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Test function
test_redirect() {
    local from=$1
    local to=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" -L --max-redirs 0 "$BASE_URL$from")
    code=$(echo $response | cut -d' ' -f1)
    location=$(echo $response | cut -d' ' -f2)
    
    if [ "$code" = "301" ] || [ "$code" = "308" ]; then
        if [[ "$location" == *"$to"* ]]; then
            echo -e "${GREEN}✓${NC} $from → $to"
        else
            echo -e "${RED}✗${NC} $from → $location (expected $to)"
        fi
    else
        echo -e "${RED}✗${NC} $from - No redirect (HTTP $code)"
    fi
}

echo ""
echo "Testing Marketing Redirects:"
echo "----------------------------"
test_redirect "/product" "/"
test_redirect "/product/how-excel-api-works" "/how-excel-api-works"
test_redirect "/product/excel-ai-integration" "/excel-ai-integration"
test_redirect "/product/why-ai-fails-at-math" "/why-ai-fails-at-math"

echo ""
echo "Testing App Redirects:"
echo "----------------------"
test_redirect "/service/demo" "/app/service/demo"
test_redirect "/service/test123" "/app/service/test123"
test_redirect "/profile" "/app/profile"

echo ""
echo "Testing Direct Access:"
echo "----------------------"
# These should return 200 (or 401 for protected routes)
curl -s -o /dev/null -w "/ (marketing): %{http_code}\n" "$BASE_URL/"
curl -s -o /dev/null -w "/app (dashboard): %{http_code}\n" "$BASE_URL/app"
curl -s -o /dev/null -w "/how-excel-api-works: %{http_code}\n" "$BASE_URL/how-excel-api-works"
curl -s -o /dev/null -w "/api/health: %{http_code}\n" "$BASE_URL/api/health"

echo ""
echo "========================================"
echo "Migration test complete!"