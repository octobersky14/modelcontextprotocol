#!/bin/bash

# Perplexity MCP Server Test Script
# This script tests all available endpoints and tools

API_URL="https://perplexity-ask-259175647845.us-central1.run.app"
TOOLS_ENDPOINT="$API_URL/api/tools/call"

echo "🧪 Perplexity MCP Server Test Suite"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
curl -s "$API_URL/" | head -1
echo ""
echo ""

# Test 2: List Tools
echo "2️⃣ Testing Tools List..."
curl -s -X POST "$TOOLS_ENDPOINT" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0", 
  "method": "tools/list", 
  "params": {}
}' | jq '.result.tools[].name' 2>/dev/null || echo "❌ Failed to list tools"
echo ""
echo ""

# Test 3: perplexity_ask
echo "3️⃣ Testing perplexity_ask..."
RESPONSE=$(curl -s -X POST "$TOOLS_ENDPOINT" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0", 
  "method": "tools/call", 
  "params": {
    "name": "perplexity_ask", 
    "arguments": {
      "messages": [
        {"role": "user", "content": "Say hello and tell me what you can do in one sentence."}
      ]
    }
  }
}')

if echo "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
    echo "❌ Error: $(echo "$RESPONSE" | jq -r '.error.message' 2>/dev/null || echo "Unknown error")"
else
    echo "✅ Success: $(echo "$RESPONSE" | jq -r '.result.content[0].text' 2>/dev/null | head -c 100)..."
fi
echo ""
echo ""

# Test 4: perplexity_research
echo "4️⃣ Testing perplexity_research..."
RESPONSE=$(curl -s -X POST "$TOOLS_ENDPOINT" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0", 
  "method": "tools/call", 
  "params": {
    "name": "perplexity_research", 
    "arguments": {
      "messages": [
        {"role": "user", "content": "What is the current population of Tokyo?"}
      ]
    }
  }
}')

if echo "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
    echo "❌ Error: $(echo "$RESPONSE" | jq -r '.error.message' 2>/dev/null || echo "Unknown error")"
else
    echo "✅ Success: $(echo "$RESPONSE" | jq -r '.result.content[0].text' 2>/dev/null | head -c 100)..."
fi
echo ""
echo ""

# Test 5: perplexity_reason
echo "5️⃣ Testing perplexity_reason..."
RESPONSE=$(curl -s -X POST "$TOOLS_ENDPOINT" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0", 
  "method": "tools/call", 
  "params": {
    "name": "perplexity_reason", 
    "arguments": {
      "messages": [
        {"role": "user", "content": "Why is the sky blue? Explain in simple terms."}
      ]
    }
  }
}')

if echo "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
    echo "❌ Error: $(echo "$RESPONSE" | jq -r '.error.message' 2>/dev/null || echo "Unknown error")"
else
    echo "✅ Success: $(echo "$RESPONSE" | jq -r '.result.content[0].text' 2>/dev/null | head -c 100)..."
fi
echo ""
echo ""

# Test 6: tool_code method (alternative)
echo "6️⃣ Testing tool_code method..."
RESPONSE=$(curl -s -X POST "$TOOLS_ENDPOINT" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0", 
  "method": "tool_code", 
  "params": {
    "name": "perplexity_ask", 
    "arguments": {
      "messages": [
        {"role": "user", "content": "What is 2+2?"}
      ]
    }
  }
}')

if echo "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
    echo "❌ Error: $(echo "$RESPONSE" | jq -r '.error.message' 2>/dev/null || echo "Unknown error")"
else
    echo "✅ Success: $(echo "$RESPONSE" | jq -r '.result.content[0].text' 2>/dev/null | head -c 100)..."
fi
echo ""
echo ""

echo "🎉 Test Suite Complete!"
echo ""
echo "📝 Notes:"
echo "- If you see 401 Unauthorized errors, set your API key:"
echo "  gcloud run services update perplexity-ask --region us-central1 --set-env-vars PERPLEXITY_API_KEY=your_api_key_here"
echo ""
echo "- For detailed responses, remove the 'head -c 100' from the script"
echo ""
echo "- To test locally, change API_URL to 'http://localhost:8080'" 