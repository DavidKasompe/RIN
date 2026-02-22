# Configuring Sessions (/docs/configuring-sessions)

# Creating a session

**Python:**

```python
session = composio.create(user_id="user_123")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
```

# Enabling toolkits

Restrict the session to specific toolkits:

**Python:**

```python
# Using array format
session = composio.create(
    user_id="user_123",
    toolkits=["github", "gmail", "slack"]
)

# Using object format with enable key
session = composio.create(
    user_id="user_123",
    toolkits={"enable": ["github", "gmail", "slack"]}
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
// Using array format
const session = await composio.create("user_123", {
  toolkits: ["github", "gmail", "slack"],
});

// Using object format with enable key
const session2 = await composio.create("user_123", {
  toolkits: { enable: ["github", "gmail", "slack"] },
});
```

# Disabling toolkits

Keep all toolkits enabled except specific ones:

**Python:**

```python
session = composio.create(
    user_id="user_123",
    toolkits={"disable": ["exa", "firecrawl"]}
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123", {
  toolkits: { disable: ["exa", "firecrawl"] },
});
```

# Custom auth configs

Use your own OAuth credentials instead of Composio's defaults:

**Python:**

```python
session = composio.create(
    user_id="user_123",
    auth_configs={
        "github": "ac_your_github_config",
        "slack": "ac_your_slack_config"

)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123", {
  authConfigs: {
    github: "ac_your_github_config",
    slack: "ac_your_slack_config",
  },
});
```

See [White-labeling authentication](/docs/white-labeling-authentication) for branding, or [Using custom auth configs](/docs/using-custom-auth-configuration) for toolkits that require your own credentials.

# Account selection

If a user has multiple connected accounts for the same toolkit, you can specify which one to use:

**Python:**

```python
session = composio.create(
    user_id="user_123",
    connected_accounts={
        "gmail": "ca_work_gmail",
        "github": "ca_personal_github"

)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123", {
  connectedAccounts: {
    gmail: "ca_work_gmail",
    github: "ca_personal_github",
  },
});
```

## Precedence

When executing a tool, the connected account is selected in this order:

1. `connectedAccounts` override if provided in session config
2. `authConfigs` override - finds or creates connection on that config
3. Auth config previously created for this toolkit
4. Creates new auth config using Composio managed auth
5. Error if no Composio managed auth scheme exists for the toolkit

If a user has multiple connected accounts for a toolkit, the most recently connected one is used.

# Session methods

## mcp

Get the MCP server URL to use with any MCP-compatible client.

**Python:**

```python
mcp_url = session.mcp.url
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const { mcp } = session;
console.log(mcp.url);
```

For framework examples, see provider-specific documentation like [OpenAI Agents](/docs/providers/openai-agents) or [Vercel AI SDK](/docs/providers/vercel).

## tools()

Get native tools from the session for use with AI frameworks.

**Python:**

```python
tools = session.tools()
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const tools = await session.tools();
```

## authorize()

Manually authenticate a user to a toolkit outside of the chat flow.

**Python:**

```python
connection_request = session.authorize("github")

print(connection_request.redirect_url)

connected_account = connection_request.wait_for_connection()
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const connectionRequest = await session.authorize("github", {
  callbackUrl: "https://myapp.com/callback",
});

console.log(connectionRequest.redirectUrl);

const connectedAccount = await connectionRequest.waitForConnection();
```

For more details, see [Manually authenticating users](/docs/authenticating-users/manually-authenticating).

## toolkits()

List available toolkits and their connection status. You can use this to build a UI showing which apps are connected.

**Python:**

```python
toolkits = session.toolkits()

for toolkit in toolkits.items:
    status = toolkit.connection.connected_account.id if toolkit.connection.is_active else "Not connected"
    print(f"{toolkit.name}: {status}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const toolkits = await session.toolkits();

toolkits.items.forEach((toolkit) => {
  console.log(`${toolkit.name}: ${toolkit.connection?.connectedAccount?.id ?? "Not connected"}`);
});
```

