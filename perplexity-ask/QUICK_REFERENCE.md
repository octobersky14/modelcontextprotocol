# Perplexity MCP Server - Quick Reference

## 🚀 Quick Start

### Clone and Setup

```bash
git clone https://github.com/yourusername/modelcontextprotocol.git
cd modelcontextprotocol/perplexity-ask
npm install && npm run build
```

### Deploy

```bash
docker build --platform linux/amd64 -t gcr.io/drive-mcp-466117/perplexity-ask:latest .
docker push gcr.io/drive-mcp-466117/perplexity-ask:latest
gcloud run deploy perplexity-ask --image gcr.io/drive-mcp-466117/perplexity-ask:latest --platform managed --region us-central1 --allow-unauthenticated
```

### Set API Key

```bash
gcloud run services update perplexity-ask --region us-central1 --set-env-vars PERPLEXITY_API_KEY=your_api_key_here
```

## 📡 API Endpoints

**Base URL**: `https://perplexity-ask-259175647845.us-central1.run.app`

**Direct HTTP API**: `https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call`

### Health Check

```bash
curl https://perplexity-ask-259175647845.us-central1.run.app/
```

### List Tools

```bash
curl -X POST "https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call" \
-H "Content-Type: application/json" \
-d '{"jsonrpc": "2.0", "method": "tools/list", "params": {}}'
```

## 🛠️ Tool Examples

### 1. perplexity_ask (General Questions)

```bash
curl -X POST "https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "perplexity_ask",
    "arguments": {
      "messages": [
        {"role": "user", "content": "What is the weather like today?"}
      ]
    }
  }
}'
```

### 2. perplexity_research (Deep Research)

```bash
curl -X POST "https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "perplexity_research",
    "arguments": {
      "messages": [
        {"role": "user", "content": "Research the latest developments in renewable energy"}
      ]
    }
  }
}'
```

### 3. perplexity_reason (Reasoning)

```bash
curl -X POST "https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "perplexity_reason",
    "arguments": {
      "messages": [
        {"role": "user", "content": "Explain how blockchain technology works step by step"}
      ]
    }
  }
}'
```

## 🔧 Local Development

### Run Locally

```bash
# Clone the repository (if not already done)
git clone https://github.com/yourusername/modelcontextprotocol.git
cd modelcontextprotocol/perplexity-ask

export PERPLEXITY_API_KEY=your_api_key_here
npm install
npm run build
node dist/index.js
```

### Test Locally

```bash
curl -X POST "http://localhost:8080/api/tools/call" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "perplexity_ask",
    "arguments": {
      "messages": [
        {"role": "user", "content": "Hello world!"}
      ]
    }
  }
}'
```

## 🚨 Common Issues

| Issue                         | Solution                                       |
| ----------------------------- | ---------------------------------------------- |
| "Cannot POST /api/tools/call" | Rebuild and redeploy Docker image              |
| "401 Unauthorized"            | Set correct API key in Cloud Run               |
| "stream is not readable"      | Use `/api/tools/call` instead of `/messages`   |
| Docker build fails            | Use `--platform linux/amd64` flag              |
| "Bad request"                 | Ensure `Content-Type: application/json` header |

## 📋 Response Format

**Success**:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{ "type": "text", "text": "Response..." }],
    "isError": false
  },
  "id": null
}
```

**Error**:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32603,
    "message": "Error description..."
  },
  "id": null
}
```

## 🔄 Update Commands

```bash
# 1. Build
npm run build

# 2. Docker
docker build --platform linux/amd64 -t gcr.io/drive-mcp-466117/perplexity-ask:latest .
docker push gcr.io/drive-mcp-466117/perplexity-ask:latest

# 3. Deploy
gcloud run deploy perplexity-ask --image gcr.io/drive-mcp-466117/perplexity-ask:latest --platform managed --region us-central1 --allow-unauthenticated
```

## 🌐 Integration Examples

### Workflow Automation

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "perplexity_ask",
    "arguments": {
      "messages": [
        { "role": "user", "content": "{{$node.previous.json.message}}" }
      ]
    }
  }
}
```

### JavaScript

```javascript
const response = await fetch(
  "https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "perplexity_ask",
        arguments: {
          messages: [{ role: "user", content: "Hello!" }],
        },
      },
    }),
  }
);
```

## 🎯 Tool Descriptions

- **perplexity_ask**: General conversation and questions
- **perplexity_research**: Deep research with citations and sources
- **perplexity_reason**: Complex reasoning and step-by-step explanations

---

**Status**: ✅ Fixed and Deployed  
**Last Updated**: January 2025
