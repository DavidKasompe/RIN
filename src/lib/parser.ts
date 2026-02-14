/**
 * Safe JSON extraction from raw model output.
 * HF models sometimes wrap JSON in markdown code fences,
 * add commentary, or include extra text. This extracts
 * the first valid JSON object.
 */

export function extractJSON(text: string): unknown {
  // First, try direct parse (ideal case)
  try {
    return JSON.parse(text.trim());
  } catch {
    // Continue to extraction
  }

  // Remove markdown code fences if present
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Try parsing cleaned text
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to brace extraction
  }

  // Extract first { ... } block (handles extra text before/after)
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error(`No valid JSON object found in response: ${text.slice(0, 200)}`);
  }

  const jsonString = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    // Last resort: try to fix common JSON issues
    const fixed = jsonString
      .replace(/,\s*}/g, '}')       // trailing commas
      .replace(/,\s*]/g, ']')       // trailing commas in arrays
      .replace(/'/g, '"')           // single quotes
      .replace(/(\w+):/g, '"$1":'); // unquoted keys

    try {
      return JSON.parse(fixed);
    } catch {
      throw new Error(`Failed to parse JSON from model response: ${(e as Error).message}`);
    }
  }
}
