import "dotenv/config";
import { Composio } from "@composio/core";
import { MCPClient } from "@mastra/mcp";

async function main() {
    console.log("Creating Composio session...");
    const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY as string });
    const session = await composio.create('testuser123', {
        toolkits: ["composio"],
    });

    console.log("Initializing MCP client...");
    const mcpClient = new MCPClient({
        id: 'testuser123',
        servers: {
            composio: {
                url: new URL(session.mcp.url),
                requestInit: {
                    headers: session.mcp.headers,
                },
            },
        },
        timeout: 30_000,
    });

    console.log("Getting tools...");
    const tools = await mcpClient.getTools();
    const firstKey = Object.keys(tools)[0];
    console.log("Total tools fetched:", Object.keys(tools).length);
    if (!firstKey) {
        console.log("No tools found!");
        return;
    }
    console.log("First tool:", firstKey);
    console.log("Tool obj keys:", Object.keys(tools[firstKey]));
    if (tools[firstKey].schema) {
        console.log("Has schema!");
    }
    if (tools[firstKey].inputSchema) {
        console.log("Has inputSchema", tools[firstKey].inputSchema);
    }

    await mcpClient.disconnect();
}
main().catch(console.error);
