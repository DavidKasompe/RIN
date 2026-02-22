# Fetching tools and schemas (/docs/tools-direct/fetching-tools)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions) instead. See [Tools and toolkits](/docs/tools-and-toolkits) for how sessions discover and fetch tools automatically.

Fetch specific tools, filter by permissions or search, and inspect schemas for type information. Tools are automatically formatted for your provider.

# Basic usage

**Python:**

```python
tools = composio.tools.get(
    user_id,
    toolkits=["GITHUB"]
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user-123';
const tools = await composio.tools.get(userId, {
  toolkits: ["GITHUB"]
});
```

Returns top 20 tools by default. Tools require a `user_id` because they're scoped to authenticated accounts. See [User management](/docs/users-and-sessions) and [Authentication](/docs/tools-direct/authenticating-tools).

# Tool schemas

Inspect tool parameters and types without a user\_id:

**Python:**

```python
tool = composio.tools.get_raw_composio_tool_by_slug("GMAIL_SEND_EMAIL")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const tool = await composio.tools.getRawComposioToolBySlug("GMAIL_SEND_EMAIL");
```

Generate type-safe code for direct SDK execution with [`composio generate`](/docs/cli#generate-type-definitions). This creates TypeScript or Python types from tool schemas.

> View tool parameters and schemas visually in the [Composio platform](https://platform.composio.dev). Navigate to any toolkit and select a tool to see its input/output parameters.

# Filtering tools

## By toolkit

Get tools from specific apps. Returns top 20 tools by default.

**Python:**

```python
# Fetch with limit for a specific user
tools = composio.tools.get(
    user_id,
    toolkits=["GITHUB"],
    limit=5  # Get top 5 tools
)

# Same filter but without user_id (for schemas)
raw_tools = composio.tools.get_raw_composio_tools(
    toolkits=["GITHUB"],
    limit=5
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user-123';
// Fetch with limit for a specific user
const limitedTools = await composio.tools.get(userId, {
  toolkits: ["GITHUB"],
  limit: 5  // Get top 5 tools
});

// Same filter but without userId (for schemas)
const rawTools = await composio.tools.getRawComposioTools({
  toolkits: ["GITHUB"],
  limit: 5
});
```

## By name

Fetch specific tools when you know their names.

**Python:**

```python
# Fetch specific tools by name
tools = composio.tools.get(
    user_id,
    tools=["GITHUB_CREATE_ISSUE", "GITHUB_CREATE_PULL_REQUEST"]
)

# Get schemas without user_id
raw_tools = composio.tools.get_raw_composio_tools(
    tools=["GITHUB_CREATE_ISSUE", "GITHUB_CREATE_PULL_REQUEST"]
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user-123';
// Fetch specific tools by name
const specificTools = await composio.tools.get(userId, {
  tools: ["GITHUB_LIST_STARGAZERS", "GITHUB_STAR_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER"]
});

// Get schemas without userId
const specificRawTools = await composio.tools.getRawComposioTools({
  tools: ["GITHUB_LIST_STARGAZERS", "GITHUB_STAR_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER"]
});
```

## By scopes

Filter OAuth tools by permission level. Only works with a single toolkit.

**Python:**

```python
# Filter by OAuth scopes (single toolkit only)
tools = composio.tools.get(
    user_id,
    toolkits=["GITHUB"],
    scopes=["write:org"]
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user-123';
// Filter by OAuth scopes (single toolkit only)
const scopedTools = await composio.tools.get(userId, {
  toolkits: ["GITHUB"],
  scopes: ["write:org"]
});
```

## By search (experimental)

Find tools semantically.

**Python:**

```python
# Search tools semantically
tools = composio.tools.get(
    user_id,
    search="create calendar event"
)

# Search schemas without user_id
raw_tools = composio.tools.get_raw_composio_tools(
    search="create calendar event"
)

# Search within a specific toolkit
tools = composio.tools.get(
    user_id,
    search="issues",
    toolkits=["GITHUB"],
)

# Search toolkit schemas without user_id
raw_tools = composio.tools.get_raw_composio_tools(
    search="issues",
    toolkits=["GITHUB"]
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user-123';
// Search tools semantically
const searchResults = await composio.tools.get(userId, {
  search: "create google calendar event"
});

// Search schemas without userId
const searchRawTools = await composio.tools.getRawComposioTools({
  search: "create google calendar event"
});

// Search within a specific toolkit
const toolkitSearch = await composio.tools.get(userId, {
  search: "star a repository",
  toolkits: ["GITHUB"]
});

// Search toolkit schemas without userId
const toolkitSearchRaw = await composio.tools.getRawComposioTools({
  search: "star a repository",
  toolkits: ["GITHUB"]
});
```

> Use specific toolkit versions in production to prevent breaking changes. See [toolkit versioning](/docs/tools-direct/toolkit-versioning).

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.

# Authenticating Tools (/docs/tools-direct/authenticating-tools)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions) instead. Sessions handle authentication automatically via [in-chat authentication](/docs/authenticating-users/in-chat-authentication) or [manual authentication](/docs/authenticating-users/manually-authenticating).

The first step in authenticating your users is to create an **Auth Config**. Every toolkit has its own authentication method such as `OAuth`, `API key`, `Basic Auth`, or custom schemes.

An **Auth Config** is a blueprint that defines how authentication works for a toolkit across all your users. It defines:

1. **Authentication method** - `OAuth2`, `Bearer token`, `API key`, or `Basic Auth`
2. **Scopes** - what actions your tools can perform
3. **Credentials** - whether you'll use your own app credentials or Composio's managed auth

# Creating an auth config

## Using the Dashboard

#### Selecting a toolkit

Navigate to [Auth Configs](https://platform.composio.dev?next_page=%2Fauth-configs) tab in your dashboard and click "**Create Auth Config**". Find and select the toolkit you want to integrate (e.g., **Gmail**, **Slack**, **GitHub**).

#### Selecting the Authentication method

Each toolkit supports different authentication methods such as **OAuth**, **API Key**, **Bearer Token**. Select from the available options for your toolkit.

#### Configure scopes

Depending on your authentication method, you may need to configure scopes:

    * **OAuth2**: Configure scopes for what data and actions your app can access.
    * **API Key/Bearer Token**: Permissions are typically fixed based on the key's access level.

#### Authentication Management

**For OAuth toolkits:**

    * **Development/Testing**: Use Composio's managed authentication (no setup required)
    * **Production**: Generate your own OAuth credentials from the toolkit's developer portal

**For custom authentication schemes:**

You must provide your own credentials regardless of environment.

> Want to remove Composio branding from OAuth screens? See [Custom Auth Configs](/docs/auth-configuration/custom-auth-configs#white-labeling-the-oauth-consent-screen) for white-labeling options.

#### You are all set!

Click "**Create Auth Configuration**" button and you have completed your first step! Now you can move ahead to authenticating your users by [Connecting an Account](#connecting-an-account).

> **Auth configs are reusable**: Auth configs contain your developer credentials and app-level settings (*scopes*, *authentication method*, etc.). Once created, you can reuse the same auth config for all your users.

## When to create multiple auth configs?

You should create multiple auth configs for the same toolkit when you need:

* **Different authentication methods** - One OAuth config and one API key config
* **Different scopes** - Separate configs for read-only vs full access
* **Different OAuth apps** - Using separate client credentials for different environments
* **Different permission levels** - Limiting actions for specific use cases

- [Programmatic creation](/docs/auth-configuration/programmatic-auth-configs): 
For managing auth configs across multiple projects, you can create them programmatically via the API

  - [Production white-labeling](/docs/auth-configuration/custom-auth-configs#white-labeling-the-oauth-consent-screen): 
Remove Composio branding from OAuth screens for a fully white-labeled authentication experience

# Connecting an account

With an auth config created, you're ready to authenticate your users!

You can either use [**Connect Link**](#hosted-authentication-connect-link) for a hosted authentication flow, or use [**Direct SDK Setup**](#direct-sdk-setup).

> User authentication requires a User ID - a unique identifier that groups connected accounts together. Learn more about [User Management](/docs/users-and-sessions) to understand how to structure User IDs for your application.

**Choose the section below that matches your toolkit's authentication method:**

## Hosted Authentication (Connect Link)

Redirect users to a Composio-hosted URL that handles the entire authentication process—OAuth flows, API key collection, or custom fields like subdomain. You can specify a callback URL to control where users return after authentication.

![Connect Link authentication screen](/images/auth-screen-example.png)
*Connect Link authentication screen*

**Python:**

```python
from composio import Composio

composio = Composio(api_key="your_api_key")

# Use the "AUTH CONFIG ID" from your dashboard
auth_config_id = "your_auth_config_id"

# Use a unique identifier for each user in your application
user_id = 'user-1349-129-12'

connection_request = composio.connected_accounts.link(
    user_id=user_id,
    auth_config_id=auth_config_id,
    callback_url='https://your-app.com/callback'
)

redirect_url = connection_request.redirect_url
print(f"Visit: {redirect_url} to authenticate your account")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';

const composio = new Composio({apiKey: "your_api_key"});

// Use the "AUTH CONFIG ID" from your dashboard
const authConfigId = 'your_auth_config_id';

// Use a unique identifier for each user in your application
const userId = 'user-1349-129-12';

const connectionRequest = await composio.connectedAccounts.link(userId, authConfigId, {
  callbackUrl: 'https://your-app.com/callback'
});
const redirectUrl = connectionRequest.redirectUrl;
console.log(`Visit: ${redirectUrl} to authenticate your account`);
```

### Customizing Connect Link

By default, users will see a Composio-branded authentication experience when connecting their accounts. To customize this interface with your application's branding:

1. Navigate to your Project Settings and select [Auth Screen](https://platform.composio.dev?next_page=/settings/auth-screen)
2. Configure your **Logo** and **App Title**

These settings will apply to all authentication flows using Connect Link, providing a white-labeled experience that maintains your brand identity throughout the authentication process.

> For complete white-labeling including OAuth consent screens (removing Composio's domain), see [Custom Auth Configs - White-labeling](/docs/auth-configuration/custom-auth-configs#white-labeling-the-oauth-consent-screen).

### Redirecting users after authentication

You can include custom query parameters in your callback URL to carry context through the auth flow, such as identifying which user or session triggered the connection. Composio preserves your parameters and appends its own after authentication completes.

| Parameter              | Description                                   |
| ---------------------- | --------------------------------------------- |
| `status`               | `success` or `failed`                         |
| `connected_account_id` | The ID of the newly created connected account |

For example, if your callback URL is `https://your-app.com/callback?user_id=user_123`, the redirect after successful auth will be:

```
https://your-app.com/callback?user_id=user_123&status=success&connected_account_id=ca_abc123
```

## Direct SDK Setup

**Choose the section below that matches your toolkit's authentication method:**

### OAuth Connections

For OAuth flows, you'll redirect users to complete authorization. You can specify a callback URL to control where users return after authentication:

**Python:**

```python
from composio import Composio

composio = Composio(api_key="YOUR_COMPOSIO_API_KEY")

# Use the "AUTH CONFIG ID" from your dashboard
auth_config_id = "your_auth_config_id"

# Use a unique identifier for each user in your application
user_id = "user-1349-129-12"

connection_request = composio.connected_accounts.initiate(
  user_id=user_id,
  auth_config_id=auth_config_id,
  config={"auth_scheme": "OAUTH2"},
  callback_url="https://www.yourapp.com/callback"
)
print(f"Redirect URL: {connection_request.redirect_url}")

connected_account = connection_request.wait_for_connection()

# Alternative: if you only have the connection request ID
# connected_account = composio.connected_accounts.wait_for_connection(
#  connection_request.id)
# Recommended when the connection_request object is no longer available

print(f"Connection established: {connected_account.id}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';

const composio = new Composio({apiKey: "YOUR_COMPOSIO_API_KEY"});

// Use the "AUTH CONFIG ID" from your dashboard
const authConfigId = 'your_auth_config_id';
// Use a unique identifier for each user in your application
const userId = 'user_4567';

const connRequest = await composio.connectedAccounts.initiate(
  userId,
  authConfigId,

    callbackUrl: 'https://www.yourapp.com/callback',

);
console.log(`Redirect URL: ${connRequest.redirectUrl}`);

const connectedAccount = await connRequest.waitForConnection();

// Alternative: if you only have the connection request ID
// const connectedAccount = await composio.connectedAccounts
//   .waitForConnection(connRequest.id);
// Recommended when the connRequest object is no longer available

console.log(`Connection established: ${connectedAccount.id}`);
```

> When using callback URLs with `initiate()`, the appended query parameters use camelCase (`connectedAccountId`, `appName`) instead of snake\_case. See [Redirecting users after authentication](#redirecting-users-after-authentication).

### Services with Additional Parameters

Some services like Zendesk require additional parameters such as `subdomain`:

**Python:**

```python
# For Zendesk - include subdomain
connection_request = composio.connected_accounts.initiate(
  user_id=user_id,
  auth_config_id=auth_config_id,
  config=auth_scheme.oauth2(subdomain="mycompany")  # For mycompany.zendesk.com
)
```

**TypeScript:**

```typescript
import { Composio, AuthScheme } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user_123';
const authConfigId = 'ac_zendesk';
// For Zendesk - include subdomain
const connRequest = await composio.connectedAccounts.initiate(userId, authConfigId, {
  config: AuthScheme.OAuth2({
    subdomain: 'mycompany',
  }),
});
```

### API Key Connections

For API key authentication, you can either collect API keys from each user or use your own API key for all users. Popular toolkits that use API keys include Stripe, Perplexity, etc.

Here is how to initiate the flow:

**Python:**

```python
from composio import Composio

composio = Composio(api_key="your_api_key")

# Use the "AUTH CONFIG ID" from your dashboard
auth_config_id = "your_auth_config_id"

# Use a unique identifier for each user in your application
user_id = "user_12323"

# API key provided by the user (collected from your app's UI)
# or use your own key
user_api_key = "user_api_key_here"

connection_request = composio.connected_accounts.initiate(
  user_id=user_id,
  auth_config_id=auth_config_id,
  config={
    "auth_scheme": "API_KEY", "val": {"api_key": user_api_key}

)

print(f"Connection established: {connection_request.id}")
```

**TypeScript:**

```typescript
import { Composio, AuthScheme } from '@composio/core';

const composio = new Composio({ apiKey: 'your_api_key' });

// Use the "AUTH CONFIG ID" from your dashboard
const authConfigId = 'your_auth_config_id';
// Use a unique identifier for each user in your application
const userId = 'user12345678';
// API key provided by the user (collected from your app's UI)
const userApiKey = 'user_api_key_here';

const connectionRequest = await composio.connectedAccounts.initiate(userId, authConfigId, {
  config: AuthScheme.APIKey({
    api_key: userApiKey,
  }),
});

console.log(`Connection established: ${connectionRequest.id}`);
```

# Fetching the required config parameters for an Auth Config

When working with any toolkit, you can inspect an auth config to understand its authentication requirements and expected parameters.

Here is how you would fetch the authentication method and input fields:

**Python:**

```python
from composio import Composio

composio = Composio(api_key="your_api_key")

# Use the "AUTH CONFIG ID" from your dashboard
auth_config_id = "your_auth_config_id"

# Fetch the auth configuration details
auth_config = composio.auth_configs.get(auth_config_id)

# Check what authentication method this config uses
print(f"Authentication method: {auth_config.auth_scheme}")

# See what input fields are required
print(f"Required fields: {auth_config.expected_input_fields}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';

const composio = new Composio({ apiKey: 'your_api_key' });

// Use the "AUTH CONFIG ID" from your dashboard
const authConfigId = 'your_auth_config_id';

// Fetch the auth configuration details
const authConfig = await composio.authConfigs.get(authConfigId);

console.log(`Authentication method: ${authConfig.authScheme}`);
console.log(`Required fields:`, authConfig.expectedInputFields);
```

# Other Authentication Methods

Composio also supports a wide range of other auth schemas:

**Bearer Token** - Similar to API keys, provide the user's bearer token directly when creating the connection.

**Basic Auth** - Provide username and password credentials for services that use HTTP Basic Authentication.

**Custom Schemes** - Some toolkits use their own custom authentication methods. Follow the toolkit-specific requirements for such cases.

> **Fetching auth config**: For any of these methods, [fetch the config parameter](#fetching-the-required-config-parameters-for-an-auth-config) to determine the exact fields required. Every toolkit has its own requirements, and understanding these is essential for successfully creating connections.

Learn how to [Manage connected accounts](/docs/auth-configuration/connected-accounts) after users authenticate.

# Connection Statuses

After creating a connection, it will have one of the following statuses that indicates its current state:

| Status        | What it means                                                                                                                                          | What to do                                                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ACTIVE**    | Connection is working. Tools can be executed.                                                                                                          | Nothing — you're good.                                                                                                                                                                                                                    |
| **INITIATED** | OAuth flow started but the user hasn't completed authentication yet. Auto-expires after 10 minutes.                                                    | Redirect the user to the Connect Link to finish authentication.                                                                                                                                                                           |
| **EXPIRED**   | Credentials are no longer valid and Composio cannot refresh them automatically. See [common causes](#why-connections-expire) below.                    | [Subscribe to expiry events](/docs/subscribing-to-connection-expiry-events) to detect this proactively, and [re-authenticate the user](/docs/subscribing-to-connection-expiry-events#re-authenticate-the-user) to refresh the connection. |
| **FAILED**    | The authentication attempt did not succeed. Common causes: user denied consent during OAuth, invalid authorization code, or misconfigured auth config. | Check the `status_reason` field for details and retry the connection.                                                                                                                                                                     |
| **INACTIVE**  | Manually disabled via the API. The connection is preserved but cannot be used to execute tools.                                                        | Re-enable it via the API or dashboard to restore access.                                                                                                                                                                                  |

## Why connections expire

Composio automatically refreshes OAuth tokens before they expire. A connection is only marked as **EXPIRED** after refresh attempts have failed. Common reasons:

* **User revoked access** — The user went to the provider's settings (e.g., Google Account > Security > Third-party apps) and removed your app's access.
* **OAuth app deleted or disabled** — The OAuth application credentials were deleted or disabled in the provider's developer console.
* **Refresh token expired** — Some providers (e.g., Google with test/unverified apps) expire refresh tokens after a set period. Once expired, a new OAuth consent flow is required.
* **Provider-side revocation** — The provider revoked tokens due to policy changes, security events, or account-level restrictions.
* **Repeated transient failures** — If token refresh fails multiple times consecutively (e.g., due to prolonged provider outages), Composio marks the connection as expired after a threshold of failures.

In all cases, the user must [re-authenticate](/docs/subscribing-to-connection-expiry-events#re-authenticate-the-user) to restore the connection. Check the `status_reason` field on the connected account for the specific reason. You can also [subscribe to connection expiry events](/docs/subscribing-to-connection-expiry-events) to detect this proactively.

## Waiting for Connection Establishment

The `waitForConnection` method allows you to poll for a connection to become active after initiating authentication. This is useful when you need to ensure a connection is ready before proceeding.

**Python:**

```python
# Wait for the connection to be established
connected_account = connection_request.wait_for_connection()
print(connected_account.id)

# Alternative: Wait with custom timeout
# connected_account = connection_request.wait_for_connection(120)  # 2 minute timeout

# Alternative: If you only have the connection request ID (e.g., stored in database)
# connection_id = connection_request.id  # You can store this ID in your database
# connected_account = composio.connected_accounts.wait_for_connection(connection_id, 60)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const connectionRequest = await composio.connectedAccounts.initiate('user_123', 'ac_123', {});
// Wait for the connection to be established
const connectedAccount = await connectionRequest.waitForConnection();
console.log(connectedAccount.id);

// Alternative: Wait with custom timeout
// const connectedAccount = await connectionRequest.waitForConnection(120000);  // 2 minutes

// Alternative: If you only have the connection request ID (e.g., stored in database)
// const connectionId = connectionRequest.id;  // You can store this ID in your database
// const connectedAccount = await composio.connectedAccounts.waitForConnection(connectionId, 60000);
```

The method continuously polls the Composio API until the connection:

* Becomes **ACTIVE** (returns the connected account)
* Enters a terminal state like **FAILED** or **EXPIRED** (throws an error)
* Exceeds the specified timeout (throws a timeout error)

## Checking Connection Status

You can check the status of a connected account programmatically:

**Python:**

```python
# Get a specific connected account
connected_account = composio.connected_accounts.get("your_connected_account_id")
print(f"Status: {connected_account.status}")

# Filter connections by user_id, auth_config_id, and status (only active accounts)
filtered_connections = composio.connected_accounts.list(
    user_ids=["user_123"],
    auth_config_ids=["your_auth_config_id"],
    statuses=["ACTIVE"]
)
for connection in filtered_connections.items:
    print(f"{connection.id}: {connection.status}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
// Get a specific connected account by its nanoid
const connectedAccount = await composio.connectedAccounts.get('your_connected_account_id');
console.log(`Status: ${connectedAccount.status}`);

// Filter connections by user_id, auth_config_id, and status (only active accounts)
const filteredConnections = await composio.connectedAccounts.list({
  userIds: ['user_123'],
  authConfigIds: ['your_auth_config_id'],
  statuses: ['ACTIVE']
});
filteredConnections.items.forEach(connection => {
  console.log(`${connection.id}: ${connection.status}`);
});
```

> Only connections with **ACTIVE** status can be used to execute tools. If a connection is in any other state, you'll need to take appropriate action (re-authenticate, wait for processing, etc.) before using it.

# Next Step

With authentication set up, you can now fetch and execute tools. See [Executing Tools](/docs/tools-direct/executing-tools) to get started.

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.


# Executing Tools (/docs/tools-direct/executing-tools)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions) instead. Sessions handle tool fetching, authentication, and execution automatically.

LLMs on their own can only do generation. Tool calling changes that by letting them interact with external services. Instead of just drafting an email, the model can call `GMAIL_SEND_EMAIL` to actually send it. The tool's results feed back to the LLM, closing the loop so it can decide, act, observe, and adapt.

In Composio, every **tool** is a single API action—fully described with schema, parameters, and return type. Tools live inside **toolkits** like Gmail, Slack, or GitHub, and Composio handles authentication and user scoping.

> **User Scoping**: All tools are scoped to a specific user - that's why every example includes a `user_id`. Learn how to structure User IDs in [User Management](/docs/users-and-sessions). Each user must authenticate with their respective services (Gmail, Calendar, etc.) - see [Authentication](/docs/tools-direct/authenticating-tools).

# Using Chat Completions

Use the Composio SDK with providers like OpenAI, Anthropic, and Google AI. To learn how to set up these providers, see [Providers](/docs/providers/openai).

**Python:**

```python
from composio import Composio
from composio_openai import OpenAIProvider
from openai import OpenAI
from datetime import datetime

# Use a unique identifier for each user in your application
user_id = "user-k7334"

# Create composio client
composio = Composio(provider=OpenAIProvider(), api_key="your_composio_api_key")

# Create openai client
openai = OpenAI()

# Get calendar tools for this user
tools = composio.tools.get(
    user_id=user_id,
    tools=["GOOGLECALENDAR_EVENTS_LIST"]
)

# Ask the LLM to check calendar
result = openai.chat.completions.create(
    model="gpt-4o-mini",
    tools=tools,
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": f"What's on my calendar for the next 7 days?"}
    ]
)

# Handle tool calls
result = composio.provider.handle_tool_calls(user_id=user_id, response=result)
print(result)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
import { AnthropicProvider } from '@composio/anthropic';
import { Anthropic } from '@anthropic-ai/sdk';

// Use a unique identifier for each user in your application
const userId = 'user-k7334';

// Create anthropic client
const anthropic = new Anthropic();

// Create Composio client
const composio = new Composio({
  apiKey: "your-composio-api-key",
  provider: new AnthropicProvider(),
});

// Get calendar tools for this user
const tools = await composio.tools.get(userId, {
  tools: ['GOOGLECALENDAR_EVENTS_LIST'],
});

// Ask the LLM to check calendar
const msg = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  tools: tools,
  messages: [

      role: 'user',
      content: `What's on my calendar for the next 7 days?`,
    },
  ],
  max_tokens: 1024,
});

// Handle tool calls
const result = await composio.provider.handleToolCalls(userId, msg);
console.log('Results:', JSON.stringify(result, null, 2));
```

# Using Agentic Frameworks

Agentic frameworks automatically handle the tool execution loop. Composio provides support for frameworks like this by making sure the tools are formatted into the correct objects for the agentic framework to execute.

**Python:**

```python
import asyncio
from agents import Agent, Runner
from composio import Composio
from composio_openai_agents import OpenAIAgentsProvider

# Use a unique identifier for each user in your application
user_id = "user-k7334"

# Initialize Composio toolset
composio = Composio(provider=OpenAIAgentsProvider(), api_key="your_composio_api_key")

# Get all tools for the user
tools = composio.tools.get(
    user_id=user_id,
    toolkits=["COMPOSIO_SEARCH"],
)

# Create an agent with the tools
agent = Agent(
    name="Deep Researcher",
    instructions="You are an investigative journalist.",
    tools=tools,
)

async def main():
    result = await Runner.run(
        starting_agent=agent,
        input=("Do a thorough DEEP research on Golden Gate Bridge"),
    )
    print(result.final_output)

# Run the agent
asyncio.run(main())
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { VercelProvider } from '@composio/vercel';

// Use a unique identifier for each user in your application
const userId = 'user-k7334';

// Initialize Composio toolset
const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new VercelProvider(),
});

// Get all tools for the user
const tools = await composio.tools.get(userId, {
  toolkits: ['HACKERNEWS_GET_LATEST_POSTS'],
  limit: 10,
});

// Generate text with tool use
const { text } = await generateText({
  model: anthropic('claude-sonnet-4-20250514'),
  messages: [

      role: 'user',
      content: 'Do a thorough DEEP research on the top articles on Hacker News about Composio',
    },
  ],
  tools,
});

console.log(text);
```

# Direct Tool Execution

If you just want to call a tool without using any framework or LLM provider, you can use the `execute` method directly.

> **Finding tool parameters and types:**

**Platform UI**: [Auth Configs](https://platform.composio.dev?next_page=/auth-configs) → Select your toolkit → Tools & Triggers → Select the tool to see its required and optional parameters

**CLI**: For Python and TypeScript projects, run `composio generate` to generate types. [Learn more →](/docs/cli#generate-type-definitions)

**Python:**

```python
from composio import Composio

user_id = "user-k7334"
# Configure toolkit versions at SDK level
composio = Composio(
    api_key="your_composio_key",
    toolkit_versions={"github": "20251027_00"}
)

# Find available arguments for any tool in the Composio dashboard
result = composio.tools.execute(
    "GITHUB_LIST_STARGAZERS",
    user_id=user_id,
    arguments={"owner": "ComposioHQ", "repo": "composio", "page": 1, "per_page": 5}
)
print(result)
```

**TypeScript:**

```typescript
import { Composio } from "@composio/core";

const userId = "user-k7334";
// Configure toolkit versions at SDK level
const composio = new Composio({
    apiKey: "your_composio_key",
    toolkitVersions: { github: "20251027_00" }
});

// Find available arguments for any tool in the Composio dashboard
const result = await composio.tools.execute("GITHUB_LIST_STARGAZERS", {
  userId,
  arguments: {
    "owner": "ComposioHQ",
    "repo": "composio",
    "page": 1,
    "per_page": 5
  },
});
console.log('GitHub stargazers:', JSON.stringify(result, null, 2));
```

> The examples above configure toolkit versions at SDK initialization. You can also pass versions per-execution or use environment variables. See [toolkit versioning](/docs/tools-direct/toolkit-versioning) for all configuration options.

## Proxy Execute

You can proxy requests to any supported toolkit API and let Composio inject the authentication state. This is useful when you need an API endpoint that isn't available as a predefined tool.

The `endpoint` can be a relative path or absolute URL. Composio uses the `connected_account_id` to determine the toolkit and resolve relative paths against the appropriate base URL.

**Python:**

```python
# Send a proxy request to the endpoint
response = composio.tools.proxy(
    endpoint="/repos/composiohq/composio/issues/1",
    method="GET",
    connected_account_id="ca_jI6********",  # use connected account for github
    parameters=[

            "name": "Accept",
            "value": "application/vnd.github.v3+json",
            "type": "header",
        },
    ],
)

print(response)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
// Send a proxy request to the endpoint
const { data } = await composio.tools.proxyExecute({
    endpoint:'/repos/composiohq/composio/issues/1',
    method: 'GET',
    connectedAccountId: 'ca_jI*****', // use connected account for github
    parameters:[

            "name": "Accept",
            "value": "application/vnd.github.v3+json",
            "in": "header",
        },
    ],
});

console.log(data);
```

> Need an API that isn't supported by any Composio toolkit, or want to extend an existing one? Learn how to [create custom tools](/docs/tools-direct/custom-tools).

# Automatic File Handling

Composio handles file operations automatically. Pass file paths to tools that need them, and get local file paths back from tools that return files.

## File Upload

Pass local file paths, URLs, or File objects to tools that accept files:

**Python:**

```python
# Upload a local file to Google Drive
result = composio.tools.execute(
    slug="GOOGLEDRIVE_UPLOAD_FILE",
    user_id="user-1235***",
    arguments={"file_to_upload": os.path.join(os.getcwd(), "document.pdf")},
)

print(result)  # Print Google Drive file details
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
import path from 'path';
const composio = new Composio({ apiKey: 'your_api_key' });
// Upload a local file to Google Drive
const result = await composio.tools.execute('GOOGLEDRIVE_UPLOAD_FILE', {
  userId: 'user-4235***',
  arguments: {
    file_to_upload: path.join(__dirname, 'document.pdf')

});

console.log(result.data);  // Contains Google Drive file details
```

## File Download

When tools return files, Composio downloads them to the local directory and provides the file path in the response:

**Python:**

```python
composio = Composio(
    api_key="your_composio_key",
    file_download_dir="./downloads"  # Optional: Specify download directory
)

result = composio.tools.execute(
    "GOOGLEDRIVE_DOWNLOAD_FILE",
    user_id="user-1235***",
    arguments={"file_id": "your_file_id"},
)

# Result includes local file path
print(result)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
// Download a file from Google Drive
const result = await composio.tools.execute('GOOGLEDRIVE_DOWNLOAD_FILE', {
    userId: 'user-1235***',
    arguments: {
      file_id: 'your-file-id'

  });

// Result includes local file path
console.log(result);
```

## Disabling Auto File Handling

You can disable automatic file handling when initializing the TypeScript SDK. When disabled, handle file uploads and downloads manually using `files.upload` and `files.download`:

```typescript
import { Composio } from '@composio/core';
import path from 'path';
const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  autoUploadDownloadFiles: false
});

// Now you need to handle files manually using composio.files API
const fileData = await composio.files.upload({
  file: path.join(__dirname, 'document.pdf'),
  toolSlug: 'GOOGLEDRIVE_UPLOAD_FILE',
  toolkitSlug: 'googledrive'
});
```

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.

# Schema Modifiers (/docs/tools-direct/modify-tool-behavior/schema-modifiers)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions) instead. Sessions handle tool fetching, authentication, and execution automatically.

Schema modifiers are part of Composio SDK's powerful middleware capabilities that allow you to customize and extend the behavior of tools.

Schema modifiers transform a tool's schema before the tool is seen by an agent.

![Schema Modifier](/images/schema-modifier.png)

**Useful for:**

* Modifying or rewriting the tool description to better fit your use case
* Adding arguments to the tool (e.g., adding a `thought` argument to prompt the agent to explain reasoning)
* Hiding arguments from the tool when they're irrelevant
* Adding extra arguments for custom use cases
* Adding default values to tool arguments

> Below we modify the schema of `HACKERNEWS_GET_LATEST_POSTS` to make the `size` argument required and remove the `page` argument.

**Python:**

```python
from composio import Composio, schema_modifier
from composio.types import Tool

user_id = "your@email.com"

@schema_modifier(tools=["HACKERNEWS_GET_LATEST_POSTS"])
def modify_schema(
    tool: str,
    toolkit: str,
    schema: Tool,
) -> Tool:
    _ = schema.input_parameters["properties"].pop("page", None)
    schema.input_parameters["required"] = ["size"]
    return schema

tools = composio.tools.get(
    user_id=user_id,
    tools=["HACKERNEWS_GET_LATEST_POSTS", "HACKERNEWS_GET_USER"],
    modifiers=[
        modify_schema,
    ]
)
```

**TypeScript:**

```typescript
const userId = "your@email.com";

const tools = await composio.tools.get(
  userId,

    tools: ["HACKERNEWS_GET_LATEST_POSTS", "HACKERNEWS_GET_USER"],
  },

    modifySchema: ({ toolSlug, toolkitSlug, schema }) => {
      if (toolSlug === "HACKERNEWS_GET_LATEST_POSTS") {
        const { inputParameters } = schema;
        if (inputParameters?.properties) {
          delete inputParameters.properties["page"];

        inputParameters.required = ["size"];

      return schema;
    },

);

console.log(JSON.stringify(tools, null, 2));
```

With the modified tool schema, the `page` argument is removed and `size` is required.

**Full example with LLM**

**Python:**

```python
from openai import OpenAI
from composio import Composio, schema_modifier
from composio.types import Tool
from composio_openai import OpenAIProvider

@schema_modifier(tools=["HACKERNEWS_GET_LATEST_POSTS"])
def modify_schema(
    tool: str,
    toolkit: str,
    schema: Tool,
) -> Tool:
    _ = schema.input_parameters["properties"].pop("page", None)
    schema.input_parameters["required"] = ["size"]
    return schema

# Initialize tools
openai_client = OpenAI()
composio = Composio(provider=OpenAIProvider())

# Define task
task = "Get the latest posts from Hacker News"

# Get tools with modifier
tools = composio.tools.get(
  user_id="default",
  tools=['HACKERNEWS_GET_LATEST_POSTS', 'HACKERNEWS_GET_USER'],
  modifiers=[
      modify_schema,
  ],
)

# Get response from the LLM
response = openai_client.chat.completions.create(
    model="gpt-4o-mini",
    tools=tools,
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": task},
    ],
)
print(response)

# Execute the function calls
result = composio.provider.handle_tool_calls(response=response, user_id="default")
print(result)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
import { OpenAI } from 'openai';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});
const openai = new OpenAI();

const userId = 'your@email.com';

const tools = await composio.tools.get(
  userId,

    tools: ['HACKERNEWS_GET_LATEST_POSTS', 'HACKERNEWS_GET_USER'],
  },

    modifySchema: ({ toolSlug, toolkitSlug, schema }) => {
      if (toolSlug === 'HACKERNEWS_GET_LATEST_POSTS') {
        const { inputParameters } = schema;
        if (inputParameters?.properties) {
          delete inputParameters.properties['page'];

        inputParameters.required = ['size'];

      return schema;
    },

);

console.log(JSON.stringify(tools, null, 2));

const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [

      role: 'system',
      content: 'You are a helpful assistant that can help with tasks.',
    },
    { role: 'user', content: 'Get the latest posts from Hacker News' },
  ],
  tools: tools,
  tool_choice: 'auto',
});

