# How Composio works (/docs/how-composio-works)

Composio connects AI agents to external services like GitHub, Gmail, and Slack. Your agent gets a small set of meta tools that can discover, authenticate, and execute tools across hundreds of apps at runtime.

This page covers sessions, the meta tool pattern, authentication, and how tools execute. For setup, see the [quickstart](/docs/quickstart). For detailed concepts, see [Users & Sessions](/docs/users-and-sessions) and [Tools and toolkits](/docs/tools-and-toolkits).

# Sessions

When your app calls `composio.create()`, it creates a session scoped to a user.

```python
composio = Composio()
session = composio.create(user_id="user_123")

# Get tools formatted for your provider
tools = session.tools()

# Or get the MCP endpoint for MCP-compatible frameworks
mcp_url = session.mcp.url
mcp_headers = session.mcp.headers
```

A session ties together:

* **A user**: whose credentials and connections to use
* **Available toolkits**: all by default, or a specific set you configure
* **Auth configuration**: which authentication method and connected accounts to use

Sessions are immutable. Their configuration is fixed at creation. If the context changes (different toolkits, different connected account), create a new session. You don't need to cache or manage session IDs.

- [Users & Sessions](/docs/users-and-sessions): How users and sessions scope tools and connections

# Meta tools

Rather than loading hundreds of tool definitions into your agent's context, a session provides 5 meta tools:

| Meta tool                     | What it does                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `COMPOSIO_SEARCH_TOOLS`       | Finds relevant tools by use case, returns input schemas, connection status, execution plan, and related tools |
| `COMPOSIO_MANAGE_CONNECTIONS` | Generates Connect Links for OAuth and API key authentication                                                  |
| `COMPOSIO_MULTI_EXECUTE_TOOL` | Executes up to 20 tools in parallel with the user's credentials                                               |
| `COMPOSIO_REMOTE_WORKBENCH`   | Runs Python code in a [persistent sandbox](/docs/workbench)                                                   |
| `COMPOSIO_REMOTE_BASH_TOOL`   | Runs bash commands in the same sandbox for file operations and data processing                                |

Meta tool calls within a session share context through a `session_id`. The agent can search for a tool in one call and execute it in the next without losing state. Tools can also store information (IDs, relationships) in memory for subsequent calls.

## How they work together

The meta tools are how the agent reaches the actual toolkit tools:

`SEARCH_TOOLS` discovers the right toolkit tools for the task. `MULTI_EXECUTE_TOOL` runs them against the external API with the user's credentials. If the user isn't authenticated yet, `MANAGE_CONNECTIONS` handles that in between.

For large responses or bulk operations (labeling hundreds of emails, processing CSVs), the agent uses `COMPOSIO_REMOTE_WORKBENCH` to run Python with helper functions like `invoke_llm` and `run_composio_tool`.

- [Tools and toolkits](/docs/tools-and-toolkits): Meta tools, context management, and execution

# Authentication

When a tool requires authentication and the user hasn't connected yet, the agent uses `COMPOSIO_MANAGE_CONNECTIONS` to generate a **Connect Link**, a hosted page where the user authorizes access.

In a conversation, this looks like:

> **You:** Create a GitHub issue for the login bug
>
> **Agent:** You'll need to connect your GitHub account. Please authorize here: \
>
> **You:** Done
>
> **Agent:** Created issue #42 on your-org/your-repo.

Composio manages the OAuth flow end to end: redirects, authorization codes, token exchange, and automatic token refresh before expiration. Credentials are encrypted and scoped to user IDs.

Connections persist across sessions. A user who connects GitHub once can use it in every future session without re-authenticating. Users can also connect multiple accounts for the same service (work and personal Gmail, for example).

For apps that manage auth outside of chat, like during onboarding or on a settings page, use `session.authorize()` to generate Connect Links programmatically and wait for the user to complete the flow.

- [Authentication](/docs/authentication): Connect Links, OAuth, API keys, and custom auth configs

  - [Manual authentication](/docs/authenticating-users/manually-authenticating): Authenticate users outside of chat with session.authorize()

# Tool execution

When the agent calls `COMPOSIO_MULTI_EXECUTE_TOOL`, Composio resolves the session to look up the user and their connections, validates the input against the tool's schema, injects the user's OAuth token or API key, calls the external API, and returns a structured result.

