Introduction
This guide walks you through connecting Composio to Mastra AI using the Composio tool router. By the end, you'll have a working Composio agent that can generate a step-by-step workflow plan, check active connections for all toolkits, download public s3 file to local path, show tool dependencies for workflow setup through natural language commands.

This guide will help you understand how to give your Mastra AI agent real control over a Composio account through Composio's Composio MCP server.

Before we dive in, let's take a quick look at the key ideas and tools involved.

TL;DR
Here's what you'll learn:
Set up your environment so Mastra, OpenAI, and Composio work together
Create a Tool Router session in Composio that exposes Composio tools
Connect Mastra's MCP client to the Composio generated MCP URL
Fetch Composio tool definitions and attach them as a toolset
Build a Mastra agent that can reason, call tools, and return structured results
Run an interactive CLI where you can chat with your Composio agent
What is Mastra AI?
Mastra AI is a TypeScript framework for building AI agents with tool support. It provides a clean API for creating agents that can use external services through MCP.

Key features include:

MCP Client: Built-in support for Model Context Protocol servers
Toolsets: Organize tools into logical groups
Step Callbacks: Monitor and debug agent execution
OpenAI Integration: Works with OpenAI models via @ai-sdk/openai
What is the Composio MCP server, and what's possible with it?
The Composio MCP server is an implementation of the Model Context Protocol that connects your AI agent and assistants like Claude, Cursor, etc directly to your Composio account. It provides structured and secure access to your connected tools, so your agent can plan workflows, orchestrate complex actions, manage integrations, and execute cross-tool automations on your behalf.

Automated workflow planning and execution: The agent can generate and run step-by-step plans for complex, multi-tool use cases—ensuring tasks are completed reliably, even when they span multiple services.
Connection management and discovery: Effortlessly check the status of multiple toolkit connections, discover what integrations are active, and manage how your agent connects to different services.
Tool and dependency exploration: Ask your agent to map out tool dependencies, discover related tools, and understand which tools work best together for your workflow.
Direct code and command execution: Let the agent run code snippets or shell commands in supported environments, tying together automation across your stack.
Bulk and parallel operations: Use specialized tools for parallel execution or to handle many similar tasks at once—speeding up large automations by making multiple calls in a single workflow.
Supported Tools & Triggers
Tools
Ask Oracle
Static helper that returns a comprehensive system prompt describing how to plan and execute tasks using the available composio tools and workflows.
Check active connection (deprecated)
Deprecated: use check active connections instead for bulk operations.
Check multiple active connections
Check active connection status for multiple toolkits or specific connected account ids.
Create Plan
This is a workflow builder that ensures the LLM produces a complete, step-by-step plan for any use case.
Download S3 File
Download a file from a public s3 (or r2) url to a local path.
Enable trigger
Enable a specific trigger for the authenticated user.
Execute agent
Execute complex workflows using ai agent reasoning between multiple tool calls.
Execute Composio Tool
Execute a tool using the composio api.
Get Tool Dependency Graph
Get the dependency graph for a given tool, showing related parent tools that might be useful.
Get required parameters for connection
Gets the required parameters for connecting to a toolkit via initiate connection.
Get response schema
Retrieves the response schema for a specified composio tool.
Initiate connection
Initiate a connection to a toolkit with comprehensive authentication support.
List toolkits
List all the available toolkits on composio with filtering options.
List triggers
List available triggers and their configuration schemas.
Manage connection
Manage a connection to a toolkit with comprehensive authentication support.
Manage connections
Create or manage connections to user's apps.
Multi Execute Composio Tools
Fast and parallel tool executor for tools discovered through COMPOSIO_SEARCH_TOOLS.
Run bash commands
Execute bash commands in a REMOTE sandbox for file operations, data processing, and system tasks.
Execute Code remotely in work bench
Process REMOTE FILES or script BULK TOOL EXECUTIONS using Python code IN A REMOTE SANDBOX.
Retrieve Toolkits
Toolkits are like github, linear, gmail, etc.
Search agent
Discover tools and analyze dependencies for complex workflows using ai agent.
Search Composio Tools
MCP Server Info: COMPOSIO MCP connects 500+ apps—Slack, GitHub, Notion, Google Workspace (Gmail, Sheets, Drive, Calendar), Microsoft (Outlook, Teams), X, Figma, Web Search, Meta apps (WhatsApp, Instagram), TikTok, AI tools like Nano Banana & Veo3, and more—for seamless cross-app automation.
Wait for connection
Wait for the user to complete authentication AFTER you have given them an auth URL from COMPOSIO_MANAGE_CONNECTIONS.
Create / Update Recipe from Workflow
Convert the executed workflow into a notebook.
Execute Recipe
Executes a Recipe
Create / Update Skill from Workflow
Convert the executed workflow into a skill using Python Pydantic code.
Get Existing Recipe Details
Get the details of the existing recipe for a given recipe id.
What is the Composio tool router, and how does it fit here?
What is Tool Router?
Composio's Tool Router helps agents find the right tools for a task at runtime. You can plug in multiple toolkits (like Gmail, HubSpot, and GitHub), and the agent will identify the relevant app and action to complete multi-step workflows. This can reduce token usage and improve the reliability of tool calls. Read more here: Getting started with Tool Router

