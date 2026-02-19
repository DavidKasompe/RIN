import OpenAI from 'openai';

function getClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'sk-...') {
        throw new Error('OPENAI_API_KEY is not configured.');
    }
    return new OpenAI({ apiKey });
}

/**
 * Embed a piece of text using text-embedding-3-small.
 * Returns a 1536-dimension float array.
 */
export async function embedText(text: string): Promise<number[]> {
    const client = getClient();
    const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000), // guard against token limit
        encoding_format: 'float',
    });
    return response.data[0].embedding;
}

/**
 * Cosine similarity between two embedding vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    return magA === 0 || magB === 0 ? 0 : dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