console.log(response.choices[0].message.tool_calls);
```

# Example: Modifying the tool description

Sometimes you need to provide additional context to help the agent understand how to use a tool correctly. This example demonstrates modifying the description of `GITHUB_LIST_REPOSITORY_ISSUES` to specify a default repository.

> This approach is useful when you want to guide the agent's behavior without changing the tool's underlying functionality.

In this example:

* We append additional instructions to the tool's description
* The modified description tells the agent to use `composiohq/composio` as the default repository
* This helps prevent errors when the agent forgets to specify a repository parameter

**Python:**

```python
from composio import Composio, schema_modifier
from composio.types import Tool
from composio_google import GoogleProvider
from google import genai
from uuid import uuid4

composio = Composio(provider=GoogleProvider())
client = genai.Client()
user_id = uuid4()

@schema_modifier(tools=["GITHUB_LIST_REPOSITORY_ISSUES"])
def append_repository(
    tool: str,
    toolkit: str,
    schema: Tool,
) -> Tool:
    schema.description += " When not specified, use the `composiohq/composio` repository"
    return schema

tools = composio.tools.get(
    user_id=user_id,
    tools=["GITHUB_LIST_REPOSITORY_ISSUES"],
    modifiers=[append_repository]
)

print(tools)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';
import { v4 as uuidv4 } from 'uuid';

