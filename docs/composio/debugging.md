# Debugging Info (/docs/debugging-info)

Your debugging info is tied to your project and it helps us trace what happened and debug the issue faster.

# Finding Your Debugging Info

Navigate to your project settings to find your debugging information:

![Project Settings Debugging Info](/images/project-settings.jpeg)

![Debugging Info Location](/images/debugging-info.png)

# What to Share

When reaching out for support, share these identifiers:

```
@project_id: pr_xxxxxxxxxxxxx
@org_id: ok_xxxxxxxxxxxxx
@org_member_email: your-email@example.com
```

The identifiers with `pr_` (project) and `ok_` (organization) prefixes let us quickly check your logs inside our internal tracing tools, helping us resolve issues faster.

# Getting Help

import { MessageCircle, Bug, Mail, Grip } from 'lucide-react';

- [Join Discord](https://discord.gg/composio): }>
Get basic support from the community and Composio team

  - [Request Tools](https://request.composio.dev): }>
Request new tools and toolkits

  - [File an Issue](https://github.com/ComposioHQ/composio/issues): }>
Report SDK issues and bugs

  - [Contact Support](mailto:support@composio.dev): }>
Reach out for dedicated support channels on Growth and Enterprise plans

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



# Debugging Info (/docs/debugging-info)

Your debugging info is tied to your project and it helps us trace what happened and debug the issue faster.

# Finding Your Debugging Info

Navigate to your project settings to find your debugging information:

![Project Settings Debugging Info](/images/project-settings.jpeg)

![Debugging Info Location](/images/debugging-info.png)

# What to Share

When reaching out for support, share these identifiers:

```
@project_id: pr_xxxxxxxxxxxxx
@org_id: ok_xxxxxxxxxxxxx
@org_member_email: your-email@example.com
```

The identifiers with `pr_` (project) and `ok_` (organization) prefixes let us quickly check your logs inside our internal tracing tools, helping us resolve issues faster.

# Getting Help

import { MessageCircle, Bug, Mail, Grip } from 'lucide-react';

- [Join Discord](https://discord.gg/composio): }>
Get basic support from the community and Composio team

  - [Request Tools](https://request.composio.dev): }>
Request new tools and toolkits

  - [File an Issue](https://github.com/ComposioHQ/composio/issues): }>
Report SDK issues and bugs

  - [Contact Support](mailto:support@composio.dev): }>
Reach out for dedicated support channels on Growth and Enterprise plans

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

