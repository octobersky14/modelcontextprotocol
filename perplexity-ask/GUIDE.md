# Perplexity MCP Server - Complete Guide

## 🎯 Overview

This is a Model Context Protocol (MCP) server that integrates with the Perplexity AI API to provide real-time web search and AI-powered responses. The server supports both SSE (Server-Sent Events) transport for MCP clients and direct HTTP API endpoints for general use.

## 🚨 Recent Fix: "Stream is not readable" Error

### Problem

The original server was designed to work only with SSE transport, which required:

1. Establishing an SSE connection at `/sse`
2. Using that connection's sessionId to make POST requests to `/messages`

When making direct HTTP POST requests to `/messages` without an established SSE connection, the server would throw a "stream is not readable" error.

### Solution

Added a new direct HTTP endpoint `/api/tools/call` that handles tool calls without requiring an SSE connection. This endpoint:

- Accepts direct HTTP POST requests with JSON-RPC 2.0 format
- Supports both `tools/call` and `tool_code` methods
- Handles all three Perplexity tools
- Provides proper error handling with JSON-RPC error codes
- Supports `tools/list` for listing available tools

## 🛠️ Architecture

### Available Tools

1. **`perplexity_ask`** - General conversation using Sonar API

   - Model: `sonar-pro`
   - Use case: General questions and conversations

2. **`perplexity_research`** - Deep research with citations

   - Model: `sonar-deep-research`
   - Use case: Comprehensive research with sources

3. **`perplexity_reason`** - Reasoning tasks
   - Model: `sonar-reasoning-pro`
   - Use case: Complex reasoning and step-by-step explanations

### Endpoints

#### SSE Endpoints (for MCP clients)

- `GET /sse` - Establish SSE connection
- `POST /messages?sessionId=<id>` - Send messages via SSE transport

#### Direct HTTP Endpoints (for general API use)

- `POST /api/tools/call` - Direct tool calls without SSE
- `GET /` - Health check

## 🚀 Deployment

### Prerequisites

- Google Cloud SDK installed and configured
- Docker installed and running
- Perplexity API key

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/modelcontextprotocol.git
cd modelcontextprotocol/perplexity-ask

# Install dependencies
npm install
```

### Step 2: Build the Project

```bash
npm run build
```

### Step 3: Build Docker Image

```bash
# Build for Cloud Run (linux/amd64 platform)
docker build --platform linux/amd64 -t gcr.io/drive-mcp-466117/perplexity-ask:latest .
```

### Step 4: Push to Google Container Registry

```bash
# Authenticate Docker with Google Cloud
gcloud auth configure-docker

# Push the image
docker push gcr.io/drive-mcp-466117/perplexity-ask:latest
```

### Step 5: Deploy to Cloud Run

```bash
# Deploy the service
gcloud run deploy perplexity-ask \
  --image gcr.io/drive-mcp-466117/perplexity-ask:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Set the API key
gcloud run services update perplexity-ask \
  --region us-central1 \
  --set-env-vars PERPLEXITY_API_KEY=your_actual_api_key_here
```

## 📡 API Usage

### Base URL

```
https://perplexity-ask-259175647845.us-central1.run.app
```

### Direct HTTP API Endpoint

```
https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call
```

### 1. Basic Question with perplexity_ask

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
        {"role": "user", "content": "What is the latest news about AI developments?"}
      ]
    }
  }
}'
```

### 2. Deep Research with perplexity_research

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
        {"role": "user", "content": "Research the impact of climate change on coral reefs in the last 5 years"}
      ]
    }
  }
}'
```

### 3. Reasoning Task with perplexity_reason

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
        {"role": "user", "content": "Explain step by step how quantum computers work"}
      ]
    }
  }
}'
```

### 4. List Available Tools

```bash
curl -X POST "https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "params": {}
}'
```

### 5. Multi-turn Conversation

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
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is machine learning?"},
        {"role": "assistant", "content": "Machine learning is a subset of AI..."},
        {"role": "user", "content": "Can you give me examples?"}
      ]
    }
  }
}'
```

### 6. Alternative Method Name (tool_code)

```bash
curl -X POST "https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0",
  "method": "tool_code",
  "params": {
    "name": "perplexity_ask",
    "arguments": {
      "messages": [
        {"role": "user", "content": "What are the best programming languages to learn in 2024?"}
      ]
    }
  }
}'
```

## 🧪 Testing

### Health Check

```bash
curl https://perplexity-ask-259175647845.us-central1.run.app/
```

### Test Script

The repository includes a test script. After cloning:

```bash
# Make the test script executable
chmod +x test_api.sh

# Run the tests
./test_api.sh
```

## 🔧 Local Development

### Running Locally

```bash
# Clone the repository (if not already done)
git clone https://github.com/yourusername/modelcontextprotocol.git
cd modelcontextprotocol/perplexity-ask

# Set your API key
export PERPLEXITY_API_KEY=your_api_key_here

# Build and run
npm install
npm run build
node dist/index.js
```

### Testing Locally

```bash
# Test the new endpoint
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

## 📋 Response Format

### Success Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Response from Perplexity API..."
      }
    ],
    "isError": false
  },
  "id": null
}
```

### Error Response

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

## 🚨 Common Issues

### 1. "Cannot POST /api/tools/call"

- **Cause**: Server not deployed or old version deployed
- **Solution**: Rebuild and redeploy the Docker image

### 2. "401 Unauthorized"

- **Cause**: Invalid or missing Perplexity API key
- **Solution**: Set the correct API key in Cloud Run environment variables

### 3. "stream is not readable"

- **Cause**: Using old `/messages` endpoint without SSE connection
- **Solution**: Use the new `/api/tools/call` endpoint instead

### 4. Docker build fails

- **Cause**: Docker not running or platform issues
- **Solution**: Start Docker and use `--platform linux/amd64` flag

### 5. "Bad request" in HTTP clients

- **Cause**: Missing headers or incorrect body format
- **Solution**: Ensure `Content-Type: application/json` header and proper JSON-RPC format

## 🔄 Update Process

When making changes to the code:

1. **Update the code** in `index.ts`
2. **Build the project**: `npm run build`
3. **Build Docker image**: `docker build --platform linux/amd64 -t gcr.io/drive-mcp-466117/perplexity-ask:latest .`
4. **Push to registry**: `docker push gcr.io/drive-mcp-466117/perplexity-ask:latest`
5. **Deploy to Cloud Run**: `gcloud run deploy perplexity-ask --image gcr.io/drive-mcp-466117/perplexity-ask:latest --platform managed --region us-central1 --allow-unauthenticated`

## 🌐 Integration Examples

### Workflow Automation (n8n, Zapier, etc.)

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

### JavaScript/Node.js

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

### Python

```python
import requests

response = requests.post(
    'https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call',
    headers={'Content-Type': 'application/json'},
    json={
        'jsonrpc': '2.0',
        'method': 'tools/call',
        'params': {
            'name': 'perplexity_ask',
            'arguments': {
                'messages': [{'role': 'user', 'content': 'Hello!'}]
            }
        }
    }
)
```

## 📚 Additional Resources

- [Perplexity API Documentation](https://docs.perplexity.ai/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Support

If you encounter issues:

1. Check the common issues section above
2. Verify your API key is correct
3. Ensure the server is properly deployed
4. Check Cloud Run logs: `gcloud logs read --service=perplexity-ask --limit=50`

---

**Last Updated**: January 2025  
**Version**: 0.1.0  
**Status**: ✅ Fixed and Deployed
