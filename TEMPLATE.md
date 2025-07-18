# MCP Server Template

This template provides the structure and guidelines for adding new MCP servers to the `modelcontextprotocol` repository.

## 📁 Directory Structure

```
server-name/
├── README.md          # Overview and quick start
├── GUIDE.md           # Comprehensive documentation
├── QUICK_REFERENCE.md # Fast reference commands
├── test_api.sh        # Test script (make executable)
├── index.ts           # Main server code
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── Dockerfile         # Container config
├── dist/              # Compiled code (gitignored)
├── node_modules/      # Dependencies (gitignored)
└── assets/            # Images and resources (optional)
```

## 🚀 Quick Setup

### 1. Create Directory

```bash
# Clone the repository first
git clone https://github.com/yourusername/modelcontextprotocol.git
cd modelcontextprotocol

# Create your new server directory
mkdir my-new-server
cd my-new-server
```

### 2. Initialize Project

```bash
npm init -y
npm install @modelcontextprotocol/sdk express
npm install --save-dev typescript @types/node @types/express
```

### 3. Create Basic Files

#### package.json

```json
{
  "name": "my-new-server",
  "version": "0.1.0",
  "description": "MCP server for [service name]",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.1.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

#### Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:22-alpine AS release
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 8080
ENV NODE_ENV=production
ENTRYPOINT ["node", "dist/index.js"]
```

### 4. Create Server Code (index.ts)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";

// Define your tools
const MY_TOOL = {
  name: "my_tool",
  description: "Description of what this tool does",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: { type: "string" },
            content: { type: "string" },
          },
          required: ["role", "content"],
        },
      },
    },
    required: ["messages"],
  },
};

// Tool implementation
async function performMyTool(messages: any[]): Promise<string> {
  // Implement your tool logic here
  return "Tool response";
}

// MCP Server setup
const server = new Server(
  {
    name: "my-new-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [MY_TOOL],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "my_tool": {
      if (!Array.isArray(args.messages)) {
        throw new Error("Invalid arguments: 'messages' must be an array");
      }
      const result = await performMyTool(args.messages);
      return {
        content: [{ type: "text", text: result }],
        isError: false,
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Express server for HTTP API
const app = express();
app.use(express.json());

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok", server: "my-new-server" });
});

// Direct HTTP endpoint
app.post("/api/tools/call", async (req: Request, res: Response) => {
  try {
    const { jsonrpc, method, params } = req.body;

    if (jsonrpc !== "2.0") {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Invalid Request: jsonrpc must be '2.0'",
        },
        id: null,
      });
    }

    if (method === "tools/call" || method === "tool_code") {
      const { name, arguments: args } = params;

      if (!args) {
        return res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32602,
            message: "Invalid params: No arguments provided",
          },
          id: null,
        });
      }

      let result;
      switch (name) {
        case "my_tool": {
          if (!Array.isArray(args.messages)) {
            return res.status(400).json({
              jsonrpc: "2.0",
              error: {
                code: -32602,
                message:
                  "Invalid arguments for my_tool: 'messages' must be an array",
              },
              id: null,
            });
          }
          result = await performMyTool(args.messages);
          break;
        }
        default:
          return res.status(400).json({
            jsonrpc: "2.0",
            error: { code: -32601, message: `Method not found: ${name}` },
            id: null,
          });
      }

      return res.json({
        jsonrpc: "2.0",
        result: {
          content: [{ type: "text", text: result }],
          isError: false,
        },
        id: null,
      });
    } else if (method === "tools/list") {
      return res.json({
        jsonrpc: "2.0",
        result: { tools: [MY_TOOL] },
        id: null,
      });
    } else {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32601, message: `Method not found: ${method}` },
        id: null,
      });
    }
  } catch (error) {
    console.error("Error handling direct API request:", error);
    return res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: `Internal error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      id: null,
    });
  }
});

// Start servers
const port = process.env.PORT || 8080;

// Start HTTP server
app.listen(port, () => {
  console.log(`HTTP server running on port ${port}`);
});

// Start MCP server (for stdio transport)
if (process.argv.includes("--stdio")) {
  const transport = new StdioServerTransport();
  server.connect(transport);
  console.log("MCP server running with stdio transport");
}
```

### 5. Create Documentation Files

#### README.md

````markdown
# My New Server

A Model Context Protocol (MCP) server that integrates with [service name].

## 🎯 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/modelcontextprotocol.git
   cd modelcontextprotocol/my-new-server
   ```
````

2. **Set your API key:**

   ```bash
   gcloud run services update my-new-server --region us-central1 --set-env-vars API_KEY=your_api_key_here
   ```

3. **Test the server:**

   ```bash
   ./test_api.sh
   ```

4. **Use the API:**
   ```bash
   curl -X POST "https://my-new-server-xxxxx.us-central1.run.app/api/tools/call" \
   -H "Content-Type: application/json" \
   -d '{
     "jsonrpc": "2.0",
     "method": "tools/call",
     "params": {
       "name": "my_tool",
       "arguments": {
         "messages": [
           {"role": "user", "content": "Hello!"}
         ]
       }
     }
   }'
   ```

## 📚 Documentation

- **[Complete Guide](GUIDE.md)** - Comprehensive documentation
- **[Quick Reference](QUICK_REFERENCE.md)** - Fast commands
- **[Test Script](test_api.sh)** - Automated testing

## 🛠️ Available Tools

| Tool      | Description                        |
| --------- | ---------------------------------- |
| `my_tool` | Description of what this tool does |

## 🚀 Deployment

The server is deployed on Google Cloud Run at:

```
https://my-new-server-xxxxx.us-central1.run.app
```

## 📋 Requirements

- Node.js 18+
- Docker
- Google Cloud SDK
- [Service] API key

## 🔧 Development

```bash
# Clone the repository (if not already done)
git clone https://github.com/yourusername/modelcontextprotocol.git
cd modelcontextprotocol/my-new-server