The tool router generates a secure MCP URL that your agents can access to perform actions.

How the Tool Router works
The Tool Router follows a three-phase workflow:

Discovery: Searches for tools matching your task and returns relevant toolkits with their details.
Authentication: Checks for active connections. If missing, creates an auth config and returns a connection URL via Auth Link.
Execution: Executes the action using the authenticated connection.
Step-by-step Guide
1
Prerequisites
Before starting, make sure you have:
Node.js 18 or higher
A Composio account with an active API key
An OpenAI API key
Basic familiarity with TypeScript
2
Getting API Keys for OpenAI and Composio
OpenAI API Key
Go to the OpenAI dashboard and create an API key.
You need credits or a connected billing setup to use the models.
Store the key somewhere safe.
Composio API Key
Log in to the Composio dashboard.
Go to Settings and copy your API key.
This key lets your Mastra agent talk to Composio and reach Composio through MCP.
3
Install dependencies
bash
Copy
npm install @composio/core @mastra/core @mastra/mcp @ai-sdk/openai dotenv
Install the required packages.

What's happening:

@composio/core is the Composio SDK for creating MCP sessions
@mastra/core provides the Agent class
@mastra/mcp is Mastra's MCP client
@ai-sdk/openai is the model wrapper for OpenAI
dotenv loads environment variables from .env
4
Set up environment variables
bash
Copy
COMPOSIO_API_KEY=your_composio_api_key_here
COMPOSIO_USER_ID=your_user_id_here
OPENAI_API_KEY=your_openai_api_key_here
Create a .env file in your project root.

What's happening:

COMPOSIO_API_KEY authenticates your requests to Composio
COMPOSIO_USER_ID tells Composio which user this session belongs to
OPENAI_API_KEY lets the Mastra agent call OpenAI models
5
Import libraries and validate environment
typescript
Copy
import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { MCPClient } from "@mastra/mcp";
import { Composio } from "@composio/core";
import * as readline from "readline";

import type { AiMessageType } from "@mastra/core/agent";

const openaiAPIKey = process.env.OPENAI_API_KEY;
const composioAPIKey = process.env.COMPOSIO_API_KEY;
const composioUserID = process.env.COMPOSIO_USER_ID;

if (!openaiAPIKey) throw new Error("OPENAI_API_KEY is not set");
if (!composioAPIKey) throw new Error("COMPOSIO_API_KEY is not set");
if (!composioUserID) throw new Error("COMPOSIO_USER_ID is not set");