const userId = uuidv4();
const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new VercelProvider(),
});

const addDescription = ({ toolSlug, toolkitSlug, schema }) => {
  if (toolSlug === 'GITHUB_LIST_REPOSITORY_ISSUES') {
    schema.description += 'If not specified, use the `composiohq/composio` repository';

  return schema;
};

const tools = await composio.tools.get(
  userId,

    tools: ['GITHUB_LIST_REPOSITORY_ISSUES'],
  },

    modifySchema: addDescription,

);

console.log(tools);
```

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.


# Before Execution Modifiers (/docs/tools-direct/modify-tool-behavior/before-execution-modifiers)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions) instead. Sessions handle tool fetching, authentication, and execution automatically.

Before execution modifiers are part of Composio SDK's powerful middleware capabilities that allow you to customize and extend the behavior of tools.

These modifiers are called before the tool is executed by the LLM. This allows you to modify the arguments called by the LLM before they are executed by Composio.

**Useful for:**

* Injecting an argument into the tool execution
* Overriding the arguments emitted by the LLM

![Before Execution Modifier](/images/before-execute.png)

> Below we use the `beforeExecute` modifier to modify the number of posts returned by `HACKERNEWS_GET_LATEST_POSTS`.

# With Chat Completions

Since completion providers don't have a function execution step, Composio executes the tool call directly. The modifier is configured on the `tools.execute` method.

**Python:**

```python
from openai import OpenAI
from composio import Composio, before_execute
from composio.types import ToolExecuteParams