# Install dependencies
npm install

# Build the project
npm run build

# Run locally
export API_KEY=your_api_key_here
node dist/index.js
```

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Status**: 🚧 In Development  
**Version**: 0.1.0  
**Last Updated**: [Date]

````

#### GUIDE.md
Create a comprehensive guide following the pattern from `perplexity-ask/GUIDE.md`

#### QUICK_REFERENCE.md
Create a quick reference following the pattern from `perplexity-ask/QUICK_REFERENCE.md`

#### test_api.sh
```bash
#!/bin/bash

# My New Server Test Script
API_URL="https://my-new-server-xxxxx.us-central1.run.app"
TOOLS_ENDPOINT="$API_URL/api/tools/call"

echo "🧪 My New Server Test Suite"
echo "=========================="
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

# Test 3: my_tool
echo "3️⃣ Testing my_tool..."
RESPONSE=$(curl -s -X POST "$TOOLS_ENDPOINT" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "my_tool",
    "arguments": {
      "messages": [
        {"role": "user", "content": "Test message"}
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
````

### 6. Update Main README

Add your server to the main `README.md`:

````markdown
### 🤖 [My New Server](./my-new-server/)

A server that integrates with [service name].

**Features:**

- [Feature 1]
- [Feature 2]
- [Feature 3]

**Quick Start:**

```bash
cd my-new-server
./test_api.sh
```
````

**API Endpoint:** `https://my-new-server-xxxxx.us-central1.run.app/api/tools/call`

**Status:** 🚧 In Development

````

## 🚀 Deployment Steps

1. **Build and deploy:**
   ```bash
   cd my-new-server
   npm install && npm run build
   docker build --platform linux/amd64 -t gcr.io/PROJECT_ID/my-new-server:latest .
   docker push gcr.io/PROJECT_ID/my-new-server:latest
   gcloud run deploy my-new-server --image gcr.io/PROJECT_ID/my-new-server:latest --platform managed --region us-central1 --allow-unauthenticated
````

2. **Set environment variables:**

   ```bash
   gcloud run services update my-new-server --region us-central1 --set-env-vars API_KEY=your_api_key_here
   ```

3. **Test deployment:**
   ```bash
   ./test_api.sh
   ```

## 📋 Checklist

- [ ] Create directory structure
- [ ] Initialize npm project
- [ ] Create TypeScript configuration
- [ ] Implement server code with both MCP and HTTP endpoints
- [ ] Create Dockerfile
- [ ] Write comprehensive documentation
- [ ] Create test script
- [ ] Deploy to Google Cloud Run
- [ ] Test all endpoints
- [ ] Update main README.md
- [ ] Make test script executable: `chmod +x test_api.sh`

## 🎯 Best Practices

1. **Always include both MCP and HTTP endpoints**
2. **Provide comprehensive error handling**
3. **Include health check endpoint**
4. **Use proper TypeScript types**
5. **Follow JSON-RPC 2.0 specification**
6. **Include detailed documentation**
7. **Provide test scripts**
8. **Use semantic versioning**
9. **Include proper logging**
10. **Handle environment variables securely**

---

**Template Version**: 1.0  
**Last Updated**: January 2025
