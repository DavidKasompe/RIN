import 'dotenv/config';
import { Composio } from '@composio/core';

async function main() {
    const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
    console.log("Methods on composio.tools:", Object.getOwnPropertyNames(Object.getPrototypeOf(composio.tools)));
}
main();
