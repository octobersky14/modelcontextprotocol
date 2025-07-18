#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { Request, Response } from "express";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Definition of the Perplexity Ask Tool.
 * This tool accepts an array of messages and returns a chat completion response
 * from the Perplexity API, with citations appended to the message if provided.
 */
const PERPLEXITY_ASK_TOOL: Tool = {
  name: "perplexity_ask",
  description:
    "Engages in a conversation using the Sonar API. " +
    "Accepts an array of messages (each with a role and content) " +
    "and returns a ask completion response from the Perplexity model.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description:
                "Role of the message (e.g., system, user, assistant)",
            },
            content: {
              type: "string",
              description: "The content of the message",
            },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
    },
    required: ["messages"],
  },
};

/**
 * Definition of the Perplexity Research Tool.
 * This tool performs deep research queries using the Perplexity API.
 */
const PERPLEXITY_RESEARCH_TOOL: Tool = {
  name: "perplexity_research",
  description:
    "Performs deep research using the Perplexity API. " +
    "Accepts an array of messages (each with a role and content) " +
    "and returns a comprehensive research response with citations.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description:
                "Role of the message (e.g., system, user, assistant)",
            },
            content: {
              type: "string",
              description: "The content of the message",
            },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
    },
    required: ["messages"],
  },
};

/**
 * Definition of the Perplexity Reason Tool.
 * This tool performs reasoning queries using the Perplexity API.
 */
const PERPLEXITY_REASON_TOOL: Tool = {
  name: "perplexity_reason",
  description:
    "Performs reasoning tasks using the Perplexity API. " +
    "Accepts an array of messages (each with a role and content) " +
    "and returns a well-reasoned response using the sonar-reasoning-pro model.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description:
                "Role of the message (e.g., system, user, assistant)",
            },
            content: {
              type: "string",
              description: "The content of the message",
            },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
    },
    required: ["messages"],
  },
};

// Retrieve the Perplexity API key from environment variables
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!PERPLEXITY_API_KEY) {
  console.error("Error: PERPLEXITY_API_KEY environment variable is required");
  process.exit(1);
}

/**
 * Performs a chat completion by sending a request to the Perplexity API.
 * Appends citations to the returned message content if they exist.
 *
 * @param {Array<{ role: string; content: string }>} messages - An array of message objects.
 * @param {string} model - The model to use for the completion.
 * @returns {Promise<string>} The chat completion result with appended citations.
 * @throws Will throw an error if the API request fails.
 */