composio = Composio()
openai_client = OpenAI()
user_id = "user@email.com"

@before_execute(tools=["HACKERNEWS_GET_LATEST_POSTS"])
def before_execute_modifier(
    tool: str,
    toolkit: str,
    params: ToolExecuteParams,
) -> ToolExecuteParams:
    params["arguments"]["size"] = 1
    return params

# Get tools
tools = composio.tools.get(user_id=user_id, slug="HACKERNEWS_GET_LATEST_POSTS")

# Get response from the LLM
response = openai_client.chat.completions.create(
    model="gpt-4o-mini",
    tools=tools,
    messages=[{"role": "user", "content": "Fetch latest posts from hackernews"}],
)
print(response)

# Execute the function calls
result = composio.provider.handle_tool_calls(
    response=response,
    user_id="default",
    modifiers=[
        before_execute_modifier,
    ],
)
print(result)
```

**TypeScript:**

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages,
  tools,
  tool_choice: "auto",
});

const { tool_calls } = response.choices[0].message;
console.log(tool_calls);

if (tool_calls) {
  const {
    function: { arguments: toolArgs },
  } = tool_calls[0];

  const result = await composio.tools.execute(
    "HACKERNEWS_GET_LATEST_POSTS",

      userId,
      arguments: JSON.parse(toolArgs),
    },

      beforeExecute: ({ toolSlug, toolkitSlug, params }) => {
        if (toolSlug === "HACKERNEWS_GET_LATEST_POSTS") {
          params.arguments.size = 1;

        console.log(params);
        return params;
      },

  );
  console.log(JSON.stringify(result, null, 2));

```

# With Agentic Frameworks

Agentic providers have a function execution step. The modifier is configured on the `tools.get` method which modifies the execution logic within the framework.

**Python:**

```python
from composio import Composio, before_execute
from composio.types import ToolExecuteParams
from composio_crewai import CrewAIProvider

composio = Composio(provider=CrewAIProvider())

@before_execute(tools=["LINEAR_CREATE_LINEAR_ISSUE"])
def modify_linear_project_id(
    tool: str,
    toolkit: str,
    params: ToolExecuteParams,
) -> ToolExecuteParams:
    params["arguments"]["project_id"] = "1234567890"
    return params

tools = composio.tools.get(
    user_id="default",
    tools=[
        "HACKERNEWS_GET_LATEST_POSTS",
        "HACKERNEWS_GET_USER",
        "LINEAR_CREATE_LINEAR_ISSUE",
    ],
    modifiers=[
        modify_linear_project_id,
    ]
)
```

**TypeScript:**

```typescript
import { Composio } from "@composio/core";
import { MastraProvider } from "@composio/mastra";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new MastraProvider(),
});

const userId = "user@acme.com";

const agenticTools = await composio.tools.get(
  userId,

    tools: [
      "HACKERNEWS_GET_LATEST_POSTS",
      "HACKERNEWS_GET_USER",
      "LINEAR_CREATE_LINEAR_ISSUE",
    ],
  },

    beforeExecute: ({toolSlug, toolkitSlug, params}) => {
      if (toolSlug === "LINEAR_CREATE_LINEAR_ISSUE") {
        params.arguments.project_id = "1234567890";

      return params;
    },

);
```

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.

# After Execution Modifiers (/docs/tools-direct/modify-tool-behavior/after-execution-modifiers)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions) instead. Sessions handle tool fetching, authentication, and execution automatically.