const composio = new Composio({
  apiKey: composioAPIKey as string,
});
What's happening:
dotenv/config auto loads your .env so process.env.* is available
openai gives you a Mastra compatible model wrapper
Agent is the Mastra agent that will call tools and produce answers
MCPClient connects Mastra to your Composio MCP server
Composio is used to create a Tool Router session
6
Create a Tool Router session for Composio
typescript
Copy
async function main() {
  const session = await composio.create(
    composioUserID as string,
    {
      toolkits: ["composio"],
    },
  );

  const composioMCPUrl = session.mcp.url;
  console.log("Composio MCP URL:", composioMCPUrl);
What's happening:
create spins up a short-lived MCP HTTP endpoint for this user
The toolkits array contains "composio" for Composio access
session.mcp.url is the MCP URL that Mastra's MCPClient will connect to
7
Configure Mastra MCP client and fetch tools
typescript
Copy
const mcpClient = new MCPClient({
    id: composioUserID as string,
    servers: {
      nasdaq: {
        url: new URL(composioMCPUrl),
        requestInit: {
          headers: session.mcp.headers,
        },
      },
    },
    timeout: 30_000,
  });

console.log("Fetching MCP tools from Composio...");
const composioTools = await mcpClient.getTools();
console.log("Number of tools:", Object.keys(composioTools).length);
What's happening:
MCPClient takes an id for this client and a list of MCP servers
The headers property includes the x-api-key for authentication
getTools fetches the tool definitions exposed by the Composio toolkit
8
Create the Mastra agent
typescript
Copy
const agent = new Agent({
    name: "composio-mastra-agent",
    instructions: "You are an AI agent with Composio tools via Composio.",
    model: "openai/gpt-5",
  });
What's happening:
Agent is the core Mastra agent
name is just an identifier for logging and debugging
instructions guide the agent to use tools instead of only answering in natural language
model uses openai("gpt-5") to configure the underlying LLM
9
Set up interactive chat interface
typescript
Copy
let messages: AiMessageType[] = [];

console.log("Chat started! Type 'exit' or 'quit' to end.\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

rl.prompt();

rl.on("line", async (userInput: string) => {
  const trimmedInput = userInput.trim();

  if (["exit", "quit", "bye"].includes(trimmedInput.toLowerCase())) {
    console.log("\nGoodbye!");
    rl.close();
    process.exit(0);
  }

  if (!trimmedInput) {
    rl.prompt();
    return;
  }

  messages.push({
    id: crypto.randomUUID(),
    role: "user",
    content: trimmedInput,
  });

  console.log("\nAgent is thinking...\n");

  try {
    const response = await agent.generate(messages, {
      toolsets: {
        composio: composioTools,
      },
      maxSteps: 8,
    });

    const { text } = response;

    if (text && text.trim().length > 0) {
      console.log(`Agent: ${text}\n`);
        messages.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: text,
        });
      }
    } catch (error) {
      console.error("\nError:", error);
    }

    rl.prompt();
  });

  rl.on("close", async () => {
    console.log("\nSession ended.");
    await mcpClient.disconnect();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
What's happening:
messages keeps the full conversation history in Mastra's expected format
agent.generate runs the agent with conversation history and Composio toolsets
maxSteps limits how many tool calls the agent can take in a single run
onStepFinish is a hook that prints intermediate steps for debugging
Complete Code
Here's the complete code to get you started with Composio and Mastra AI:

typescript
Copy
import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { MCPClient } from "@mastra/mcp";
import { Composio } from "@composio/core";
import * as readline from "readline";

import type { AiMessageType } from "@mastra/core/agent";

const openaiAPIKey = process.env.OPENAI_API_KEY;
const composioAPIKey = process.env.COMPOSIO_API_KEY;
const composioUserID = process.env.COMPOSIO_USER_ID;

if (!openaiAPIKey) throw new Error("OPENAI_API_KEY is not set");
if (!composioAPIKey) throw new Error("COMPOSIO_API_KEY is not set");
if (!composioUserID) throw new Error("COMPOSIO_USER_ID is not set");

const composio = new Composio({ apiKey: composioAPIKey as string });

async function main() {
  const session = await composio.create(composioUserID as string, {
    toolkits: ["composio"],
  });

  const composioMCPUrl = session.mcp.url;

  const mcpClient = new MCPClient({
    id: composioUserID as string,
    servers: {
      composio: {
        url: new URL(composioMCPUrl),
        requestInit: {
          headers: session.mcp.headers,
        },
      },
    },
    timeout: 30_000,
  });

  const composioTools = await mcpClient.getTools();

  const agent = new Agent({
    name: "composio-mastra-agent",
    instructions: "You are an AI agent with Composio tools via Composio.",
    model: "openai/gpt-5",
  });

  let messages: AiMessageType[] = [];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", async (input: string) => {
    const trimmed = input.trim();
    if (["exit", "quit"].includes(trimmed.toLowerCase())) {
      rl.close();
      return;
    }

    messages.push({ id: crypto.randomUUID(), role: "user", content: trimmed });

    const { text } = await agent.generate(messages, {
      toolsets: { composio: composioTools },
      maxSteps: 8,
    });

    if (text) {
      console.log(`Agent: ${text}\n`);
      messages.push({ id: crypto.randomUUID(), role: "assistant", content: text });
    }

    rl.prompt();
  });

  rl.on("close", async () => {
    await mcpClient.disconnect();
    process.exit(0);
  });
}

