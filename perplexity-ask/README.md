# Perplexity MCP Server

A Model Context Protocol (MCP) server that integrates with the Perplexity AI API to provide real-time web search and AI-powered responses.

## �� Quick Start

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/modelcontextprotocol.git
   cd modelcontextprotocol/perplexity-ask
   ```

2. **Set your API key:**

   ```bash
   gcloud run services update perplexity-ask --region us-central1 --set-env-vars PERPLEXITY_API_KEY=your_api_key_here
   ```

3. **Test the server:**

   ```bash
   ./test_api.sh
   ```

4. **Use the API:**
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
           {"role": "user", "content": "Hello! How are you?"}
         ]
       }
     }
   }'
   ```

## 📚 Documentation

- **[Complete Guide](GUIDE.md)** - Comprehensive documentation with examples
- **[Quick Reference](QUICK_REFERENCE.md)** - Fast commands and examples
- **[Test Script](test_api.sh)** - Automated testing of all endpoints

## 🛠️ Available Tools

| Tool                  | Model               | Use Case                            |
| --------------------- | ------------------- | ----------------------------------- |
| `perplexity_ask`      | sonar-pro           | General questions and conversations |
| `perplexity_research` | sonar-deep-research | Deep research with citations        |
| `perplexity_reason`   | sonar-reasoning-pro | Complex reasoning tasks             |

## 🚨 Recent Fix

**Problem**: "stream is not readable" error when making direct HTTP requests  
**Solution**: Added `/api/tools/call` endpoint for direct HTTP API usage  
**Status**: ✅ Fixed and deployed

## 🔗 API Endpoints

- **Health Check**: `GET /`
- **Direct API**: `POST /api/tools/call`
- **SSE (MCP)**: `GET /sse` and `POST /messages`

## 🚀 Deployment

The server is deployed on Google Cloud Run at:

```
https://perplexity-ask-259175647845.us-central1.run.app
```

**Direct HTTP API Endpoint:**

```
https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call
```

## 📋 Requirements

- Node.js 18+
- Docker
- Google Cloud SDK
- Perplexity API key

## 🔧 Development

```bash
# Clone the repository (if not already done)
git clone https://github.com/yourusername/modelcontextprotocol.git
cd modelcontextprotocol/perplexity-ask

# Install dependencies
npm install

# Build the project
npm run build

# Run locally
export PERPLEXITY_API_KEY=your_api_key_here
node dist/index.js
```

## 🌐 Usage Examples

### List Available Tools

```bash
curl -X POST "https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call" \
-H "Content-Type: application/json" \
-d '{"jsonrpc": "2.0", "method": "tools/list", "params": {}}'
```

### Use perplexity_ask

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

### Use perplexity_research

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
        {"role": "user", "content": "Research the latest AI developments"}
      ]
    }
  }
}'
```

### Use perplexity_reason

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
        {"role": "user", "content": "Explain how quantum computing works step by step"}
      ]
    }
  }
}'
```

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Status**: ✅ Production Ready  
**Version**: 0.1.0  
**Last Updated**: January 2025