After execution modifiers are part of Composio SDK's powerful middleware capabilities that allow you to customize and extend the behavior of tools.

These modifiers are called after the tool is executed. This allows you to modify the result of the tool before it is returned to the agent.

**Useful for:**

* Modifying or truncating the output of the tool
* Converting the output to a different format before returning it to the agent

![After Execution Modifier](/images/after-execute.png)

> Below we use the `afterExecute` modifier to truncate the output of `HACKERNEWS_GET_USER` and only return the karma of the user.

# With Chat Completions

Since completion providers don't have a function execution step, Composio executes the tool call directly. The modifier is configured on the `tools.execute` method.

**Python:**

```python
from composio import Composio, after_execute
from composio.types import ToolExecutionResponse

@after_execute(tools=["HACKERNEWS_GET_USER"])
def after_execute_modifier(
    tool: str,
    toolkit: str,
    response: ToolExecutionResponse,
) -> ToolExecutionResponse:
    return {
        **response,
        "data": {
            "karma": response["data"]["karma"],
        },

tools = composio.tools.get(user_id=user_id, slug="HACKERNEWS_GET_USER")

# Get response from the LLM
response = openai_client.chat.completions.create(
    model="gpt-4o-mini",
    tools=tools,
    messages=messages,
)
print(response)

# Execute the function calls
result = composio.provider.handle_tool_calls(
  response=response,
  user_id="default",
  modifiers=[
     after_execute_modifier,
  ]
)
print(result)
```

**TypeScript:**

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages,
  tools,
  tool_choice: "auto",
});

const { tool_calls } = response.choices[0].message;
console.log(tool_calls);

if (tool_calls) {
  const {
    function: { arguments: toolArgs },
  } = tool_calls[0];

  const result = await composio.tools.execute(
    "HACKERNEWS_GET_USER",

      userId,
      arguments: JSON.parse(toolArgs),
    },

      afterExecute: ({ toolSlug, toolkitSlug, result }) => {
        if (toolSlug === "HACKERNEWS_GET_USER") {
          const { data } = result;
          const { karma } = data.response_data as { karma: number };
          return {
            ...result,
            data: { karma },
          };

        return result;
      },

  );
  console.log(JSON.stringify(result, null, 2));

```

# With Agentic Frameworks

Agentic providers have a function execution step. The modifier is configured on the `tools.get` method which modifies the execution logic within the framework.

**Python:**

```python
from composio import Composio, after_execute
from composio.types import ToolExecutionResponse
from composio_crewai import CrewAIProvider

composio = Composio(provider=CrewAIProvider())

@after_execute(tools=["HACKERNEWS_GET_USER"])
def after_execute_modifier(
    tool: str,
    toolkit: str,
    response: ToolExecutionResponse,
) -> ToolExecutionResponse:
    return {
        **response,
        "data": {
            "karma": response["data"]["karma"],
        },

tools = composio.tools.get(
    user_id="default",
    slug="HACKERNEWS_GET_USER",
    modifiers=[
        after_execute_modifier,
    ]
)
```

**TypeScript:**

```typescript
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { v4 as uuidv4 } from "uuid";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new VercelProvider(),
});

const userId = uuidv4();

const agenticTools = await composio.tools.get(
  userId,

    tools: ["HACKERNEWS_GET_USER"],
  },

    afterExecute: ({ toolSlug, toolkitSlug, result }) => {
      if (toolSlug === "HACKERNEWS_GET_USER") {
        const {
          data: { response_data: { karma } = {} } = {},
        } = result;
        return {
          ...result,
          data: { karma },
        };

      return result;
    },

);
```

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.


# Creating Custom Tools (/docs/tools-direct/custom-tools)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions) instead. Sessions handle tool fetching, authentication, and execution automatically.

Custom tools allow you to create your own tools that can be used with Composio.

1. **Standalone tools** - Simple tools that don't require any authentication
2. **Toolkit-based tools** - Tools that require authentication and can use toolkit credentials

# Creating a Custom Tool

## Standalone Tool

A standalone tool is the simplest form of custom tool. It only requires input parameters and an execute function:

**Python:**

```python
from pydantic import BaseModel, Field

from composio import Composio
from composio.types import ExecuteRequestFn

composio = Composio()

class AddTwoNumbersInput(BaseModel):
    a: int = Field(
        ...,
        description="The first number to add",
    )
    b: int = Field(
        ...,
        description="The second number to add",
    )

# function name will be used as slug
@composio.tools.custom_tool
def add_two_numbers(request: AddTwoNumbersInput) -> int:
    """Add two numbers."""
    return request.a + request.b
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
import { z } from 'zod/v3';
const composio = new Composio({ apiKey: 'your_api_key' });
const tool = await composio.tools.createCustomTool({
  slug: 'CALCULATE_SQUARE',
  name: 'Calculate Square',
  description: 'Calculates the square of a number',
  inputParams: z.object({
    number: z.number().describe('The number to calculate the square of'),
  }),
  execute: async input => {
    const { number } = input;
    return {
      data: { result: number * number },
      error: null,
      successful: true,
    };
  },
});
```

## Toolkit-based Tool

A toolkit-based tool has access to two ways of making authenticated requests:

**1. Using `executeToolRequest`** - The recommended way to make authenticated requests to the toolkit's API endpoints. Composio automatically handles credential injection and baseURL resolution:

**Python:**

```python
class GetIssueInfoInput(BaseModel):
    issue_number: int = Field(
        ...,
        description="The number of the issue to get information about",
    )

# function name will be used as slug
@composio.tools.custom_tool(toolkit="github")
def get_issue_info(
    request: GetIssueInfoInput,
    execute_request: ExecuteRequestFn,
    auth_credentials: dict,
) -> dict:
    """Get information about a GitHub issue."""
    response = execute_request(
        endpoint=f"/repos/composiohq/composio/issues/{request.issue_number}",
        method="GET",
        parameters=[

                "name": "Accept",
                "value": "application/vnd.github.v3+json",
                "type": "header",
            },

                "name": "Authorization",
                "value": f"Bearer {auth_credentials['access_token']}",
                "type": "header",
            },
        ],
    )
    return {"data": response.data}
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
import { z } from 'zod/v3';
const composio = new Composio({ apiKey: 'your_api_key' });
const tool = await composio.tools.createCustomTool({
  slug: 'GITHUB_STAR_COMPOSIOHQ_REPOSITORY',
  name: 'Github star composio repositories',
  toolkitSlug: 'github',
  description: 'Star any specified repo of `composiohq` user',
  inputParams: z.object({
    repository: z.string().describe('The repository to star'),
    page: z.number().optional().describe('Pagination page number'),
    customHeader: z.string().optional().describe('Custom header'),
  }),
  execute: async (input, connectionConfig, executeToolRequest) => {
    // This method makes authenticated requests to the relevant API
    // You can use relative paths!
    // Composio will automatically inject the baseURL
    const result = await executeToolRequest({
      endpoint: `/user/starred/composiohq/${input.repository}`,
      method: 'PUT',
      body: {},
      // Add custom headers or query parameters
      parameters: [
        // Add query parameters

          name: 'page',
          value: input.page?.toString() || '1',
          in: 'query',
        },
        // Add custom headers

          name: 'x-custom-header',
          value: input.customHeader || 'default-value',
          in: 'header',
        },
      ],
    });
    return result;
  },
});
```

**2. Using `connectionConfig`** - For making direct API calls when needed:

**Python:**

```python
import requests

