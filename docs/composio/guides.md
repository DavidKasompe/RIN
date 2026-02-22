# White-labeling authentication (/docs/white-labeling-authentication)

White-labeling lets you use your own OAuth apps instead of Composio's. Users will see your app name on consent screens instead of "Composio".

By default, OAuth screens show Composio's branding. With white-labeling, they'll see your app name and logo.

#### Create an OAuth app

Create a developer app in the toolkit's developer portal. You'll need the client ID and client secret. Set the callback URL to:

```
https://backend.composio.dev/api/v3/toolkits/auth/callback
```

> For step-by-step guides on creating OAuth apps for some toolkits, see [composio.dev/auth](https://composio.dev/auth).

#### Create auth config

Create an auth config in the [Composio dashboard](https://platform.composio.dev):

    1. Go to **Authentication management** → **Create Auth Config**
    2. Select the toolkit (e.g., GitHub)
    3. Choose **OAuth2** scheme
    4. Enter your **Client ID** and **Client Secret**
    5. Select the scopes you need
    6. Click **Create**

Copy the auth config ID (e.g., `ac_1234abcd`).

> For detailed instructions with screenshots, see [Custom auth configs](/docs/auth-configuration/custom-auth-configs).

#### Use in your session

Pass your auth config ID in the session:

**Python:**

```python
session = composio.create(
    user_id="user_123",
    auth_configs={
        "github": "ac_your_github_config"
    },
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123", {
  authConfigs: {
    github: "ac_your_github_config",
  },
});
```

When users connect GitHub, they'll see your OAuth app's name and logo on the consent screen.

# Mixing custom and Composio-managed auth

You can white-label some toolkits while using Composio's managed credentials for others:

**Python:**

```python
session = composio.create(
    user_id="user_123",
    auth_configs={
        "github": "ac_your_github_config",
        "slack": "ac_your_slack_config",
        # gmail, linear, etc. use Composio managed auth
    },
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
    // gmail, linear, etc. use Composio managed auth
  },
});
```

# Custom redirect domain

When users authenticate, they briefly see `backend.composio.dev` in their browser URL. Composio needs to receive the OAuth callback to capture and store the authentication tokens.

If you need to hide this URL (for enterprise compliance or complete white-labeling), you can proxy the redirect through your own domain:

1. Set your OAuth app's redirect URI to your domain:

```
https://yourdomain.com/api/composio-redirect
```

2. Create an endpoint that forwards the OAuth callback to Composio:

**Python:**

```python
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse

app = FastAPI()

@app.get("/api/composio-redirect")
def composio_redirect(request: Request):
    # Forward all OAuth parameters to Composio
    composio_url = "https://backend.composio.dev/api/v3/toolkits/auth/callback"
    return RedirectResponse(url=f"{composio_url}?{request.url.query}")
```

**TypeScript:**

```typescript
// pages/api/composio-redirect.ts (Next.js)
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Forward all OAuth parameters to Composio
  const composioUrl = "https://backend.composio.dev/api/v3/toolkits/auth/callback";
  const params = new URLSearchParams(req.query as Record<string, string>);
  res.redirect(302, `${composioUrl}?${params.toString()}`);

```

3. Update your auth config in the Composio dashboard to use your custom redirect URI.

This makes the OAuth flow go through your domain first, then to Composio for token storage.

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



# Managing multiple connected accounts (/docs/managing-multiple-connected-accounts)

Users can connect multiple accounts for the same toolkit (e.g., personal and work Gmail accounts). This is useful when users need to manage different email accounts, GitHub organizations, or separate work and personal contexts. This guide explains how to connect, select, and manage multiple accounts.

# Default account behavior

When multiple accounts are connected for the same toolkit:

* Each session can only use **one account per toolkit** at a time
* Sessions use the **most recently connected account** by default
* You can override this by explicitly selecting an account
* Each account maintains its own authentication and permissions

# Connecting multiple accounts

Call `session.authorize()` multiple times for the same toolkit. Each authorization creates a separate connected account with its own ID. The most recently connected account becomes the active one for that session. New sessions will also use the most recent account unless you [explicitly select a different one](#selecting-a-specific-account-for-a-session).

**Python:**

```python
session = composio.create(user_id="user_123")

# Connect first account (work)
work_auth = session.authorize("gmail")
print(f"Connect work Gmail: {work_auth.redirect_url}")
work_connection = work_auth.wait_for_connection()
print(f"Work account connected: {work_connection.id}")

# Connect second account (personal)
personal_auth = session.authorize("gmail")
print(f"Connect personal Gmail: {personal_auth.redirect_url}")
personal_connection = personal_auth.wait_for_connection()
print(f"Personal account connected: {personal_connection.id}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");

// Connect first account (work)
const workAuth = await session.authorize("gmail");
console.log(`Connect work Gmail: ${workAuth.redirectUrl}`);
const workConnection = await workAuth.waitForConnection();
console.log(`Work account connected: ${workConnection.id}`);

// Connect second account (personal)
const personalAuth = await session.authorize("gmail");
console.log(`Connect personal Gmail: ${personalAuth.redirectUrl}`);
const personalConnection = await personalAuth.waitForConnection();
console.log(`Personal account connected: ${personalConnection.id}`);
```

> Store the account IDs returned after connection to explicitly select accounts later.

# Selecting a specific account for a session

Each session can only use one account per toolkit at a time. To use a specific account in a session, pass it in the session config:

**Python:**

```python
# This session will use a specific Gmail account
session = composio.create(
    user_id="user_123",
    connected_accounts={
        "gmail": "ca_specific_account_id",  # Connected account ID
    },
)

# To switch accounts, create a new session with a different account ID
session2 = composio.create(
    user_id="user_123",
    connected_accounts={
        "gmail": "ca_different_account_id",  # Different account
    },
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
// This session will use a specific Gmail account
const session = await composio.create("user_123", {
  connectedAccounts: {
    gmail: "ca_specific_account_id",  // Connected account ID
  },
});

// To switch accounts, create a new session with a different account ID
const session2 = await composio.create("user_123", {
  connectedAccounts: {
    gmail: "ca_different_account_id",  // Different account
  },
});
```

# Listing all user accounts

To list all accounts a user has connected (not just the active one), see [List accounts](/docs/auth-configuration/connected-accounts#list-accounts).

# Viewing session's active account

Use `session.toolkits()` to see which account is currently active in the session:

**Python:**

```python
toolkits = session.toolkits()

for toolkit in toolkits.items:
    if toolkit.connection.connected_account:
        print(f"{toolkit.name}: {toolkit.connection.connected_account.id}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123");
const toolkits = await session.toolkits();

for (const toolkit of toolkits.items) {
  if (toolkit.connection?.connectedAccount) {
    console.log(`${toolkit.name}: ${toolkit.connection.connectedAccount.id}`);

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



# Using custom auth configuration (/docs/using-custom-auth-configuration)

Some toolkits don't have Composio managed authentication and require you to provide your own credentials. When sessions try to use these toolkits, an error will be thrown asking you to create an auth config.

#### Check if a toolkit needs custom credentials

In the [Composio platform](https://platform.composio.dev), go to "All Toolkits" and select the toolkit. If it shows no Composio managed auth schemes, you'll need to create an auth config.

#### Create an auth config

    1. Go to **Authentication management** in the [dashboard](https://platform.composio.dev)
    2. Click **Create Auth Config**
    3. Select the toolkit
    4. Choose the auth scheme (OAuth2, API Key, etc.)
    5. Enter your credentials (client ID, client secret, API key, etc.)
    6. Click **Create**

Copy the auth config ID (e.g., `ac_1234abcd`).

> For detailed instructions on getting credentials for specific toolkits, see [Custom auth configs](/docs/auth-configuration/custom-auth-configs).

#### Use in your session

Pass your auth config ID when creating a session:

**Python:**

```python
session = composio.create(
    user_id="user_123",
    auth_configs={
        "posthog": "ac_your_posthog_config"

)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const session = await composio.create("user_123", {
  authConfigs: {
    posthog: "ac_your_posthog_config",
  },
});
```

Your session will now use this auth config when users connect to this toolkit.

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



# Verifying webhooks (/docs/webhook-verification)

Composio signs every webhook request. Always verify signatures in production to ensure payloads are authentic.

# SDK verification

The SDK handles signature verification, payload parsing, and version detection (V1, V2, V3).

> Your webhook secret is returned **only once**: when you [create a webhook subscription](/reference/api-reference/webhooks/postWebhookSubscriptions) or [rotate the secret](/reference/api-reference/webhooks/postWebhookSubscriptionsByIdRotateSecret). If you didn't copy it at creation time, rotate it to get a new one. Store it securely as `COMPOSIO_WEBHOOK_SECRET`.

**Python:**

```python
try:
    result = composio.triggers.verify_webhook(
        id=request.headers.get("webhook-id", ""),
        payload=request.get_data(as_text=True),
        signature=request.headers.get("webhook-signature", ""),
        timestamp=request.headers.get("webhook-timestamp", ""),
        secret=os.getenv("COMPOSIO_WEBHOOK_SECRET", ""),
    )
    # result.version, result.payload, result.raw_payload
except Exception:
    return {"error": "Invalid signature"}, 401
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio();
const req = { headers: {} as Record<string, string>, body: '' };
try {
  const result = await composio.triggers.verifyWebhook({
    id: req.headers['webhook-id'],
    payload: req.body,
    signature: req.headers['webhook-signature'],
    timestamp: req.headers['webhook-timestamp'],
    secret: process.env.COMPOSIO_WEBHOOK_SECRET!,
  });
  // result.version, result.payload, result.rawPayload
} catch (error) {
  // Return 401

```

> An optional `tolerance` parameter (default: `300` seconds) controls how old a webhook can be before verification fails. Set to `0` to disable timestamp validation.

# Manual verification

If you are not using the Composio SDK and want to verify signatures manually.

> Your webhook secret is returned **only once**: when you [create a webhook subscription](/reference/api-reference/webhooks/postWebhookSubscriptions) or [rotate the secret](/reference/api-reference/webhooks/postWebhookSubscriptionsByIdRotateSecret). If you didn't copy it at creation time, rotate it to get a new one. Store it securely as `COMPOSIO_WEBHOOK_SECRET`.

Every webhook request includes three headers: `webhook-signature`, `webhook-id`, and `webhook-timestamp`. Use these along with the raw request body to verify the signature:

**Python:**

```python
import hmac
import hashlib
import base64
import json
import os

def verify_webhook(webhook_id: str, webhook_timestamp: str, body: str, signature: str) -> dict:
    secret = os.getenv("COMPOSIO_WEBHOOK_SECRET", "")
    signing_string = f"{webhook_id}.{webhook_timestamp}.{body}"
    expected = base64.b64encode(
        hmac.new(secret.encode(), signing_string.encode(), hashlib.sha256).digest()
    ).decode()
    received = signature.split(",", 1)[1] if "," in signature else signature
    if not hmac.compare_digest(expected, received):
        raise ValueError("Invalid webhook signature")

    payload = json.loads(body)
    # V3 payload
    return {
        "trigger_slug": payload["metadata"]["trigger_slug"],
        "data": payload["data"],

```

**TypeScript:**

```typescript
import crypto from 'crypto';
function verifyWebhook(
  webhookId: string,
  webhookTimestamp: string,
  body: string,
  signature: string
) {
  const secret = process.env.COMPOSIO_WEBHOOK_SECRET ?? '';
  const signingString = `${webhookId}.${webhookTimestamp}.${body}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signingString)
    .digest('base64');
  const received = signature.split(',')[1] ?? signature;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))) {
    throw new Error('Invalid webhook signature');

  const payload = JSON.parse(body);
  // V3 payload
  return {
    triggerSlug: payload.metadata.trigger_slug,
    data: payload.data,
  };

```

# Webhook payload versions

`verifyWebhook()` auto-detects the version. If you process payloads manually, here are the formats:

**V3 (default):**

Metadata is separated from event data. New organizations receive V3 payloads by default.

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

**V2 (legacy):**

Metadata fields are mixed into the `data` object alongside event data.

```json
"type": "github_commit_event",
"data": {
  "commit_sha": "a1b2c3d",
  "message": "fix: resolve null pointer",
  "author": "jane",
  "connection_id": "ca_def456",
  "connection_nano_id": "cn_abc123",
  "trigger_nano_id": "tn_xyz789",
  "trigger_id": "ti_xyz789",
  "user_id": "user-id-123435"
},
"timestamp": "2026-01-15T10:30:00Z",
"log_id": "log_abc123"

```

**V1 (legacy):**

```json
"trigger_name": "github_commit_event",
"trigger_id": "ti_xyz789",
"connection_id": "ca_def456",
"payload": {
  "commit_sha": "a1b2c3d",
  "message": "fix: resolve null pointer",
  "author": "jane"
},
"log_id": "log_abc123"

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



# Verifying webhooks (/docs/webhook-verification)

Composio signs every webhook request. Always verify signatures in production to ensure payloads are authentic.

# SDK verification

The SDK handles signature verification, payload parsing, and version detection (V1, V2, V3).

> Your webhook secret is returned **only once**: when you [create a webhook subscription](/reference/api-reference/webhooks/postWebhookSubscriptions) or [rotate the secret](/reference/api-reference/webhooks/postWebhookSubscriptionsByIdRotateSecret). If you didn't copy it at creation time, rotate it to get a new one. Store it securely as `COMPOSIO_WEBHOOK_SECRET`.

**Python:**

```python
try:
    result = composio.triggers.verify_webhook(
        id=request.headers.get("webhook-id", ""),
        payload=request.get_data(as_text=True),
        signature=request.headers.get("webhook-signature", ""),
        timestamp=request.headers.get("webhook-timestamp", ""),
        secret=os.getenv("COMPOSIO_WEBHOOK_SECRET", ""),
    )
    # result.version, result.payload, result.raw_payload
except Exception:
    return {"error": "Invalid signature"}, 401
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio();
const req = { headers: {} as Record<string, string>, body: '' };
try {
  const result = await composio.triggers.verifyWebhook({
    id: req.headers['webhook-id'],
    payload: req.body,
    signature: req.headers['webhook-signature'],
    timestamp: req.headers['webhook-timestamp'],
    secret: process.env.COMPOSIO_WEBHOOK_SECRET!,
  });
  // result.version, result.payload, result.rawPayload
} catch (error) {
  // Return 401

```

> An optional `tolerance` parameter (default: `300` seconds) controls how old a webhook can be before verification fails. Set to `0` to disable timestamp validation.

# Manual verification

If you are not using the Composio SDK and want to verify signatures manually.

> Your webhook secret is returned **only once**: when you [create a webhook subscription](/reference/api-reference/webhooks/postWebhookSubscriptions) or [rotate the secret](/reference/api-reference/webhooks/postWebhookSubscriptionsByIdRotateSecret). If you didn't copy it at creation time, rotate it to get a new one. Store it securely as `COMPOSIO_WEBHOOK_SECRET`.

Every webhook request includes three headers: `webhook-signature`, `webhook-id`, and `webhook-timestamp`. Use these along with the raw request body to verify the signature:

**Python:**

```python
import hmac
import hashlib
import base64
import json
import os

def verify_webhook(webhook_id: str, webhook_timestamp: str, body: str, signature: str) -> dict:
    secret = os.getenv("COMPOSIO_WEBHOOK_SECRET", "")
    signing_string = f"{webhook_id}.{webhook_timestamp}.{body}"
    expected = base64.b64encode(
        hmac.new(secret.encode(), signing_string.encode(), hashlib.sha256).digest()
    ).decode()
    received = signature.split(",", 1)[1] if "," in signature else signature
    if not hmac.compare_digest(expected, received):
        raise ValueError("Invalid webhook signature")

    payload = json.loads(body)
    # V3 payload
    return {
        "trigger_slug": payload["metadata"]["trigger_slug"],
        "data": payload["data"],

```

**TypeScript:**

```typescript
import crypto from 'crypto';
function verifyWebhook(
  webhookId: string,
  webhookTimestamp: string,
  body: string,
  signature: string
) {
  const secret = process.env.COMPOSIO_WEBHOOK_SECRET ?? '';
  const signingString = `${webhookId}.${webhookTimestamp}.${body}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signingString)
    .digest('base64');
  const received = signature.split(',')[1] ?? signature;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))) {
    throw new Error('Invalid webhook signature');

  const payload = JSON.parse(body);
  // V3 payload
  return {
    triggerSlug: payload.metadata.trigger_slug,
    data: payload.data,
  };

```

# Webhook payload versions

`verifyWebhook()` auto-detects the version. If you process payloads manually, here are the formats:

**V3 (default):**

Metadata is separated from event data. New organizations receive V3 payloads by default.

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

**V2 (legacy):**

Metadata fields are mixed into the `data` object alongside event data.

```json
"type": "github_commit_event",
"data": {
  "commit_sha": "a1b2c3d",
  "message": "fix: resolve null pointer",
  "author": "jane",
  "connection_id": "ca_def456",
  "connection_nano_id": "cn_abc123",
  "trigger_nano_id": "tn_xyz789",
  "trigger_id": "ti_xyz789",
  "user_id": "user-id-123435"
},
"timestamp": "2026-01-15T10:30:00Z",
"log_id": "log_abc123"

```

**V1 (legacy):**

```json
"trigger_name": "github_commit_event",
"trigger_id": "ti_xyz789",
"connection_id": "ca_def456",
"payload": {
  "commit_sha": "a1b2c3d",
  "message": "fix: resolve null pointer",
  "author": "jane"
},
"log_id": "log_abc123"

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