main();
Conclusion
You've built a Mastra AI agent that can interact with Composio through Composio's Tool Router. You can extend this further by:
Adding other toolkits like Gmail, Slack, or GitHub
Building a web-based chat interface around this agent
Using multiple MCP endpoints to enable cross-app workflows
How to build Composio MCP Agent with another framework
OpenAI Agents SDK
OpenAI Agents SDK
Use Composio MCP with OpenAI Agents SDK

Claude Agent SDK
Claude Agent SDK
Use Composio MCP with Claude Agent SDK

Google ADK
Google ADK
Use Composio MCP with Google ADK

LangChain
LangChain
Use Composio MCP with LangChain

Vercel AI SDK
Vercel AI SDK
Use Composio MCP with Vercel AI SDK

LlamaIndex
LlamaIndex
Use Composio MCP with LlamaIndex

CrewAI
CrewAI
Use Composio MCP with CrewAI

Claude Code
Claude Code
Use Composio MCP with Claude Code

Codex
Codex
Use Composio MCP with Codex

Explore Other Toolkits
Ai ml api
Ai ml api
API Key
Ai ml api is a suite of AI/ML models for natural language and image tasks. It provides fast, scalable access to advanced AI capabilities for your apps and workflows.

Aivoov
Aivoov
API Key
Aivoov is an AI-powered text-to-speech platform offering 1,000+ voices in over 150 languages. Instantly turn written content into natural, human-like audio for any application.

All images ai
All images ai
API Key
All-Images.ai is an AI-powered image generation and management platform. It helps you create, search, and organize images effortlessly with advanced AI capabilities.


Load More
TOOLKIT MARKETPLACE
FAQ
What are the differences in Tool Router MCP and Composio MCP?
With a standalone Composio MCP server, the agents and LLMs can only access a fixed set of Composio tools tied to that server. However, with the Composio Tool Router, agents can dynamically load tools from Composio and many other apps based on the task at hand, all through a single MCP endpoint.
Can I use Tool Router MCP with Mastra AI?
Yes, you can. Mastra AI fully supports MCP integration. You get structured tool calling, message history handling, and model orchestration while Tool Router takes care of discovering and serving the right Composio tools.
Can I manage the permissions and scopes for Composio while using Tool Router?
Yes, absolutely. You can configure which Composio scopes and actions are allowed when connecting your account to Composio. You can also bring your own OAuth credentials or API configuration so you keep full control over what the agent can do.
How safe is my data with Composio Tool Router?
All sensitive data such as tokens, keys, and configuration is fully encrypted at rest and in transit. Composio is SOC 2 Type 2 compliant and follows strict security practices so your Composio data and credentials are handled as safely as possible.

