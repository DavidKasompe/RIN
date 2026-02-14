import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_KEY!);

const STRUCTURED_SYSTEM_PROMPT = `You are RIN, an AI student dropout risk assessment system designed for educators. You analyze student data and provide structured risk assessments.

CRITICAL RULES:
- Always respond ONLY with valid JSON
- Never include markdown formatting, code fences, or commentary outside JSON
- Never include text before or after the JSON object
- Your output must be directly parseable by JSON.parse()`;

const GENERAL_SYSTEM_PROMPT = `You are RIN, an intelligent AI assistant for educators. You help with student risk assessment, educational planning, curriculum design, teaching strategies, and any other questions educators might have.

You are knowledgeable, helpful, and supportive. You can:
- Answer general education questions
- Generate roadmaps, plans, and strategies
- Discuss teaching methodologies
- Help with curriculum planning
- Provide educational resources and recommendations
- Analyze student data when asked

Respond in a clear, well-structured format using markdown. Use headers, bullet points, numbered lists, and bold text to make your responses easy to read.`;

export async function runHF(prompt: string): Promise<string> {
  const response = await hf.chatCompletion({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    messages: [
      { role: "system", content: STRUCTURED_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 1200,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from HF model");

  return content;
}

export async function runHFChat(prompt: string): Promise<string> {
  const response = await hf.chatCompletion({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    messages: [
      { role: "system", content: GENERAL_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from HF model");

  return content;
}

