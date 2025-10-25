#!/bin/bash

# Test OAuth Endpoints for ChatGPT Compatibility
# Run this locally: chmod +x test-oauth-endpoints.sh && ./test-oauth-endpoints.sh
# Run with production URL: ./test-oauth-endpoints.sh https://spreadapi.io

BASE_URL="${1:-http://localhost:3000}"

echo "========================================="
echo "Testing OAuth Endpoints"
echo "Base URL: $BASE_URL"
echo "========================================="
echo ""

echo "1️⃣  Testing Protected Resource Metadata"
echo "URL: $BASE_URL/.well-known/oauth-protected-resource"
echo "-----------------------------------------"
curl -s "$BASE_URL/.well-known/oauth-protected-resource" | jq .
echo ""
echo ""

echo "2️⃣  Testing Authorization Server Metadata"
echo "URL: $BASE_URL/.well-known/oauth-authorization-server"
echo "-----------------------------------------"
curl -s "$BASE_URL/.well-known/oauth-authorization-server" | jq .
echo ""
echo ""

echo "3️⃣  Testing 401 WWW-Authenticate Challenge"
echo "URL: $BASE_URL/api/mcp"
echo "-----------------------------------------"
echo "HTTP Headers:"
curl -i -s "$BASE_URL/api/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' | head -20
echo ""
echo ""

echo "4️⃣  Testing Dynamic Client Registration"
echo "URL: $BASE_URL/oauth/register"
echo "-----------------------------------------"
curl -s -X POST "$BASE_URL/oauth/register" \
  -H "Content-Type: application/json" \
  -d '{"client_name":"Test Client","redirect_uris":["https://chatgpt.com/oauth/callback"]}' | jq .
echo ""
echo ""

echo "========================================="
echo "✅ Tests Complete!"
echo "========================================="
echo ""
echo "Copy the outputs above and share with ChatGPT for validation."
echo ""
echo "Key things ChatGPT will check:"
echo "  ✓ resource field matches MCP URL exactly"
echo "  ✓ issuer is set correctly"
echo "  ✓ code_challenge_methods_supported includes S256"
echo "  ✓ WWW-Authenticate header present in 401"
echo "  ✓ registration_endpoint available for DCR"
echo ""