async function performChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = "sonar-pro"
): Promise<string> {
  // Construct the API endpoint URL and request body
  const url = new URL("https://api.perplexity.ai/chat/completions");
  const body = {
    model: model, // Model identifier passed as parameter
    messages: messages,
    // Additional parameters can be added here if required (e.g., max_tokens, temperature, etc.)
    // See the Sonar API documentation for more details:
    // https://docs.perplexity.ai/api-reference/chat-completions
  };

  let response;
  try {
    response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(`Network error while calling Perplexity API: ${error}`);
  }

  // Check for non-successful HTTP status
  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch (parseError) {
      errorText = "Unable to parse error response";
    }
    throw new Error(
      `Perplexity API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  // Attempt to parse the JSON response from the API
  let data;
  try {
    data = await response.json();
  } catch (jsonError) {
    throw new Error(
      `Failed to parse JSON response from Perplexity API: ${jsonError}`
    );
  }

  // Directly retrieve the main message content from the response
  let messageContent = data.choices[0].message.content;

  // If citations are provided, append them to the message content
  if (
    data.citations &&
    Array.isArray(data.citations) &&
    data.citations.length > 0
  ) {
    messageContent += "\n\nCitations:\n";
    data.citations.forEach((citation: string, index: number) => {
      messageContent += `[${index + 1}] ${citation}\n`;
    });
  }

  return messageContent;
}

// Initialize the server with tool metadata and capabilities
const server = new Server(
  {
    name: "example-servers/perplexity-ask",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Registers a handler for listing available tools.
 * When the client requests a list of tools, this handler returns all available Perplexity tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    PERPLEXITY_ASK_TOOL,
    PERPLEXITY_RESEARCH_TOOL,
    PERPLEXITY_REASON_TOOL,
  ],
}));

/**
 * Registers a handler for calling a specific tool.
 * Processes requests by validating input and invoking the appropriate tool.
 *
 * @param {object} request - The incoming tool call request.
 * @returns {Promise<object>} The response containing the tool's result or an error.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    if (!args) {
      throw new Error("No arguments provided");
    }
    switch (name) {
      case "perplexity_ask": {
        if (!Array.isArray(args.messages)) {
          throw new Error(
            "Invalid arguments for perplexity_ask: 'messages' must be an array"
          );
        }
        // Invoke the chat completion function with the provided messages
        const messages = args.messages;
        const result = await performChatCompletion(messages, "sonar-pro");
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      case "perplexity_research": {
        if (!Array.isArray(args.messages)) {
          throw new Error(
            "Invalid arguments for perplexity_research: 'messages' must be an array"
          );
        }
        // Invoke the chat completion function with the provided messages using the deep research model
        const messages = args.messages;
        const result = await performChatCompletion(
          messages,
          "sonar-deep-research"
        );
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      case "perplexity_reason": {
        if (!Array.isArray(args.messages)) {
          throw new Error(
            "Invalid arguments for perplexity_reason: 'messages' must be an array"
          );
        }
        // Invoke the chat completion function with the provided messages using the reasoning model
        const messages = args.messages;
        const result = await performChatCompletion(
          messages,
          "sonar-reasoning-pro"
        );
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      default:
        // Respond with an error if an unknown tool is requested
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    // Return error details in the response
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
});

const app = express();
app.use(express.json());

app.get("/", (_: Request, res: Response) => {
  res.send("Perplexity MCP Server is running!");
});

const transports: { [sessionId: string]: SSEServerTransport } = {};

// SSE endpoint for client notifications
app.get("/sse", async (_: Request, res: Response) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;
  res.on("close", () => {
    delete transports[transport.sessionId];
  });
  await server.connect(transport);
});

// POST endpoint for client messages
app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No transport found for sessionId");
  }
});

// Direct HTTP endpoint for tool calls (no SSE required)
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
        case "perplexity_ask": {
          if (!Array.isArray(args.messages)) {
            return res.status(400).json({
              jsonrpc: "2.0",
              error: {
                code: -32602,
                message:
                  "Invalid arguments for perplexity_ask: 'messages' must be an array",
              },
              id: null,
            });
          }
          const messages = args.messages;
          result = await performChatCompletion(messages, "sonar-pro");
          break;
        }
        case "perplexity_research": {
          if (!Array.isArray(args.messages)) {
            return res.status(400).json({
              jsonrpc: "2.0",
              error: {
                code: -32602,
                message:
                  "Invalid arguments for perplexity_research: 'messages' must be an array",
              },
              id: null,
            });
          }
          const messages = args.messages;
          result = await performChatCompletion(messages, "sonar-deep-research");
          break;
        }
        case "perplexity_reason": {
          if (!Array.isArray(args.messages)) {
            return res.status(400).json({
              jsonrpc: "2.0",
              error: {
                code: -32602,
                message:
                  "Invalid arguments for perplexity_reason: 'messages' must be an array",
              },
              id: null,
            });
          }
          const messages = args.messages;
          result = await performChatCompletion(messages, "sonar-reasoning-pro");
          break;
        }
        default:
          return res.status(400).json({
            jsonrpc: "2.0",
            error: {
              code: -32601,
              message: `Method not found: ${name}`,
            },
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
        result: {
          tools: [
            PERPLEXITY_ASK_TOOL,
            PERPLEXITY_RESEARCH_TOOL,
            PERPLEXITY_REASON_TOOL,
          ],
        },
        id: null,
      });
    } else {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32601,
          message: `Method not found: ${method}`,
        },
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

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
app.listen(port, () => {
  console.log(`Perplexity MCP Server running on http://localhost:${port}`);
});