@composio.tools.custom_tool(toolkit="github")
def get_issue_info_direct(
    request: GetIssueInfoInput,
    execute_request: ExecuteRequestFn,
    auth_credentials: dict,
) -> dict:
    """Get information about a GitHub issue."""
    response = requests.get(
        f"https://api.github.com/repos/composiohq/composio/issues/{request.issue_number}",
        headers={
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"Bearer {auth_credentials['access_token']}",
        },
    )
    return {"data": response.json()}
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
import { z } from 'zod/v3';
const composio = new Composio({ apiKey: 'your_api_key' });
const tool = await composio.tools.createCustomTool({
  slug: 'GITHUB_DIRECT_API',
  name: 'Direct GitHub API Call',
  description: 'Makes direct calls to GitHub API',
  toolkitSlug: 'github',
  inputParams: z.object({
    repo: z.string().describe('Repository name'),
  }),
  execute: async (input, connectionConfig, executeToolRequest) => {
    // Use connectionConfig for direct API calls
    if (!connectionConfig || connectionConfig.authScheme !== 'OAUTH2') {
      throw new Error('OAuth2 connection required');

    const result = await fetch(`https://api.github.com/repos/${input.repo}`, {
      headers: {
        Authorization: `Bearer ${connectionConfig.val.access_token}`,
      },
    });

    return {
      data: await result.json(),
      error: null,
      successful: true,
    };
  },
});
```

## Using Custom Headers and Query Parameters

You can add custom headers and query parameters to your toolkit-based tools using the `parameters` option in `executeToolRequest`:

**Python:**

```python
@composio.tools.custom_tool(toolkit="github")
def get_issue_info(
    request: GetIssueInfoInput,
    execute_request: ExecuteRequestFn,
    auth_credentials: dict,
) -> dict:
    """Get information about a GitHub issue."""
    response = execute_request(
        endpoint=f"/repos/composiohq/composio/issues/{request.issue_number}",
        method="GET",
        parameters=[

                "name": "Accept",
                "value": "application/vnd.github.v3+json",
                "type": "header",
            },

                "name": "Authorization",
                "value": f"Bearer {auth_credentials['access_token']}",
                "type": "header",
            },

                "name": 'X-Custom-Header',
                "value": 'custom-value',
                "type": 'header',
            },
        ],
    )
    return {"data": response.data}
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
import { z } from 'zod/v3';
const composio = new Composio({ apiKey: 'your_api_key' });
const tool = await composio.tools.createCustomTool({
  slug: 'GITHUB_SEARCH_REPOSITORIES',
  name: 'Search GitHub Repositories',
  description: 'Search for repositories with custom parameters',
  toolkitSlug: 'github',
  inputParams: z.object({
    query: z.string().describe('Search query'),
    perPage: z.number().optional().describe('Results per page'),
    acceptType: z.string().optional().describe('Custom accept header'),
  }),
  execute: async (input, connectionConfig, executeToolRequest) => {
    const result = await executeToolRequest({
      endpoint: '/search/repositories',
      method: 'GET',
      parameters: [
        // Add query parameters for pagination

          name: 'q',
          value: input.query,
          in: 'query',
        },

          name: 'per_page',
          value: (input.perPage || 30).toString(),
          in: 'query',
        },
        // Add custom headers

          name: 'Accept',
          value: input.acceptType || 'application/vnd.github.v3+json',
          in: 'header',
        },

          name: 'X-Custom-Header',
          value: 'custom-value',
          in: 'header',
        },
      ],
    });
    return result;
  },
});
```

# Executing Custom Tools

You can execute custom tools just like any other tool:

**Python:**

```python
response = composio.tools.execute(
    user_id="default",
    slug="TOOL_SLUG", # For the tool above you can use `get_issue_info.slug`
    arguments={"issue_number": 1},
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const result = await composio.tools.execute('TOOL_SLUG', {
  arguments: {
    // Tool input parameters
  },
  userId: 'user-id',
  connectedAccountId: 'optional-account-id', // Required for toolkit-based tools
});
```

# Best Practices

1. Use descriptive names and slugs for your tools
2. Always provide descriptions for input parameters using `describe()`
3. Handle errors gracefully in your execute function
4. For toolkit-based tools:
  * Prefer `executeToolRequest` over direct API calls when possible
  * Use relative paths with `executeToolRequest` - Composio will automatically inject the correct baseURL
  * Use the `parameters` option to add custom headers or query parameters:
```typescript
parameters: [
  { name: 'page', value: '1', in: 'query' }, // Adds ?page=1 to URL
  { name: 'x-custom', value: 'value', in: 'header' }, // Adds header
];
```
  * Remember that `executeToolRequest` can only call tools from the same toolkit
  * Use `executeToolRequest` to leverage Composio's automatic credential handling
  * Only use `connectionConfig` when you need to make direct API calls or interact with different services
5. Chain multiple toolkit operations using `executeToolRequest` for better maintainability

# Limitations

1. Custom tools are stored in memory and are not persisted
2. They need to be recreated when the application restarts
3. Toolkit-based tools require a valid connected account with the specified toolkit
4. `executeToolRequest` can only execute tools from the same toolkit that the custom tool belongs to
5. Each toolkit-based tool can only use one connected account at a time

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.


# Toolkit Versioning (/docs/tools-direct/toolkit-versioning)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions) instead. Sessions handle toolkit versions automatically so you don't have to manage them yourself.

Toolkit versioning ensures your tools behave consistently across deployments. You can pin specific versions in production, test new releases in development, and roll back when needed.

To view available versions, go to [Dashboard](https://platform.composio.dev) > **All Toolkits** > select a toolkit. The version dropdown shows the latest and all available versions:

<img alt="Toolkit version selector on the Composio dashboard" src={__img0} placeholder="blur" />

You can also find the latest version for each toolkit on the [Toolkits](/toolkits) page in the docs. Select a toolkit to see its current version and available tools.

> Starting from Python SDK v0.9.0 and TypeScript SDK v0.2.0, specifying versions is required for manual tool execution.

# Configuration methods

Configure toolkit versions using one of three methods:

## SDK initialization

**Python:**

```python
from composio import Composio

# Pin specific versions for each toolkit
composio = Composio(
    api_key="YOUR_API_KEY",
    toolkit_versions={
        "github": "20251027_00",
        "slack": "20251027_00",
        "gmail": "20251027_00"

)
```

**TypeScript:**

```typescript
import { Composio } from "@composio/core";

// Pin specific versions for each toolkit
const composio = new Composio({
    apiKey: "YOUR_API_KEY",
    toolkitVersions: {
        github: "20251027_00",
        slack: "20251027_00",
        gmail: "20251027_00"

});
```

## Environment variables

```bash
# Set versions for specific toolkits
export COMPOSIO_TOOLKIT_VERSION_GITHUB="20251027_00"
export COMPOSIO_TOOLKIT_VERSION_SLACK="20251027_00"
export COMPOSIO_TOOLKIT_VERSION_GMAIL="20251027_00"
```

## Per-execution override

**Python:**

```python
from composio import Composio

composio = Composio(api_key="YOUR_API_KEY")

# Specify version directly in execute call
result = composio.tools.execute(
    "GITHUB_LIST_STARGAZERS",
    arguments={
        "owner": "ComposioHQ",
        "repo": "composio"
    },
    user_id="user-k7334",
    version="20251027_00"  # Override version for this execution
)
print(result)
```

**TypeScript:**

```typescript
import { Composio } from "@composio/core";

const composio = new Composio({ apiKey: "YOUR_API_KEY" });

// Specify version directly in execute call
const result = await composio.tools.execute("GITHUB_LIST_STARGAZERS", {
    userId: "user-k7334",
    arguments: {
        owner: "ComposioHQ",
        repo: "composio"
    },
    version: "20251027_00"  // Override version for this execution
});
console.log(result);
```

# Version format

Versions follow the format `YYYYMMDD_NN`:

* `YYYYMMDD`: Release date
* `NN`: Sequential release number

```python
# Production
toolkit_versions = {"github": "20251027_00"}

# Development
toolkit_versions = {"github": "latest"}
```

> Never use `latest` in production. It can introduce breaking changes.

# Version resolution order

1. Per-execution version (highest priority)
2. SDK initialization version
3. Environment variable (toolkit-specific)

# Managing versions

Check available versions using:

**Python:**

```python
# Get toolkit information including available versions
toolkit = composio.toolkits.get(slug="github")

# Extract and print version information
print(f"Toolkit: {toolkit.name}")
print(f"Current Version: {toolkit.meta.version}")
print(f"Available Versions: {toolkit.meta.available_versions}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
// Get toolkit information including available versions
const toolkit = await composio.toolkits.get("github");

// Extract and print version information
console.log("Toolkit:", toolkit.name);
console.log("Available Versions:", toolkit.meta.availableVersions);
console.log("Latest Version:", toolkit.meta.availableVersions?.[0]);
```

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.


# Custom Auth Configs (/docs/auth-configuration/custom-auth-configs)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions) instead. See [Using custom auth configs](/docs/using-custom-auth-configuration) for how to use custom credentials with sessions.

Many toolkits support a level of customization for the auth config, specifically OAuth applications.

This guide will walk you through the process of customizing the auth config for toolkits where you can configure your own developer app.

# Creating a custom auth config

To create a custom auth config, click **Create Auth Config** in your dashboard, then navigate to **Authentication management** → **Manage authentication with custom credentials**.

You'll need to customize the auth config when you want to use different values than the defaults - such as your own subdomain, base URL, client ID, client secret, etc.

**Example: PostHog:**

You may change the subdomain for the PostHog toolkit to match your own instance.

![PostHog Auth Config Settings](/images/custom-auth-posthog.png)
*PostHog Auth Config Settings*

**Example: Hubspot:**

For Hubspot you may customize everything here. For each auth scheme there is a different set of fields.

If you choose to use your own developer app for the OAuth2 scheme, you will have to provide the client ID and client secret.

![Hubspot Auth Config Settings](/images/custom-auth-hubspot.png)
*Hubspot Auth Config Settings*

Toolkits that support OAuth2 allow using your own developer app. This is the recommended approach for most cases.

> **Use your own developer app!**: We recommend using your own developer app for the OAuth2 scheme as it is more suited for production usage with many users and more granular control over scopes.

However, getting OAuth approvals takes time, so Composio provides a default developer app!

# OAuth2 Auth Configs

#### Generate the OAuth Client ID and Client Secret

To set up a custom OAuth config, you'll need the OAuth Client ID and Client Secret.

You can generate the client ID and client secret from your provider's OAuth configuration page.

Examples for Google and GitHub:

**Google:**

![Google OAuth Configuration](/images/google-oauth-config.png)
*Google OAuth Configuration*

**GitHub:**

![GitHub OAuth Configuration](/images/github-oauth-config.png)
*GitHub OAuth Configuration*

#### Set the Authorized Redirect URI

When creating your OAuth app, make sure to configure the Authorized Redirect URI to point to the Composio callback URL below:

```
https://backend.composio.dev/api/v3/toolkits/auth/callback
```

#### Create the auth config

Once you have the OAuth credentials, you can add them to the auth config in the dashboard.

    1. Select the OAuth2 scheme.
    2. Select the scopes to request from users. Default scopes are pre-filled for most apps.
    3. Add the OAuth client ID and client secret for your developer app. Keep the redirect URL as is for now!
    4. Click Create!

![Auth Config Settings](/images/integration-step-3-0.png)
*Auth Config Settings*

This auth config is now ready to be used in your application!

**Python:**

```python
# Create a new connected account
connection_request = composio.connected_accounts.initiate(
    user_id="user_id",
    auth_config_id="ac_1234",
)
print(connection_request)

# Wait for the connection to be established
connected_account = connection_request.wait_for_connection()
print(connected_account)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user_123';
const connReq = await composio.connectedAccounts.initiate(userId, "ac_1234");

console.log(connReq.redirectUrl);

const connection = await composio.connectedAccounts.waitForConnection(
  connReq.id
);

console.log(connection);
```

## White-labeling the OAuth Consent Screen

By default the users will see an OAuth screen like the one below:

![Composio's Domain in OAuth Consent Screen](/images/oauth-branding.png)
*Composio's Domain in OAuth Consent Screen*

The OAuth redirect URL is surfaced in some OAuth providers' consent screens. This may cause confusion for some users as that URL is not of the same domain as the application.

To remediate this:

#### Set the Authorized Redirect URI

Specify the Authorized Redirect URI to your own domain in the OAuth configuration.
For example:

```
https://yourdomain.com/api/composio-redirect
```

#### Create a redirect logic

Create a redirect logic, either through your DNS or in your application to redirect that endpoint to `https://backend.composio.dev/api/v3/toolkits/auth/callback`

**Example: API Route for OAuth Redirect**

**Python:**

```python
from fastapi import FastAPI
from fastapi.responses import RedirectResponse

from composio import Composio

# Create a FastAPI app
app = FastAPI()

# Create a Composio client
composio = Composio()

@app.get("/authorize/{toolkit}")
def authorize_app(toolkit: str):
    # retrieve the user id from your app
    user_id = "<user_id>"

    # retrieve the auth config id from your app
    auth_config_id = "<auth_config_id>"

    # initiate the connection request
    connection_request = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
    )
    return RedirectResponse(url=connection_request.redirect_url)
```

**TypeScript:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // The target Composio endpoint that handles OAuth callbacks
  const composioEndpoint = 'https://backend.composio.dev/api/v3/toolkits/auth/callback';

  // Extract and preserve all query parameters
  const queryParams = new URLSearchParams();
  Object.entries(req.query).forEach(([key, value]) => {
    if (typeof value === 'string') {
      queryParams.append(key, value);

  });

  // Redirect to Composio with all query parameters intact
  const redirectUrl = `${composioEndpoint}?${queryParams.toString()}`;
  res.redirect(302, redirectUrl);

```

#### Create the auth config

Specify your custom redirect URI in the auth config settings!

![Auth Config Settings](/images/custom-redirect-uri.png)
*Auth Config Settings*

With this setup, you can use `https://yourdomain.com/api/composio-redirect` as your OAuth redirect URI, which will create a better user experience by keeping users on your domain during the OAuth flow.

**How does this work?**

The custom OAuth config allows you to use your own domain in the OAuth consent screen instead of Composio's domain. Here's the core difference:

backend.composio.dev]
C -->|Custom Domain| E[Provider redirects to<br/>yourdomain.com/api/composio-redirect]

E --> F[Your endpoint forwards to<br/>backend.composio.dev]

D --> G[Composio exchanges code for token]
F --> G

G --> H[Connection established]

style E fill:#e1f5fe
style F fill:#e1f5fe
style C fill:#fff3e0"
/>

**Key Benefits:**

    * **Custom Domain**: Users see your domain in OAuth consent screens, not Composio's
    * **Same Security**: Your domain just forwards the OAuth callback - no token handling
    * **Better UX**: Maintains brand consistency throughout the auth flow

The custom redirect endpoint is a simple passthrough that preserves all OAuth parameters while keeping users on your domain.

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.

# Programmatic Auth Configs (/docs/auth-configuration/programmatic-auth-configs)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions#custom-auth-configs) instead. Sessions let you pass custom auth configs directly when creating a session.

Auth configs are created once and reused many times. However, when managing multiple toolkits, you may want to create auth configs programmatically.

* When creating and destroying auth configs multiple times in your app's lifecycle.
* When creating auth configs for your users' users.

# OAuth2 based apps

## Using Composio Default Auth

Since OAuth2 is the most common authentication type for applications, Composio provides managed auth for most OAuth2 based applications. This is to speed up development and prototyping. This means you don't have to provide your own OAuth credentials.

**Python:**

```python
from composio import Composio

composio = Composio()

# Use composio managed auth
auth_config = composio.auth_configs.create(
    toolkit="github",
    options={
        "type": "use_composio_managed_auth",
    },
)
print(auth_config)
```

**TypeScript:**

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();

const authConfig = await composio.authConfigs.create("GITHUB", {
  name: "GitHub",
  type: "use_composio_managed_auth",
});

console.log(authConfig);
```

The returned `auth_config_id` should be stored securely in your database for future use to be created and destroyed multiple times.

You can also provide your own authentication details. The required `credentials` and `authScheme` depend on the auth type.

## Using your own OAuth2 credentials

Setting up and using your own OAuth2 credentials is the recommended way when going to production or expecting high usage.

In this example, we're using our own OAuth2 client ID and secret to create the auth config for Notion.

**Python:**

```python
# Use custom auth
auth_config = composio.auth_configs.create(
    toolkit="notion",
    options={
        "name": "Notion Auth",
        "type": "use_custom_auth",
        "auth_scheme": "OAUTH2",
        "credentials": {
            "client_id": "1234567890",
            "client_secret": "1234567890",
            "oauth_redirect_uri": "https://backend.composio.dev/api/v3/toolkits/auth/callback",
        },
    },
)
print(auth_config)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const authConfig = await composio.authConfigs.create("NOTION", {
    name: "Notion",
    type: "use_custom_auth",
    credentials: {
        client_id: "1234567890",
        client_secret: "1234567890",
        oauth_redirect_uri: "https://backend.composio.dev/api/v3/toolkits/auth/callback",
    },
    authScheme: "OAUTH2",
});

console.log(authConfig);
```

> You can specify a custom redirect URI by including the `oauth_redirect_uri` parameter in the credentials object. If not provided, Composio uses the default redirect URI.

**Specifying the authorized redirect URI**

The process of setting up your own OAuth2 credentials usually involves generating a client ID and secret and specifying the **authorized redirect URI** in the OAuth configuration.

> The **authorized redirect URI** is the URI that captures the OAuth code that is returned to the app.

While doing so, you must ensure to set the **authorized redirect URI** in the OAuth configuration to:

```
https://backend.composio.dev/api/v3/toolkits/auth/callback
```

**GitHub:**

![Developer settings for GitHub OAuth2 app](/images/github-callback.png)
*Redirect URI for GitHub*

**Google:**

![Developer settings for Google OAuth2 app](/images/google-callback.png)
*Redirect URI for Google*

## Specifying scopes

Composio requests a set of appropriate default OAuth2 scopes for each toolkit wherever possible. However, you can override or modify these scopes by passing a `scopes` field to the `credentials` object.

**Python:**

```python
from composio import Composio

composio = Composio()

response = composio.auth_configs.create(
    toolkit="HUBSPOT",
    options={
        "name": "HubspotConfig",
        "authScheme": "OAUTH2",
        "type": "use_composio_managed_auth",
        "credentials": {
            "scopes": "sales-email-read,tickets"

)

print(response.id)
```

**TypeScript:**

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();

const authConfig = await composio.authConfigs.create("HUBSPOT", {
  name: "HubspotConfig",
  type: "use_composio_managed_auth",
  credentials: {
    scopes: "sales-email-read,tickets",
  },
});

console.log(authConfig);
```

# Other auth types

Composio supports many applications that use different authentication types like API keys, Bearer tokens, JWT and even no authentication at all.

Generating the auth config for other auth types only has minor differences:

* `use_custom_auth` is used instead of `use_composio_managed_auth`
* The `credentials` field is used to pass the authentication details
* The `authScheme` field is used to specify the auth type

**Python:**

```python
# Use custom auth
auth_config = composio.auth_configs.create(
    toolkit="perplexityai",
    options={
        "type": "use_custom_auth",
        "auth_scheme": "API_KEY",
        "credentials": {}
    },
)
print(auth_config)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const authConfig = await composio.authConfigs.create('PERPLEXITYAI', {
  name: 'Perplexity AI',
  type: 'use_custom_auth',
  credentials: {},
  authScheme: 'API_KEY',
});

console.log(authConfig);
```

# Programmatically inspecting fields

In cases where you need to dynamically discover the exact field names and handle different auth schemes programmatically, you can inspect the auth config details first.

This works for all auth types.

**Python:**

```python
required_fields = composio.toolkits.get_auth_config_creation_fields(
    toolkit="NOTION",
    auth_scheme="OAUTH2",
    required_only=True,
)
print(required_fields)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const toolkits = await composio.toolkits.get("NOTION");

// Extract field names from authConfigDetails
const authFields = await composio.toolkits.getAuthConfigCreationFields('NOTION', 'OAUTH2', {
  requiredOnly: true,
});

console.log("Required auth config fields:", authFields);
```

Then inspect the required fields and specify them in the `credentials` object.

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.


# Custom Auth Parameters (/docs/auth-configuration/custom-auth-params)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions) instead. Sessions handle authentication automatically via [in-chat authentication](/docs/authenticating-users/in-chat-authentication) or [manual authentication](/docs/authenticating-users/manually-authenticating).

In cases where Composio is not being used for managing the auth but only for the tools, it is possible to use the `beforeExecute` hook to inject custom auth headers or parameters for a toolkit.

# Setup and Initialization

First, initialize the Composio SDK with your API key:

**Python:**

```python
from composio import Composio

composio = Composio()
```

**TypeScript:**

```typescript
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});
```

# Creating the Auth Modifier Function

Define a function that modifies authentication parameters for specific toolkits. This function checks the toolkit name and adds custom authentication headers when needed.

- [This is a Before Execute Modifier!](/docs/tools-direct/modify-tool-behavior/before-execution-modifiers): 
Before Execute Modifiers are a way to modify the parameters of a tool before it is executed. In this case, they are useful for adding custom authentication headers or parameters to a tool.

**Python:**

```python
from composio import before_execute
from composio.types import ToolExecuteParams

@before_execute(toolkits=["NOTION"])
def add_custom_auth(
    tool: str,
    toolkit: str,
    params: ToolExecuteParams,
) -> ToolExecuteParams:
    if params["custom_auth_params"] is None:
        params["custom_auth_params"] = {"parameters": []}

    params["custom_auth_params"]["parameters"].append(

            "name": "x-api-key",
            "value": os.getenv("NOTION_API_KEY"),
            "in": "header",

    )
    return params
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const authModifier = ({ toolSlug, toolkitSlug, params }: { toolSlug: string; toolkitSlug: string; params: any }) => {
  // Add authentication parameters for specific toolkits
  if (toolkitSlug === "NOTION") {
    if (!params.customAuthParams) {
      params.customAuthParams = {};

    if (!params.customAuthParams.parameters) {
      params.customAuthParams.parameters = [];

    // Add an API key to the headers
    params.customAuthParams.parameters.push({
      in: "header",
      name: "X-API-Key",
      value: process.env.CUSTOM_API_KEY,
    });

  return params;
};
```

# Executing Tools with Custom Auth

Execute the tool using the custom authentication modifier. The `beforeExecute` hook allows you to modify parameters before the tool runs.

Following is an example of how to execute a tool with a custom authentication modifier for Completion Providers.

For Agentic Providers, read about [Modifying tool inputs](/docs/tools-direct/modify-tool-behavior/before-execution-modifiers).

**Python:**

```python
result = composio.tools.execute(
    slug="NOTION_GET_DATABASE_ITEMS",
    user_id="default",
    arguments={},
    modifiers=[
        add_custom_auth,
    ],
)
print(result)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const authModifier = ({ toolSlug, toolkitSlug, params }: { toolSlug: string; toolkitSlug: string; params: any }) => {
  if (toolkitSlug === 'NOTION' && !params.customAuthParams) {
    params.customAuthParams = { parameters: [{ in: 'header', name: 'X-API-Key', value: 'key' }] };

  return params;
};
const result = await composio.tools.execute(
  "NOTION_GET_DATABASE_ITEMS",

    userId: "sid",
    arguments: {
      database_id: "1234567890",
    },
  },

    beforeExecute: authModifier,

);

console.log(JSON.stringify(result, null, 2));
```

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.


# Connected Accounts (/docs/auth-configuration/connected-accounts)

> If you're building an agent, we recommend using [sessions](/docs/configuring-sessions) instead. See [Managing multiple connected accounts](/docs/managing-multiple-connected-accounts) for how sessions handle account selection automatically.

Connected accounts are authenticated connections between your users and toolkits. After users authenticate (see [Authenticating tools](/docs/tools-direct/authenticating-tools)), you can manage these accounts throughout their lifecycle.

Composio automatically handles token refresh and credential management. This guide covers manual operations: listing, retrieving, refreshing, enabling, disabling, and deleting accounts.

# List accounts

Retrieve all connected accounts with optional filters:

**Python:**

```python
# List all accounts for a user
accounts = composio.connected_accounts.list(
    user_ids=[user_id]
)

# Filter by status
active_accounts = composio.connected_accounts.list(
    user_ids=[user_id],
    statuses=["ACTIVE"]
)
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user_123';
// List all accounts for a user
const accounts = await composio.connectedAccounts.list({
  userIds: [userId]
});

// Filter by status
const activeAccounts = await composio.connectedAccounts.list({
  userIds: [userId],
  statuses: ['ACTIVE']
});
```

# Get account details

Retrieve a connected account by ID:

**Python:**

```python
account = composio.connected_accounts.get(connected_account_id)

print(f"Status: {account.status}")
print(f"Toolkit: {account.toolkit.slug}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const connectedAccountId = 'ca_123';
const account = await composio.connectedAccounts.get(connectedAccountId);

console.log('Status:', account.status);
console.log('Toolkit:', account.toolkit.slug);
```

## Get account credentials

Get account credentials for use with your own tools:

**Python:**

```python
# Get the connected account's authentication state
if account.state:
    # The state contains the auth scheme and credentials
    auth_scheme = account.state.auth_scheme
    credentials = account.state.val

    print(f"Auth scheme: {auth_scheme}")
    print(f"Credentials: {credentials}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const account = await composio.connectedAccounts.get('ca_123');
// Get the connected account's authentication state
if (account.state) {
  // The state contains the auth scheme and credentials
  const authScheme = account.state.authScheme;
  const credentials = account.state.val;

  console.log('Auth scheme:', authScheme);
  console.log('Credentials:', credentials);

```

# Refresh credentials

Manually refresh credentials for a connected account:

**Python:**

```python
try:
    refreshed = composio.connected_accounts.refresh(connected_account_id)
    print(f"Redirect URL: {refreshed.redirect_url}")

    # Wait for the connection to be established
    composio.connected_accounts.wait_for_connection(refreshed.id)
except Exception as e:
    print(f"Failed to refresh tokens: {e}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const connectedAccountId = 'ca_123';
try {
  const refreshed = await composio.connectedAccounts.refresh(connectedAccountId);
  console.log('Redirect URL:', refreshed.redirect_url);

  // Wait for the connection to be established
  await composio.connectedAccounts.waitForConnection(refreshed.id);
} catch (error) {
  console.error('Failed to refresh tokens:', error);

```

# Enable and disable accounts

Change account status without deleting. Set to INACTIVE to pause access, or ACTIVE to restore. Useful for:

* Pausing access during subscription lapses
* Temporary disconnection

**Python:**

```python
# Disable an account
disabled = composio.connected_accounts.disable(connected_account_id)
print(f"Account disabled status: {disabled.success}")

# Re-enable when needed
enabled = composio.connected_accounts.enable(connected_account_id)
print(f"Account enabled status: {enabled.success}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const connectedAccountId = 'ca_123';
// Disable an account
const disabled = await composio.connectedAccounts.disable(connectedAccountId);
console.log('Account disabled status:', disabled.success);

// Re-enable when needed
const enabled = await composio.connectedAccounts.enable(connectedAccountId);
console.log('Account enabled status:', enabled.success);
```

> INACTIVE accounts cannot execute tools. Tool execution will fail until the status is changed.

# Delete accounts

Permanently remove a connected account and revoke all credentials:

**Python:**

```python
# Delete a connected account
composio.connected_accounts.delete(connected_account_id)
print("Account deleted successfully")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const connectedAccountId = 'ca_123';
// Delete a connected account
await composio.connectedAccounts.delete(connectedAccountId);
console.log('Account deleted successfully');
```

> Deletion is permanent. Users must re-authenticate to reconnect.

# Credential masking

By default, sensitive fields in connected account responses are partially masked for security. This affects fields like `access_token`, `refresh_token`, `api_key`, `bearer_token`, `password`, and other secrets.

Instead of returning full values, the API returns the first 4 characters followed by `...`:

```json
"access_token": "gho_...",
"refresh_token": "ghr_...",
"api_key": "sk-l..."

```

Values shorter than 4 characters are replaced with `REDACTED`.

This applies to the Get Connected Account and List Connected Accounts endpoints.

## Disabling masking

If you need full credential values (e.g., to use tokens in your own API calls), disable masking via either:

1. **Dashboard**: Go to **Settings → Project Settings → Project Configuration** and turn off "Mask Connected Account Secrets"
2. **API**:

```bash
curl -X PATCH https://backend.composio.dev/api/v3/org/project/config \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"mask_secret_keys_in_connected_account": false}'
```

> Disabling masking exposes full credentials in API responses. Only disable this if your application needs direct access to tokens and you have appropriate security measures in place.

# Multiple accounts

Users can connect multiple accounts for the same toolkit (e.g., personal and work Gmail).

> Use `link()` for creating accounts, as it provides hosted authentication and allows multiple accounts by default. See [Connect Link authentication](/docs/tools-direct/authenticating-tools#hosted-authentication-connect-link).

**Python:**

```python
# First account
try:
    first_account = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id
    )
    print(f"First account redirect URL: {first_account.redirect_url}")
    connected_first_account = first_account.wait_for_connection()
    print(f"First account status: {connected_first_account.status}")
except Exception as e:
    print(f"Error initiating first account: {e}")

# Second account - must explicitly allow multiple
try:
    second_account = composio.connected_accounts.initiate(
        user_id=user_id,
        auth_config_id=auth_config_id,
        allow_multiple=True  # Required for additional accounts
    )
    print(f"Second account redirect URL: {second_account.redirect_url}")
    connected_second_account = second_account.wait_for_connection()
    print(f"Second account status: {connected_second_account.status}")
except Exception as e:
    print(f"Error initiating second account: {e}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user_123';
const authConfigId = 'ac_123';
// First account
try {
  const firstAccount = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );
  console.log('First account redirect URL:', firstAccount.redirectUrl);
  const connectedFirstAccount = await firstAccount.waitForConnection();
  console.log('First account status:', connectedFirstAccount.status);
} catch (error) {
  console.error('Error initiating first account:', error);

// Second account - must explicitly allow multiple
try {
  const secondAccount = await composio.connectedAccounts.initiate(
    userId,
    authConfigId,

      allowMultiple: true  // Required for additional accounts

  );
  console.log('Second account redirect URL:', secondAccount.redirectUrl);
  const connectedSecondAccount = await secondAccount.waitForConnection();
  console.log('Second account status:', connectedSecondAccount.status);
} catch (error) {
  console.error('Error initiating second account:', error);

```

## Execute with a specific account

When you have multiple accounts, specify which one to use with `connected_account_id`:

**Python:**

```python
# Execute tool with a specific connected account
result = composio.tools.execute(
    "GMAIL_GET_PROFILE",
    user_id=user_id,
    connected_account_id=connected_account_id,  # Specify which account to use
    version="20251111_00",
    arguments={}
)
print(f"Tool executed: {result}")
```

**TypeScript:**

```typescript
import { Composio } from '@composio/core';
const composio = new Composio({ apiKey: 'your_api_key' });
const userId = 'user_123';
const connectedAccountId = 'ca_123';
// Execute tool with a specific connected account
const result = await composio.tools.execute('GMAIL_GET_PROFILE', {
  userId: userId,
  connectedAccountId: connectedAccountId,  // Specify which account to use
  version: '20251111_00',
  arguments: {}
});
console.log('Tool executed:', result);
```

---

📚 **More documentation:** [View all docs](https://docs.composio.dev/llms.txt) | [Cookbooks](https://docs.composio.dev/llms.mdx/cookbooks) | [API Reference](https://docs.composio.dev/llms.mdx/reference)

---

# Composio SDK — Instructions for AI Code Generators

**Context:** This page documents the **direct tool execution API**. For most applications, the session-based pattern (`composio.create(user_id)` + `session.tools()`) is simpler — but if the user is here, they likely want direct execution.

---

## Key Patterns

### Authenticating Users

Create an **Auth Config** on [platform.composio.dev](https://platform.composio.dev), then use the auth config ID to generate a hosted auth URL:

```python
from composio import Composio

composio = Composio()
connection = composio.connected_accounts.link(
    user_id="user_123",
    auth_config_id="ac_...",  # from platform dashboard
)
print(connection.redirect_url)  # send user here to authenticate
```

```typescript
import { Composio } from "@composio/core";

const composio = new Composio();
const connection = await composio.connectedAccounts.link("user_123", "ac_...", {
    callbackUrl: "https://your-app.com/callback",
});
console.log(connection.redirectUrl); // send user here to authenticate
```

### Executing Tools

```python
tools = composio.tools.get("user_123", tools=["GITHUB_CREATE_ISSUE"])

result = composio.tools.execute(
    "GITHUB_CREATE_ISSUE",
    {"owner": "org", "repo": "repo", "title": "Bug report"},
    user_id="user_123",
)
```

```typescript
const tools = await composio.tools.get("user_123", { tools: ["GITHUB_CREATE_ISSUE"] });

const result = await composio.tools.execute("GITHUB_CREATE_ISSUE", {
    userId: "user_123",
    arguments: { owner: "org", repo: "repo", title: "Bug report" },
});
```

---

## Rules

1. **`user_id` is required** — pass it to `tools.get()`, `tools.execute()`, and `provider.handle_tool_calls()`.
2. **`tools.execute()` signature** — Python: `execute(slug, arguments_dict, *, user_id=...)` (arguments is the second positional param). TypeScript: `execute(slug, { userId, arguments })`.
3. **Provider at init** — `Composio(provider=OpenAIProvider())` in Python, `new Composio({ provider: new OpenAIProvider() })` in TypeScript. Defaults to OpenAI if omitted.
4. **Correct provider imports** — `composio_<provider>` for Python, `@composio/<provider>` for TypeScript. For OpenAI Agents SDK use `composio_openai_agents` / `@composio/openai-agents`.