Returns the first 20 toolkits by default.

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


# In-chat authentication (/docs/authenticating-users/in-chat-authentication)

In-chat authentication lets your agent prompt users to connect accounts during chat. When a tool requires authentication, the agent returns a Connect Link URL. The user authenticates, confirms in chat, and the agent retries.

# How it works

1. Agent searches for tools via the `COMPOSIO_SEARCH_TOOLS` meta-tool
2. The `COMPOSIO_MANAGE_CONNECTIONS` meta-tool checks connection status, returns Connect Link URL if needed
3. User authenticates, confirms in chat, agent continues

# Configuration

By just creating a session with default configs, you are enabling in-chat auth. The `manage_connections` parameter defaults to `True`, which includes the `COMPOSIO_MANAGE_CONNECTIONS` meta-tool automatically:

**Python:**

```python
session = composio.create(user_id="user_123")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
```

## Custom callback URL

Redirect users back to your chat page after they complete authentication:

**Python:**

```python
session = composio.create(
    user_id="user_123",
    manage_connections={
        "callback_url": "https://yourapp.com/chat"
    },
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123", {
  manageConnections: {
    callbackUrl: "https://yourapp.com/chat",
  },
});
```

# Examples

**Python:**

```python
from dotenv import load_dotenv
from composio import Composio
from agents import Agent, Runner, SQLiteSession
from composio_openai_agents import OpenAIAgentsProvider

load_dotenv()

# Initialize Composio with OpenAI Agents provider (API key from env var COMPOSIO_API_KEY)
composio = Composio(provider=OpenAIAgentsProvider())

# Unique identifier of the user
user_id = "user_123"

# Create a session and get native tools for the user
session = composio.create(user_id=user_id)
tools = session.tools()

# Configure OpenAI agent with Composio tools
agent = Agent(
    name="Personal Assistant",
    instructions="You are a helpful personal assistant. Use Composio tools to take action.",
    model="gpt-5.2",
    tools=tools,
)

# Memory for multi-turn conversation
memory = SQLiteSession("conversation")

print("""
What task would you like me to help you with?
I can use tools like Gmail, GitHub, Linear, Notion, and more.
(Type 'exit' to exit)
Example tasks:
  • 'Summarize my emails from today'
  • 'List all open issues on the composio github repository'
""")

while True:
    user_input = input("You: ").strip()
    if user_input.lower() == "exit":
        break

    print("Assistant: ", end="", flush=True)
    try:
        result = Runner.run_sync(starting_agent=agent, input=user_input, session=memory)
        print(f"{result.final_output}\n")
    except Exception as e:
        print(f"\n[Error]: {e}")
```

**TypeScript:**

```typescript
import "dotenv/config";
import { Composio } from "@composio/core";
import { Agent, run, MemorySession } from "@openai/agents";
import { OpenAIAgentsProvider } from "@composio/openai-agents";
import { createInterface } from "readline/promises";

// Initialize Composio with OpenAI Agents provider (API key from env var COMPOSIO_API_KEY)
const composio = new Composio({ provider: new OpenAIAgentsProvider() });

// Unique identifier of the user
const userId = "user_123";
// Create a session for the user
const session = await composio.create(userId);
const tools = await session.tools();

const agent = new Agent({
  name: "Personal Assistant",
  instructions: "You are a helpful personal assistant. Use Composio tools to take action.",
  model: "gpt-5.2",
  tools,
});

// Set up interactive terminal input/output for the conversation
const readline = createInterface({ input: process.stdin, output: process.stdout });
// Create a memory session for persistent multi-turn conversation
const memory = new MemorySession();

console.log(`
What task would you like me to help you with?
I can use tools like Gmail, GitHub, Linear, Notion, and more.
(Type 'exit' to exit)
Example tasks:
  • 'Summarize my emails from today'
  • 'List all open issues on the composio github repository and create a Google Sheet with the issues'
