# General FAQs (/docs/common-faq)

**Can I white label Composio's auth screens?**

Yes. By default, OAuth consent screens show "Composio" as the app name. If you create an auth config with your own OAuth client ID and secret, users will see your app's name and logo instead.

You can also proxy the OAuth redirect through your own domain so users never see `backend.composio.dev` in the URL bar. See [White-labeling authentication](/docs/white-labeling-authentication).

**What is the difference between a tool and a toolkit?**

A **toolkit** is a collection of related tools grouped by app, for example the GitHub toolkit or the Gmail toolkit. A **tool** is a single action within a toolkit, like `GITHUB_CREATE_ISSUE` or `GMAIL_SEND_EMAIL`.

You connect to toolkits (via OAuth or API keys), and then execute individual tools within them. See [Tools and toolkits](/docs/tools-and-toolkits).

**Do I need an AI agent to use Composio?**

No. If you're building an AI agent, Composio can give it [meta tools](/docs/quickstart) that handle tool discovery and execution automatically, or you can [fetch specific tools](/docs/tools-direct/fetching-tools) and pass them to your agent directly.

If you don't have an agent, you can [execute tools directly](/docs/tools-direct/executing-tools#direct-tool-execution) from any backend.

**Where can I see all available toolkits?**

You can browse all toolkits on the [Toolkits page](/toolkits) in the docs or in the [Composio dashboard](https://platform.composio.dev?next_page=/marketplace). Both list every supported app along with available auth schemes and tools.

**The tool I need doesn't exist. How do I request one?**

You can request new tools or toolkits on the [tool request board](https://request.composio.dev/boards/tool-requests). The team reviews requests regularly.

**What is User ID and how should I use it?**

The User ID is how Composio identifies your end users. It maps each user to their connected accounts and sessions. Use any unique identifier from your system, like an email, database ID, or UUID.

When you create a session with `composio.create(user_id="user_123")`, all connected accounts and tool executions are scoped to that user. See [Users and sessions](/docs/users-and-sessions).

**What is an auth config?**

An auth config is a blueprint that defines how authentication works for a toolkit. It specifies the auth method (OAuth2, API Key, etc.), the scopes to request, and the credentials to use.

If you're using sessions with meta tools (`composio.create()`), you don't need to create auth configs yourself. When a user connects to a toolkit, Composio automatically uses a default auth config with managed credentials. The agent handles the entire flow through `COMPOSIO_MANAGE_CONNECTIONS`.

You only need to create auth configs manually when you're [executing tools directly](/docs/tools-direct/authenticating-tools), want to [use your own OAuth app](/docs/white-labeling-authentication), need [custom scopes](/docs/auth-configuration/custom-auth-configs), or are working with a toolkit that doesn't have Composio-managed auth. See [Authentication](/docs/authentication) for the full overview.

**What authentication types does Composio support?**

Composio supports **OAuth2**, **OAuth1**, **API Key**, **Bearer Token**, and **Basic Auth**. Most toolkits use OAuth2. Each toolkit defines which auth types it supports. You can see the available schemes when creating an auth config in the dashboard.

For toolkits with Composio-managed auth, you don't need to configure anything. For toolkits without it, you'll need to create a [custom auth config](/docs/using-custom-auth-configuration). See [Authentication](/docs/authentication) for the full overview.

**How do I work with toolkit versions?**

Composio toolkits are versioned using date-based identifiers (e.g., `20251027_00`). You can pin versions at SDK initialization or per tool execution to keep behavior consistent across deployments.

This applies to direct tool execution only. Sessions with meta tools always use the latest version. See [Toolkit versioning](/docs/tools-direct/toolkit-versioning).

**Can a user connect multiple accounts for the same app?**

Yes. For example, a user can connect both a personal and work Gmail account. Call `session.authorize()` multiple times for the same toolkit. Each session uses the most recently connected account by default, but you can pin a specific account when creating the session.

For direct tool execution, use `initiate()` with `allow_multiple: true` and pass the `connected_account_id` when executing. See [Managing multiple connected accounts](/docs/managing-multiple-connected-accounts).

**How does token refresh work?**

Composio automatically refreshes OAuth tokens before they expire. You don't need to handle this yourself.

If a refresh fails permanently (e.g., the user revoked access or the OAuth app was deleted), the connection status changes to `EXPIRED`. You can [subscribe to expiry events](/docs/subscribing-to-connection-expiry-events) to detect this and prompt users to re-authenticate. See [Connection statuses](/docs/tools-direct/authenticating-tools#connection-statuses) for more details.

**Does Composio support triggers?**

Yes. Triggers let you listen for events from connected apps, like a new email in Gmail, a new issue in GitHub, or a new message in Slack. When the event fires, Composio sends a webhook to your endpoint with the event payload.

See [Triggers](/docs/triggers) for setup and [Subscribing to triggers](/docs/setting-up-triggers/subscribing-to-events) for receiving events.

**Why are my connected account secrets showing `abcd...` or `REDACTED`?**

Connected account secrets are masked by default for security. The API returns the first 4 characters followed by `...` (e.g., `gho_...`). Values shorter than 4 characters show as `REDACTED`.

To disable masking, go to **Settings → Project Settings → Project Configuration** and turn off "Mask Connected Account Secrets", or use the Patch Project Config API.

See [Connected accounts](/docs/auth-configuration/connected-accounts#get-account-credentials) for full details.

**Where can I find execution logs?**

Every tool execution is logged in the [Composio dashboard](https://platform.composio.dev?next_page=/logs/tools) under **Logs > Tools**. Each execution response includes a `log_id` you can use to look up detailed request and response data. Trigger delivery attempts are logged separately under **Logs > Triggers**.

See [Troubleshooting tools](/docs/troubleshooting/tools) for how to use logs to debug failed executions.

**How do I redirect users back to my app after they connect?**

Pass a `callbackUrl` when calling `link()`, `initiate()`, or `session.authorize()`. After authentication, Composio redirects the user to that URL with `status=success` or `status=failed` and the `connected_account_id` appended as query parameters.

You can include your own query parameters in the callback URL (e.g., `?user_id=user_123&source=onboarding`) to carry context through the flow. Composio preserves them. See [sessions](/docs/authenticating-users/manually-authenticating#redirecting-users-after-authentication) or [direct tool setup](/docs/tools-direct/authenticating-tools#redirecting-users-after-authentication).

**How do I use my own API key for a toolkit instead of asking each user for theirs?**

For toolkits that require API keys (like Tavily, Perplexity, or ImgBB), you can create connections on behalf of your users by passing your own API key through `connectedAccounts.initiate()`. This way, your users get access to the service without needing to provide their own credentials.

Create an auth config for the toolkit, then call `initiate()` with your API key and each user's ID:

**Python:**

```python
connection = composio.connected_accounts.initiate(
  user_id="user_123",
  auth_config_id="your_auth_config_id",
  config={
    "auth_scheme": "API_KEY", "val": {"api_key": "your_own_api_key"}

)
```

**TypeScript:**

```typescript
import { Composio, AuthScheme } from '@composio/core';

declare const composio: Composio;
const connection = await composio.connectedAccounts.initiate('user_123', 'your_auth_config_id', {
  config: AuthScheme.APIKey({
    api_key: 'your_own_api_key',
  }),
});
```

Each user gets their own connected account scoped to their `user_id`, but they all share your API key under the hood. See [API key connections](/docs/tools-direct/authenticating-tools#api-key-connections) for the full setup.

**Is Composio secure? Where can I find compliance details?**

Yes. Composio is SOC 2 Type II compliant and follows industry-standard security practices for data handling, encryption, and access control. Visit the [Composio Trust Center](https://trust.composio.dev/) for detailed compliance reports, security policies, and certifications.

**What is the IP range for Composio's MCP servers?**

Composio does not have fixed IP ranges. Traffic is routed through Cloudflare and Vercel, which use dynamic IPs.

**How do I increase my quota?**

Upgrade your plan. See [pricing](https://composio.dev/pricing) for available plans and limits.

**When should I create a new session?**

Create a new session when the config changes: different toolkits, different auth config, or a different connected account. You don't need to store or manage session IDs. Just call `create()` each time. See [Users and sessions](/docs/users-and-sessions).

**How do I configure sessions with custom auth configs?**

Some toolkits require your own OAuth credentials or API keys. Create an auth config in the dashboard by selecting the toolkit, choosing the auth scheme, and entering your credentials. Then pass the auth config ID when creating a session using the `auth_configs` (or `auth_config_id`) parameter so the session uses your developer credentials instead of Composio-managed auth. See [Using custom auth configuration](/docs/using-custom-auth-configuration).

**How do I check complete logs / API calls from the SDK?**

Enable debug logging to view all API calls and network requests made by the SDK.

Python:

```bash
COMPOSIO_LOGGING_LEVEL=debug
```

TypeScript:

```bash
COMPOSIO_LOG_LEVEL=debug
```

See [Troubleshooting SDKs](/docs/troubleshooting/sdks).

**Can Composio be self-hosted?**

Yes, Composio supports self-hosting on the Enterprise plan. See [pricing](https://composio.dev/pricing) for details or [talk to us](https://calendly.com/composiohq/enterprise).

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