# Mastra (/docs/providers/mastra)

The Mastra provider transforms Composio tools into [Mastra's tool format](https://mastra.ai/en/docs/tools-mcp/overview#creating-tools) with built-in execution.

**Install**

```bash
npm install @composio/core @composio/mastra @mastra/core @ai-sdk/openai
```

**Configure API Keys**

> Set `COMPOSIO_API_KEY` with your API key from [Settings](https://platform.composio.dev/?next_page=/settings) and `OPENAI_API_KEY` with your [OpenAI API key](https://platform.openai.com/api-keys).

```txt title=".env"
COMPOSIO_API_KEY=xxxxxxxxx
OPENAI_API_KEY=xxxxxxxxx
```
**Create session and run**

```typescript
import { Composio } from "@composio/core";
import { MastraProvider } from "@composio/mastra";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

const composio = new Composio({
  provider: new MastraProvider(),
});

// Create a session for your user
const session = await composio.create("user_123");
const tools = await session.tools();

const agent = new Agent({
  id: "my-agent",
  name: "My Agent",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-5.2"),
  tools,
});

const { text } = await agent.generate([
  { role: "user", content: "Send an email to john@example.com with the subject 'Hello' and body 'Hello from Composio!'" },
]);

console.log(text);
```

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Purpose:** Enforce only the **current** and **correct** patterns for integrating [Composio](https://composio.dev/) tools into AI agents.
**Scope:** All AI-generated code using Composio must follow these guardrails.

---

## 1. Correct Composio Integration

Composio supports two integration modes: **Native Tools** (with a provider package) and **MCP** (no provider package needed).

### Native Tools

```python
# ✅ CORRECT — Python (defaults to OpenAI)
from composio import Composio

composio = Composio()
session = composio.create(user_id="user_123")
tools = session.tools()
# Pass tools to your agent/LLM framework
```

```typescript
// ✅ CORRECT — TypeScript (defaults to OpenAI)
import { Composio } from "@composio/core";

const composio = new Composio();
const session = await composio.create("user_123");
const tools = await session.tools();
// Pass tools to your agent/LLM framework
```

For other providers, pass the provider explicitly. Provider packages follow the naming convention: `composio_<provider>` for Python, `@composio/<provider>` for TypeScript.

### MCP

Use `session.mcp.url` and `session.mcp.headers` with any MCP-compatible client (Claude Desktop, Cursor, OpenAI Agents, etc.). No provider package needed.

---

## 2. CRITICAL INSTRUCTIONS FOR AI MODELS

### 2.1 — ALWAYS DO THE FOLLOWING

1. **Use `composio.create(user_id)`** to create a session — this is the entry point for all Composio integrations.
2. **Use `session.tools()`** for native tool integration or **`session.mcp.url`** for MCP integration.
3. **Import** from the correct provider package (`composio_<provider>` for Python, `@composio/<provider>` for TypeScript).
4. **Pass `user_id` to `composio.create()`**, not to individual tool calls.

### 2.2 — NEVER DO THE FOLLOWING

1. **Do not** instruct users to manually create auth configs or connected accounts before running.
2. **Do not** import from `composio_openai` / `@composio/openai` when using OpenAI Agents SDK — use `composio_openai_agents` / `@composio/openai-agents` instead.

### 2.3 — DISCOURAGED (do not use unless user explicitly asks)

Do **not** generate `composio.tools.get()`, `composio.tools.execute()`, or `composio.provider.handle_tool_calls()` unless the user explicitly requests direct tool execution. These are a supported but **not recommended** low-level interface.