`);

// Multi-turn conversation with agentic tool calling
while (true) {
    const query = await readline.question("You: ");
    const input = query.trim();

    if (input.toLowerCase() === "exit") break;
    process.stdout.write("Assistant: ");

    try {
      const result = await run(agent, input, { session: memory });
      process.stdout.write(`${result.finalOutput}`);
    } catch (error) {
    console.error("\n[Error]:", error instanceof Error ? error.message : error);

readline.close();
```

What this looks like when you run the code:

```
Assistant: What would you like me to do today? Type 'exit' to end the conversation.

> Star the composio repo on GitHub
Assistant: I need you to connect your GitHub account first.
Please click here to authorize: https://connect.composio.dev/link/ln_abc123

> Done
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


# Manually authenticating users (/docs/authenticating-users/manually-authenticating)

Manual authentication lets you connect users to toolkits outside of the chat flow. Use this when you want to:

* Pre-authenticate users before they start chatting
* Build a custom connections UI in your app

# Authorize a toolkit

Use `session.authorize()` to generate a [Connect Link](/docs/tools-direct/authenticating-tools#hosted-authentication-connect-link) URL, redirect the user, and wait for them to complete:

**Python:**

```python
session = composio.create(user_id="user_123")

connection_request = session.authorize("gmail")

print(connection_request.redirect_url)
# https://connect.composio.dev/link/ln_abc123

connected_account = connection_request.wait_for_connection(60000)
print(f"Connected: {connected_account.id}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");

const connectionRequest = await session.authorize("gmail");

console.log(connectionRequest.redirectUrl);
// https://connect.composio.dev/link/ln_abc123

const connectedAccount = await connectionRequest.waitForConnection(60000);
console.log(`Connected: ${connectedAccount.id}`);
```

Redirect the user to the redirect URL. After they authenticate, they'll return to your callback URL. The connection request polls until the user completes authentication (default timeout: 60 seconds).

> If the user closes the Connect Link without completing auth, the connection remains in `INITIATED` status until it expires.

# Redirecting users after authentication

Pass a `callbackUrl` to control where users land after authenticating. You can include query parameters to carry context through the flow, for example to identify which user or session triggered the connection.

**Python:**

```python
connection_request = session.authorize(
    "gmail",
    callback_url="https://your-app.com/callback?user_id=user_123&source=onboarding"
)

print(connection_request.redirect_url)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const connectionRequest = await session.authorize("gmail", {
  callbackUrl: "https://your-app.com/callback?user_id=user_123&source=onboarding",
});

console.log(connectionRequest.redirectUrl);
```

After authentication, Composio redirects the user to your callback URL with the following parameters appended, while preserving your existing ones:

| Parameter              | Description                                   |
| ---------------------- | --------------------------------------------- |
| `status`               | `success` or `failed`                         |
| `connected_account_id` | The ID of the newly created connected account |

```
https://your-app.com/callback?user_id=user_123&source=onboarding&status=success&connected_account_id=ca_abc123
```

# Check connection status

Use `session.toolkits()` to see all toolkits in the session and their connection status:

**Python:**

```python
toolkits = session.toolkits()

for toolkit in toolkits.items:
    status = toolkit.connection.connected_account.id if toolkit.connection.is_active else "Not connected"
    print(f"{toolkit.name}: {status}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const toolkits = await session.toolkits();

toolkits.items.forEach((toolkit) => {
  console.log(`${toolkit.name}: ${toolkit.connection?.connectedAccount?.id ?? "Not connected"}`);
});
```

# Disabling in-chat auth

By default, sessions include the `COMPOSIO_MANAGE_CONNECTIONS` meta-tool that prompts users to authenticate during chat. To disable this and handle auth entirely in your UI:

**Python:**

```python
session = composio.create(
    user_id="user_123",
    manage_connections=False,
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123", {
  manageConnections: false,
});
```

# Putting it together

A common pattern is to verify all required connections before starting the agent:

**Python:**

```python
from composio import Composio