Your agent doesn't touch API credentials or handle token refresh. Composio resolves credentials from the session and connected account, makes the authenticated call, and returns the result.

# Direct tool execution

If you know exactly which tools you need, you can skip the meta tool pattern and execute tools directly:

```python
composio = Composio()

tools = composio.tools.get(
    user_id="user_123",
    toolkits=["github"]
)

result = composio.tools.execute(
    "GITHUB_STAR_REPOSITORY",
    user_id="user_123",
    arguments={"owner": "composiohq", "repo": "composio"}
)
```

This is useful for deterministic workflows where the agent doesn't need to discover tools at runtime.

- [Direct tool execution](/docs/tools-direct/executing-tools): Fetch, authenticate, and execute tools without meta tools

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



# Users & Sessions (/docs/users-and-sessions)

When building AI agents for multiple users, each user needs their own connections and context. This is represented through **users** and **sessions**.

# Users

A user is an identifier from your app. When someone connects their Gmail or GitHub, that connection is stored under their user ID, so tools always run with the right authentication. Every tool execution and authorization uses the user ID to identify the context. Connections are fully isolated between user IDs.

**Best practices for User IDs**

    * **Recommended:** Database UUID or primary key (`user.id`)
    * **Acceptable:** Unique username (`user.username`)
    * **Avoid:** Email addresses (they can change)
    * **Never:** `default` in production (exposes other users' data)

A user can have multiple connections to the same toolkit.
Let's say you want to allow users to connect both their work and personal email. You can represent the user with the same user ID but differentiate between the two with the connected
account ID.

Here is a detailed guide on how to manage such connections:

- [Managing Multiple Connections](/docs/managing-multiple-connected-accounts): Handle multiple accounts per toolkit for a single user

Triggers are scoped to a connected account. When you create a trigger, it's tied to a specific user's connection:

- [Triggers](/docs/triggers): Event-driven payloads from connected apps

# Sessions

A session is an ephemeral configuration. You specify:

* Which user's authorization and data the agent will access
* What toolkits are enabled or disabled
* What authentication method, scopes, and credentials to use

## Creating a session

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

## Session methods

Once created, a session provides methods to get tools and manage connections:

**Python:**

```python
# Get tools for your AI framework
tools = session.tools()

# Get MCP server URL
mcp_url = session.mcp.url

# Authenticate a user to a toolkit
connection_request = session.authorize("github")

# List available toolkits and their connection status
toolkits = session.toolkits()
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
// Get tools for your AI framework
const tools = await session.tools();

// Get MCP server URL
const mcpUrl = session.mcp.url;

// Authenticate a user to a toolkit
const connectionRequest = await session.authorize("github");

// List available toolkits and their connection status
const toolkits = await session.toolkits();
```

# How sessions behave

A session ties together a user, a set of available toolkits, auth configuration for those toolkits, and connected accounts. Call `create()` whenever you want to do a task. Each session is designed for a particular agentic task, and if you want to change the context of the task, create a new session.

You don't need to cache session IDs, manage session lifetimes, or worry about expiration. Sessions persist on the server and don't expire. Just call `create()` with what you need.

## Sessions are immutable

A session's configuration is fixed at creation. You cannot change the toolkits, auth configs, or connected accounts on an existing session.

This means the boundary for a new session isn't a new chat or a new request. It's when the contract changes. If a user starts with "search my personal Gmail" and then says "actually use my work email," that's a different session because the auth changed.

## Connected accounts persist across sessions

Connections are tied to the user ID, not the session. A user who connected Gmail in one session can access it in every future session without re-authenticating.

**When should I create a new session?**

Create a new session when the config changes: different toolkits, different auth config, or a different connected account. You don't need to store or manage session IDs. Just call `create()` each time.

- [Configuring Sessions](/docs/configuring-sessions): Enable toolkits, set auth configs, and select connected accounts

  - [Workbench](/docs/workbench): Write and run code in a persistent sandbox

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



# Authentication (/docs/authentication)

Composio simplifies authentication with Connect Links: hosted pages where users securely connect their accounts.

# In-chat authentication

By default, when a tool requires authentication, the agent prompts the user with a Connect Link. The user authenticates and confirms in chat. The agent handles OAuth flows, token refresh, and credential management automatically.

Here's what this looks like in a conversation:

> **You:** Summarize my emails from today
>
> **Agent:** I need you to connect your Gmail account first. Please click here to authorize: [https://connect.composio.dev/link/ln\_abc123](https://connect.composio.dev/link/ln_abc123)
>
> **You:** Done
>
> **Agent:** Here's a summary of your emails from today...

This flow works well for chat applications where users interact directly with the agent.

- [In-chat authentication](/docs/authenticating-users/in-chat-authentication): 
Let the agent handle authentication prompts automatically during conversation

# Manual authentication

For apps that manage auth outside of chat, use `session.authorize()` to generate Connect Links programmatically. This is useful when you want users to connect accounts during onboarding, or when building a custom connections page.

- [Manual authentication](/docs/authenticating-users/manually-authenticating): 
Control when and how users connect their accounts

# How Composio manages authentication

Behind the scenes, Composio uses **auth configs** to manage authentication.

An **auth config** is a blueprint that defines how authentication works for a toolkit across all your users. It specifies:

* **Authentication method** — OAuth2, Bearer token, API key, or Basic Auth
* **Scopes** — what actions your tools can perform
* **Credentials** — your own app credentials or Composio's managed auth

Composio creates one auth config per toolkit, and it applies to every user who connects that toolkit. When a user authenticates, Composio creates a **connected account** that stores their credentials (OAuth tokens or API keys) and links them to your user ID. When you need to use your own OAuth credentials or customize scopes, you can create [custom auth configs](/docs/using-custom-auth-configuration).

<b>ac_gmail_oauth2</b>&#x22;]

subgraph user_1
CA1[&#x22;Work Gmail · <b>ca_1a2b3c</b>&#x22;]
CA2[&#x22;Personal Gmail · <b>ca_4d5e6f</b>&#x22;]
end

subgraph user_2
CA3[&#x22;Gmail · <b>ca_7g8h9i</b>&#x22;]
end

AC --> CA1
AC --> CA2
AC --> CA3"
/>

Composio handles this automatically:

1. When a toolkit needs authentication, we create an auth config using Composio managed credentials
2. The auth config is reused for all users authenticating with that toolkit
3. Connected accounts are created and linked to your users

**What are connected accounts?**

A connected account is created when a user authenticates with a toolkit. It stores the user's credentials (OAuth tokens or API keys) and links them to your user ID. Each user can have multiple connected accounts, even for the same toolkit (e.g., work and personal Gmail).

**What happens when tokens expire?**

Composio automatically refreshes OAuth tokens before they expire. You don't need to handle re-authentication or token expiration. Connected accounts stay valid as long as the user doesn't revoke access.

Most toolkits work out of the box with **Composio managed OAuth**. For API key-based toolkits, users enter their keys directly via Connect Link.

You only need to create a custom auth config when:

* You want to use your **own OAuth app credentials** for white-labeling
* You need **specific OAuth scopes** beyond the defaults
* The toolkit doesn't have Composio managed auth
* You have **existing auth configs** with connected accounts you want to use

To bring your own OAuth apps or customize scopes, see [custom auth configs](/docs/using-custom-auth-configuration).

# Useful links

- [In-chat authentication](/docs/authenticating-users/in-chat-authentication): 
Let the agent prompt users to authenticate during conversation

  - [Manual authentication](/docs/authenticating-users/manually-authenticating): 
Generate Connect Links programmatically in your app

  - [White-labeling](/docs/white-labeling-authentication): 
Customize OAuth screens with your branding

  - [Custom auth configs](/docs/using-custom-auth-configuration): 
Use your own OAuth apps

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



# Tools and toolkits (/docs/tools-and-toolkits)

Composio offers 1000+ toolkits, but loading all the tools into context would overwhelm your agent. Instead, your agent has access to 5 meta tools that discover, authenticate, and execute the right tools at runtime.

# Meta tools

When you create a session, your agent gets these 5 meta tools:

| Meta tool                     | What it does                                               |
| ----------------------------- | ---------------------------------------------------------- |
| `COMPOSIO_SEARCH_TOOLS`       | Discover relevant tools across 1000+ apps                  |
| `COMPOSIO_MANAGE_CONNECTIONS` | Handle OAuth and API key authentication                    |
| `COMPOSIO_MULTI_EXECUTE_TOOL` | Execute up to 20 tools in parallel                         |
| `COMPOSIO_REMOTE_WORKBENCH`   | Run Python code in a [persistent sandbox](/docs/workbench) |
| `COMPOSIO_REMOTE_BASH_TOOL`   | Execute bash commands for file and data processing         |

Meta tool calls in a session are correlated using a `session_id`, allowing them to share context. The tools can also store useful information (like IDs and relationships discovered during execution) in memory for subsequent calls.

## How it works

```
User: "Create a GitHub issue for this bug"
    ↓
1. Agent calls COMPOSIO_SEARCH_TOOLS
   → Returns GITHUB_CREATE_ISSUE with input schema
   → Returns connection status: "not connected"
   → Returns execution plan and tips
    ↓
2. Agent calls COMPOSIO_MANAGE_CONNECTIONS (because not connected)
   → Returns auth link for GitHub
   → User clicks link and authenticates
    ↓
3. Agent calls COMPOSIO_MULTI_EXECUTE_TOOL
   → Executes GITHUB_CREATE_ISSUE with arguments
   → Returns the created issue details
    ↓
Done. (For large results, agent can use REMOTE_WORKBENCH to process)
```

## What SEARCH\_TOOLS returns

`COMPOSIO_SEARCH_TOOLS` returns:

* **Tools with schemas** - Matching tools with their slugs, descriptions, and input parameters
* **Connection status** - Whether the user has already authenticated with each toolkit
* **Execution plan** - Recommended steps and common pitfalls for the task
* **Related tools** - Prerequisites, alternatives, and follow-up tools

## Processing large results

For most tasks, `COMPOSIO_MULTI_EXECUTE_TOOL` returns results directly. But when dealing with large responses or bulk operations, your agent uses the workbench tools:

* **`COMPOSIO_REMOTE_WORKBENCH`** - Run Python code in a [persistent sandbox](/docs/workbench). Use for bulk operations (e.g., labeling 100 emails), complex data transformations, or when results need further analysis with helper functions like `invoke_llm`.

* **`COMPOSIO_REMOTE_BASH_TOOL`** - Execute bash commands for simpler file operations and data extraction using tools like `jq`, `awk`, `sed`, and `grep`.

# Toolkits and tools

A **toolkit** is a collection of related tools for a service. For example, the `github` toolkit contains tools for creating issues, managing pull requests, and starring repositories.

A **tool** is an individual action your agent can execute. Each tool has an input schema (required and optional parameters) and an output schema (what it returns). Tools follow a `{TOOLKIT}_{ACTION}` naming pattern, like `GITHUB_CREATE_ISSUE`.

> If you know exactly which tools you need, you can [execute them directly](/docs/tools-direct/executing-tools) without meta tools.

# Authentication

Tools execute with the user's authenticated credentials. When a user connects their GitHub account, all GitHub tools run with their permissions.

If a tool requires authentication and the user hasn't connected yet, the agent can use `COMPOSIO_MANAGE_CONNECTIONS` to prompt them.

- [Authentication](/docs/authentication): 
Learn how Composio handles user authentication

# Useful links

- [Browse toolkits](/toolkits): 
Explore all available toolkits

  - [Fetching tools](/docs/toolkits/fetching-tools-and-toolkits): 
Browse the catalog and fetch tools for sessions

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



# Workbench (/docs/workbench)

The workbench is a persistent Python sandbox where your agent can write and execute code. It has access to all Composio tools programmatically, plus helper functions for calling LLMs, uploading files, and making API requests. State persists across calls within a session. The `COMPOSIO_REMOTE_BASH_TOOL` meta tool also runs commands in the same sandbox.

> The workbench is part of the meta tools system. It's available when you create sessions, not when [executing tools directly](/docs/tools-direct/executing-tools).

# Where it fits

Your agent starts with `SEARCH_TOOLS` to find the right tools, then uses `MULTI_EXECUTE` for straightforward calls. When the task involves bulk operations, data transformations, or multi-step logic, the agent uses `COMPOSIO_REMOTE_WORKBENCH` instead.

# What the sandbox provides

## Built-in helpers

These functions are pre-initialized in every sandbox:

| Helper               | What it does                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `run_composio_tool`  | Execute any Composio tool (e.g., `GMAIL_SEND_EMAIL`, `SLACK_SEND_MESSAGE`) and get structured results |
| `invoke_llm`         | Call an LLM for classification, summarization, content generation, or data extraction                 |
| `upload_local_file`  | Upload generated files (reports, CSVs, images) to cloud storage and get a download URL                |
| `proxy_execute`      | Make direct API calls to connected services when no pre-built tool exists                             |
| `web_search`         | Search the web and return results for research or data enrichment                                     |
| `smart_file_extract` | Extract text from PDFs, images, and other file formats in the sandbox                                 |

## Libraries

Common packages like pandas, numpy, matplotlib, Pillow, PyTorch, and reportlab are pre-installed. Beyond these, the workbench maintains a list of supported packages and their dependencies. If the agent uses a package that isn't already installed, the workbench attempts to install it automatically.

## Error correction

The workbench corrects common mistakes in the code your agent generates. For example, if a script accesses `result["apiKey"]` but the actual field name is `api_key`, the workbench resolves the mismatch instead of failing.

## Persistent state

The sandbox runs as a persistent Jupyter notebook. Variables, imports, files, and in-memory state from one call are available in the next.

# Common patterns

## Bulk operations across apps

Some tasks touch hundreds of items across services. Say you need to triage 150 unread emails. The agent writes a workbench script: classify each email with `invoke_llm`, apply Gmail labels with `run_composio_tool`, and log results to a Google sheet.

## Data analysis and reporting

The agent can chain tools inside the sandbox. Fetch GitHub activity, aggregate with pandas, chart with matplotlib, summarize with `invoke_llm`, upload a PDF with `upload_local_file`.

## Multi-step workflows

The sandbox preserves variables and files across calls. The agent can paginate through records, transform them, and write to a destination over multiple calls.

# Related

- [Tools and toolkits](/docs/tools-and-toolkits): 
How meta tools discover, authenticate, and execute tools at runtime

  - [Browse toolkits](/toolkits): 
Explore all available toolkits

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



# Triggers (/docs/triggers)

When events occur in apps, like a new Slack message, a GitHub commit, or an incoming email, triggers send event data to your application as structured payloads.

![Triggers flow: Connected apps send events to Composio, which delivers them to your webhook endpoint via HTTP POST](/images/triggers-flow.svg)
*How triggers deliver events from apps to your application*

There are two delivery types:

* **Webhook triggers**: Apps like GitHub and Slack push events to Composio in real time. When an event fires, Composio forwards the payload to your webhook endpoint.
* **Polling triggers**: For apps that don't support outgoing webhooks (e.g., Gmail), Composio polls for new data every minute. Expect small delays between the event and delivery.

# Working with triggers

1. **Configure** your webhook endpoint so Composio knows where to deliver events
2. **Discover** available trigger types for a toolkit (e.g., `GITHUB_COMMIT_EVENT`)
3. **Create** an active trigger scoped to a user's connected account
4. **Receive events**: Composio sends payloads to your endpoint
5. **Manage**: enable, disable, or delete triggers as needed

**What is a trigger type?**

A trigger type is a template that defines what event to listen for and what configuration is required. For example, `GITHUB_COMMIT_EVENT` requires an `owner` and `repo`. Each toolkit exposes its own set of trigger types.

**What happens when you create an active trigger?**

When you create a trigger from a type, it's scoped to a specific user and connected account. For example, creating a `GITHUB_COMMIT_EVENT` trigger for user `alice` on the `composio` repo produces a trigger with its own ID.

# Next steps

- [Creating triggers](/docs/setting-up-triggers/creating-triggers): Create trigger instances via the dashboard or SDK

  - [Subscribing to events](/docs/setting-up-triggers/subscribing-to-events): Receive trigger events via webhooks or SDK subscriptions

  - [Verifying webhooks](/docs/webhook-verification): Verify webhook signatures and understand payload versions

  - [Managing triggers](/docs/setting-up-triggers/managing-triggers): Discover, list, enable, disable, and delete triggers

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

