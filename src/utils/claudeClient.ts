import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function askClaude(message: string): Promise<string> {
  const res = await anthropic.beta.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: message }],
    mcp_servers: [
      {
        type: "url",
        url: process.env.GLAMA_AI_MCP_URL!,
        name: process.env.GLAMA_AI_MCP_NAME!,
        authorization_token: process.env.GLAMA_AI_AUTH_TOKEN!,
      },
    ],
    betas: ["mcp-client-2025-04-04"],
  });

  if (Array.isArray(res.content)) {
    return res.content
      .map((block) => {
        if ("text" in block && typeof block.text === "string") {
          return block.text;
        }
        return "";
      })
      .join("");
  }
  return typeof res.content === "string" ? res.content : "";
}