composio = Composio(api_key="your-api-key")

required_toolkits = ["gmail", "github"]

session = composio.create(
    user_id="user_123",
    manage_connections=False,  # Disable in-chat auth prompts
)

toolkits = session.toolkits()

connected = {t.slug for t in toolkits.items if t.connection.is_active}
pending = [slug for slug in required_toolkits if slug not in connected]

print(f"Connected: {connected}")
print(f"Pending: {pending}")

for slug in pending:
    connection_request = session.authorize(slug)
    print(f"Connect {slug}: {connection_request.redirect_url}")
    connection_request.wait_for_connection()

print(f"All toolkits connected! MCP URL: {session.mcp.url}")
```

**TypeScript:**

```typescript
import { Composio } from "@composio/core";

const composio = new Composio({ apiKey: "your-api-key" });

const requiredToolkits = ["gmail", "github"];

const session = await composio.create("user_123", {
  manageConnections: false, // Disable in-chat auth prompts
});

const toolkits = await session.toolkits();

const connected = toolkits.items
  .filter((t) => t.connection?.connectedAccount)
  .map((t) => t.slug);

const pending = requiredToolkits.filter((slug) => !connected.includes(slug));

console.log("Connected:", connected);
console.log("Pending:", pending);

for (const slug of pending) {
  const connectionRequest = await session.authorize(slug);
  console.log(`Connect ${slug}: ${connectionRequest.redirectUrl}`);
  await connectionRequest.waitForConnection();

console.log(`All toolkits connected! MCP URL: ${session.mcp.url}`);
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



# Fetching tools and toolkits (/docs/toolkits/fetching-tools-and-toolkits)

# Fetching for a session

When using sessions, fetch tools through the session object.

## List enabled toolkits

`session.toolkits()` returns toolkits enabled for your session, sorted by popularity. By default, it returns the top 20. Each toolkit includes its `slug`, `name`, `logo`, and connection status.

**Python:**

```python
session = composio.create(user_id="user_123")

result = session.toolkits()

for toolkit in result.items:
    print(f"{toolkit.name}: connected={toolkit.connection.is_active if toolkit.connection else 'n/a'}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");

const result = await session.toolkits();

for (const toolkit of result.items) {
  console.log(`${toolkit.name}: connected=${toolkit.connection?.isActive ?? 'n/a'}`);

```

You can filter to only show connected toolkits:

**Python:**

```python
connected = session.toolkits(is_connected=True)  # Only connected
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const connected = await session.toolkits({ isConnected: true });  // Only connected
```

To fetch all toolkits, paginate through the results:

**Python:**

```python
all_toolkits = []
cursor = None

while True:
    result = session.toolkits(limit=20, next_cursor=cursor)
    all_toolkits.extend(result.items)
    cursor = result.next_cursor
    if not cursor:
        break
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const allToolkits: any[] = [];
let cursor: string | undefined;

do {
  const { items, nextCursor } = await session.toolkits({ limit: 20, nextCursor: cursor });
  allToolkits.push(...items);
  cursor = nextCursor;
} while (cursor);
```

## Get meta tools

`session.tools()` returns the 5 meta tools formatted for your configured provider (OpenAI, Anthropic, etc.):

**Python:**

```python
# Get all meta tools
tools = session.tools()
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
// Get all meta tools
const tools = await session.tools();
```

To restrict which toolkits or tools are discoverable by the meta tools, configure them when [creating the session](/docs/toolkits/enable-and-disable-toolkits).

# Browsing the catalog

Before configuring a session, you may want to explore what toolkits and tools are available. You can browse visually at [platform.composio.dev](https://platform.composio.dev) or in the [docs](/toolkits), or fetch programmatically:

**Python:**

```python
# List toolkits
toolkits = composio.toolkits.get()

# List tools within a toolkit (top 20 by default)
tools = composio.tools.get("user_123", toolkits=["GITHUB"])
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user_123';
// List toolkits
const toolkits = await composio.toolkits.get();

// List tools within a toolkit (top 20 by default)
const tools = await composio.tools.get(userId, { toolkits: ["GITHUB"] });
```

## Get a tool's schema

To inspect a tool's input parameters and types without needing a user context, use `getRawComposioToolBySlug`:

**Python:**

```python
tool = composio.tools.get_raw_composio_tool_by_slug("GMAIL_SEND_EMAIL")
print(tool.name)
print(tool.description)
print(tool.input_parameters)
print(tool.output_parameters)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const tool = await composio.tools.getRawComposioToolBySlug("GMAIL_SEND_EMAIL");
console.log(tool.name);
console.log(tool.description);
console.log(tool.inputParameters);
console.log(tool.outputParameters);
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



# Fetching tools and toolkits (/docs/toolkits/fetching-tools-and-toolkits)

# Fetching for a session

When using sessions, fetch tools through the session object.

## List enabled toolkits

`session.toolkits()` returns toolkits enabled for your session, sorted by popularity. By default, it returns the top 20. Each toolkit includes its `slug`, `name`, `logo`, and connection status.

**Python:**

```python
session = composio.create(user_id="user_123")

result = session.toolkits()

for toolkit in result.items:
    print(f"{toolkit.name}: connected={toolkit.connection.is_active if toolkit.connection else 'n/a'}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");

const result = await session.toolkits();

for (const toolkit of result.items) {
  console.log(`${toolkit.name}: connected=${toolkit.connection?.isActive ?? 'n/a'}`);

```

You can filter to only show connected toolkits:

**Python:**

```python
connected = session.toolkits(is_connected=True)  # Only connected
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const connected = await session.toolkits({ isConnected: true });  // Only connected
```

To fetch all toolkits, paginate through the results:

**Python:**

```python
all_toolkits = []
cursor = None

while True:
    result = session.toolkits(limit=20, next_cursor=cursor)
    all_toolkits.extend(result.items)
    cursor = result.next_cursor
    if not cursor:
        break
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const allToolkits: any[] = [];
let cursor: string | undefined;

do {
  const { items, nextCursor } = await session.toolkits({ limit: 20, nextCursor: cursor });
  allToolkits.push(...items);
  cursor = nextCursor;
} while (cursor);
```

## Get meta tools

`session.tools()` returns the 5 meta tools formatted for your configured provider (OpenAI, Anthropic, etc.):

**Python:**

```python
# Get all meta tools
tools = session.tools()
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
// Get all meta tools
const tools = await session.tools();
```

To restrict which toolkits or tools are discoverable by the meta tools, configure them when [creating the session](/docs/toolkits/enable-and-disable-toolkits).

# Browsing the catalog

Before configuring a session, you may want to explore what toolkits and tools are available. You can browse visually at [platform.composio.dev](https://platform.composio.dev) or in the [docs](/toolkits), or fetch programmatically:

**Python:**

```python
# List toolkits
toolkits = composio.toolkits.get()

# List tools within a toolkit (top 20 by default)
tools = composio.tools.get("user_123", toolkits=["GITHUB"])
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user_123';
// List toolkits
const toolkits = await composio.toolkits.get();

// List tools within a toolkit (top 20 by default)
const tools = await composio.tools.get(userId, { toolkits: ["GITHUB"] });
```

## Get a tool's schema

To inspect a tool's input parameters and types without needing a user context, use `getRawComposioToolBySlug`:

**Python:**

```python
tool = composio.tools.get_raw_composio_tool_by_slug("GMAIL_SEND_EMAIL")
print(tool.name)
print(tool.description)
print(tool.input_parameters)
print(tool.output_parameters)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const tool = await composio.tools.getRawComposioToolBySlug("GMAIL_SEND_EMAIL");
console.log(tool.name);
console.log(tool.description);
console.log(tool.inputParameters);
console.log(tool.outputParameters);
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


# Creating triggers (/docs/setting-up-triggers/creating-triggers)

Create a trigger to start receiving events. A trigger watches for a specific event (e.g., `GITHUB_COMMIT_EVENT`) on a specific user's connected account.

> **Prerequisites**: Before creating triggers, ensure you have:

  * An [auth config](/docs/authentication#how-composio-manages-authentication) for the toolkit you want to monitor
  * A connected account for the user whose events you want to capture

You can create triggers using the [SDK](#using-the-sdk) or the Composio [dashboard](#using-the-dashboard).

# Using the SDK

Before creating a trigger, inspect the trigger type to see what configuration it requires. Then create the trigger with the required config.

> When you pass a `user_id`, the SDK automatically finds the user's connected account for the relevant toolkit. If the user has multiple connected accounts for the same toolkit, it uses the most recently created one. You can also pass a `connected_account_id`/`connectedAccountId` directly if you need more control.

**Python:**

```python
from composio import Composio

composio = Composio()
user_id = "user-id-123435"

# Check what configuration is required
trigger_type = composio.triggers.get_type("GITHUB_COMMIT_EVENT")
print(trigger_type.config)
# Returns: {"properties": {"owner": {...}, "repo": {...}}, "required": ["owner", "repo"]}

# Create trigger with the required config
trigger = composio.triggers.create(
    slug="GITHUB_COMMIT_EVENT",
    user_id=user_id,
    trigger_config={"owner": "your-repo-owner", "repo": "your-repo-name"},
)
print(f"Trigger created: {trigger.trigger_id}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';

const composio = new Composio();
const userId = 'user-id-123435';

// Check what configuration is required
const triggerType = await composio.triggers.getType("GITHUB_COMMIT_EVENT");
console.log(triggerType.config);
// Returns: {"properties": {"owner": {...}, "repo": {...}}, "required": ["owner", "repo"]}

// Create trigger with the required config
const trigger = await composio.triggers.create(
    userId,
    'GITHUB_COMMIT_EVENT',

        triggerConfig: {
            owner: 'your-repo-owner',
            repo: 'your-repo-name'

);
console.log(`Trigger created: ${trigger.triggerId}`);
```

> The trigger instance uses the toolkit version configured during Composio initialization (defaults to `'latest'`). See [Toolkit Versioning](/docs/tools-direct/toolkit-versioning) for details.

# Using the dashboard

1. Navigate to [Auth Configs](https://platform.composio.dev?next_page=%2Fauth-configs) and select the auth config for the relevant toolkit
2. Navigate to **Active Triggers** and click **Create Trigger**
3. Select the connected account for which you want to create a trigger
4. Choose a trigger type and fill in the required configuration
5. Click **Create Trigger**

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



# Subscribing to triggers (/docs/setting-up-triggers/subscribing-to-events)

# Webhooks

Webhooks are the recommended way to receive trigger events in production. To start receiving events, create a webhook subscription with your endpoint URL and select which event types you want to receive. You can subscribe to one or both:

| Event type                           | Description                                                                                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `composio.trigger.message`           | Fired when a trigger receives data from an external service                                                                                                       |
| `composio.connected_account.expired` | Fired when a connected account expires and needs re-authentication. See [Subscribing to connection expiry events](/docs/subscribing-to-connection-expiry-events). |

Set your webhook URL in the [dashboard settings](https://platform.composio.dev?next_page=/settings/webhook) or via the [Webhook Subscriptions API](/reference/api-reference/webhooks):

```bash
curl -X POST https://backend.composio.dev/api/v3/webhook_subscriptions \
  -H "X-API-KEY: <your-composio-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://example.com/webhook",
    "enabled_events": ["composio.trigger.message"]
  }'
```

> The response includes a `secret` for [verifying webhook signatures](/docs/webhook-verification). This is only returned at creation time or when you [rotate the secret](/reference/api-reference/webhooks/postWebhookSubscriptionsByIdRotateSecret). Store it securely.

## Handling events

All events arrive at the same endpoint. Route on the `type` field to handle each event type:

> [Inspect the payload schema](#inspecting-trigger-payload-schemas) for a trigger before writing your handler. See [Webhook payload (V3)](#webhook-payload-v3) for the full event structure.

**Python:**

```python
from composio import WebhookEventType

@app.post("/webhook")
async def webhook_handler(request: Request):
    payload = await request.json()
    event_type = payload.get("type")

    if event_type == WebhookEventType.TRIGGER_MESSAGE:
        trigger_slug = payload["metadata"]["trigger_slug"]
        event_data = payload["data"]

        if trigger_slug == "GITHUB_COMMIT_EVENT":
            print(f"New commit by {event_data['author']}: {event_data['message']}")

    # Handle connected account expired events

    return {"status": "ok"}
```

**TypeScript:**

```typescript
type NextApiRequest = { body: any };
type NextApiResponse = { status: (code: number) => { json: (data: any) => void } };
export default async function webhookHandler(req: NextApiRequest, res: NextApiResponse) {
  const payload = req.body;

  if (payload.type === 'composio.trigger.message') {
    const triggerSlug = payload.metadata.trigger_slug;
    const eventData = payload.data;

    if (triggerSlug === 'GITHUB_COMMIT_EVENT') {
      console.log(`New commit by ${eventData.author}: ${eventData.message}`);

  // Handle connected account expired events

  res.status(200).json({ status: 'ok' });

```

> Always [verify webhook signatures](/docs/webhook-verification) in production to ensure payloads are authentic.

## Inspecting trigger payload schemas

Each trigger type defines the schema of event data it sends. Use `get_type()`/`getType()` to inspect it before writing your handler:

**Python:**

```python
from composio import Composio

composio = Composio()

trigger_type = composio.triggers.get_type("GITHUB_COMMIT_EVENT")
print(trigger_type.payload)
# Returns: {"properties": {"author": {...}, "id": {...}, "message": {...}, "timestamp": {...}, "url": {...}}}
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';

const composio = new Composio();

const triggerType = await composio.triggers.getType("GITHUB_COMMIT_EVENT");
console.log(triggerType.payload);
// Returns: {"properties": {"author": {...}, "id": {...}, "message": {...}, "timestamp": {...}, "url": {...}}}
```

The payload schema tells you what fields will be in the `data` object of the webhook event.

## Webhook payload (V3)

New organizations receive V3 payloads by default. V3 separates event metadata from the actual event data:

```json
"id": "msg_abc123",
"type": "composio.trigger.message",
"metadata": {
  "log_id": "log_abc123",
  "trigger_slug": "GITHUB_COMMIT_EVENT",
  "trigger_id": "ti_xyz789",
  "connected_account_id": "ca_def456",
  "auth_config_id": "ac_xyz789",
  "user_id": "user-id-123435"
},
"data": {
  "commit_sha": "a1b2c3d",
  "message": "fix: resolve null pointer",
  "author": "jane"
},
"timestamp": "2026-01-15T10:30:00Z"

```

> See [webhook payload versions](/docs/webhook-verification#webhook-payload-versions) for V2 and V1 formats.

# Testing locally

## SDK subscriptions

Subscribe to trigger events directly through the SDK without setting up a webhook endpoint. Uses WebSockets under the hood.

**Python:**

```python
from composio import Composio

composio = Composio()

subscription = composio.triggers.subscribe()

@subscription.handle(trigger_id="your_trigger_id")
def handle_event(data):
    print(f"Event received: {data}")

subscription.wait_forever()
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';

const composio = new Composio();

await composio.triggers.subscribe(
    (data) => {
        console.log('Event received:', data);
    },
    { triggerId: 'your_trigger_id' }
);
```

## Using ngrok

To test the full webhook flow locally, use [ngrok](https://ngrok.com) to expose your local server:

```bash
ngrok http 8000
```

Then use the ngrok URL as your webhook endpoint:

```bash
curl -X POST https://backend.composio.dev/api/v3/webhook_subscriptions \
  -H "X-API-KEY: <your-composio-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://your-ngrok-url.ngrok-free.app/webhook",
    "enabled_events": ["composio.trigger.message"]
  }'
```

Events will now be forwarded to your local server at `http://localhost:8000/webhook`.

# Identifying trigger events

Every webhook event includes a `metadata` object that tells you exactly where it came from:

| Field                           | What it tells you                                 |
| ------------------------------- | ------------------------------------------------- |
| `metadata.trigger_id`           | Which trigger instance fired this event           |
| `metadata.trigger_slug`         | The type of trigger (e.g., `GITHUB_COMMIT_EVENT`) |
| `metadata.connected_account_id` | Which connected account it belongs to             |
| `metadata.user_id`              | Which user it's for                               |
| `metadata.auth_config_id`       | Which auth config was used                        |

Use `trigger_id` to match events to a specific trigger instance, or `trigger_slug` to handle all events of a certain type. These fields can also be passed as filters when using [SDK subscriptions](#sdk-subscriptions).

- [Troubleshooting triggers](/docs/troubleshooting/triggers): Not receiving events? Check common trigger issues and how to fix them

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



# Managing triggers (/docs/setting-up-triggers/managing-triggers)

# Listing active triggers

List trigger instances that have been created. Results are cursor-paginated.

**Python:**

```python
from composio import Composio

composio = Composio()

active = composio.triggers.list_active(
    connected_account_ids=["ca_def456"],
)

for trigger in active.items:
    print(f"{trigger.id} ({trigger.trigger_name}) - disabled_at={trigger.disabled_at}")

# Paginate with cursor
if active.next_cursor:
    next_page = composio.triggers.list_active(cursor=active.next_cursor)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';

const composio = new Composio();

const active = await composio.triggers.listActive({
  connectedAccountIds: ['ca_def456'],
});

for (const trigger of active.items) {
  console.log(`${trigger.id} (${trigger.triggerName}) - disabled: ${trigger.disabledAt !== null}`);

// Paginate with cursor
if (active.nextCursor) {
  const nextPage = await composio.triggers.listActive({ cursor: active.nextCursor });

```

| Filter                                          | Description                                  |
| ----------------------------------------------- | -------------------------------------------- |
| `connected_account_ids` / `connectedAccountIds` | Array of connected account IDs               |
| `trigger_ids` / `triggerIds`                    | Array of trigger instance IDs                |
| `trigger_names` / `triggerNames`                | Array of trigger type slugs                  |
| `auth_config_ids` / `authConfigIds`             | Array of auth config IDs                     |
| `show_disabled` / `showDisabled`                | Include disabled triggers (default: `false`) |

# Enable / Disable triggers

Pause a trigger temporarily without deleting it:

**Python:**

```python
# Disable a trigger
composio.triggers.disable(trigger_id="ti_abcd123")

# Re-enable when needed
composio.triggers.enable(trigger_id="ti_abcd123")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio();
// Disable a trigger
await composio.triggers.disable('ti_abcd123');

// Re-enable when needed
await composio.triggers.enable('ti_abcd123');
```

You can also toggle triggers from the dashboard:

1. Go to [Auth Configs](https://platform.composio.dev?next_page=/auth-configs) and select your auth config
2. Navigate to **Active Triggers**
3. Toggle the trigger on or off

![Enable/disable triggers from the dashboard](/images/trigger-enable-disable.png)
*Enable/disable triggers from the dashboard*

# Deleting triggers

Permanently remove a trigger instance:

**Python:**

```python
composio.triggers.delete(trigger_id="ti_abcd123")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio();
await composio.triggers.delete('ti_abcd123');
```

> Deleting a trigger is permanent. Use `disable()` instead to temporarily stop receiving events.

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

