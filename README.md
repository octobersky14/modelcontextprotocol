# Model Context Protocol (MCP) Servers Collection

A collection of Model Context Protocol (MCP) servers for various AI services and tools. Each server is contained in its own directory with complete documentation and deployment instructions.

## 🎯 Overview

This repository contains multiple MCP servers that can be used with Claude Desktop, Cursor, and other MCP-compatible applications. Each server is self-contained with its own documentation, deployment scripts, and configuration.

## 📚 Available Servers

### 🤖 [Perplexity Ask MCP Server](./perplexity-ask/)

A server that integrates with the Perplexity AI API to provide real-time web search and AI-powered responses.

**Features:**

- Real-time web search using Perplexity's Sonar API
- Three specialized tools: general questions, deep research, and reasoning
- Direct HTTP API endpoints for easy integration
- Full documentation and test scripts
- Fixed "stream is not readable" error with new `/api/tools/call` endpoint

**Quick Start:**

```bash
cd perplexity-ask
./test_api.sh
```

**API Endpoint:** `https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call`

**Status:** ✅ Production Ready

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker
- Google Cloud SDK (for deployment)
- API keys for the services you want to use

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/modelcontextprotocol.git
   cd modelcontextprotocol
   ```

2. **Choose a server:**

   ```bash
   cd <server-name>
   # e.g., cd perplexity-ask
   ```

3. **Follow the server-specific instructions:**
   - Each server has its own `README.md` with detailed setup instructions
   - Check the `GUIDE.md` for comprehensive documentation
   - Use the `test_api.sh` script to verify everything works

## 🛠️ Server Development

### Adding a New Server

1. **Create a new directory:**

   ```bash
   mkdir my-new-server
   cd my-new-server
   ```

2. **Initialize the project:**

   ```bash
   npm init
   npm install @modelcontextprotocol/sdk
   ```

3. **Create the server files:**

   - `index.ts` - Main server implementation
   - `README.md` - Overview and quick start
   - `GUIDE.md` - Comprehensive documentation
   - `test_api.sh` - Test script
   - `Dockerfile` - Container configuration

4. **Add to this README:**
   - Update the "Available Servers" section
   - Include a brief description and status

### Server Structure

Each server should follow this structure:

```
server-name/
├── README.md          # Overview and quick start
├── GUIDE.md           # Comprehensive documentation
├── QUICK_REFERENCE.md # Fast reference commands
├── test_api.sh        # Test script
├── index.ts           # Main server code
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── Dockerfile         # Container config
├── dist/              # Compiled code
├── node_modules/      # Dependencies
└── assets/            # Images and resources
```

## 🔧 Configuration

### Claude Desktop

Add servers to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "perplexity-ask": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "PERPLEXITY_API_KEY",
        "mcp/perplexity-ask"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### Cursor

1. Open Cursor Settings
2. Navigate to MCP directory
3. Add new global MCP server
4. Use the same configuration as above

### HTTP API Usage

For direct HTTP API access (no MCP client required):

```bash
# List available tools
curl -X POST "https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call" \
-H "Content-Type: application/json" \
-d '{"jsonrpc": "2.0", "method": "tools/list", "params": {}}'

# Use a tool
curl -X POST "https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call" \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "perplexity_ask",
    "arguments": {
      "messages": [
        {"role": "user", "content": "Hello!"}
      ]
    }
  }
}'
```

## 📋 Server Status

| Server                              | Status              | Description                   | API Endpoint                                                             |
| ----------------------------------- | ------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| [perplexity-ask](./perplexity-ask/) | ✅ Production Ready | Perplexity AI API integration | `https://perplexity-ask-259175647845.us-central1.run.app/api/tools/call` |
| [future-server](./future-server/)   | 🚧 Coming Soon      | Future MCP server             | TBD                                                                      |

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/new-server`
3. **Add your server** following the structure above
4. **Update this README** with your server information
5. **Submit a pull request**

### Guidelines

- Each server should be self-contained
- Include comprehensive documentation
- Provide test scripts
- Follow the established naming conventions
- Include deployment instructions
- Support both MCP and direct HTTP API access

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/download)
- [Cursor](https://cursor.sh/)
- [Perplexity API](https://docs.perplexity.ai/)

## 🆘 Support

For issues with specific servers:

1. Check the server's `GUIDE.md` for troubleshooting
2. Look at the server's `test_api.sh` for verification
3. Check the server's logs and documentation

For general repository issues:

1. Check this README
2. Review the contributing guidelines
3. Open an issue with detailed information

---

**Repository Status:** 🚧 In Development  
**Last Updated:** January 2025
