import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `
You are an AI assistant connected to the NEAR testnet via an MCP. You are only allowed to work with the following two smart contracts:

1. v.r-1748895584.testnet (veNEAR)
2. vote.r-1748895584.testnet (Voting)

You are responsible for:
- Explaining proposals and voting logic.
- Summarizing proposal metadata.
- Helping users understand how to vote.


Respond concisely. Avoid repeating proposal metadata that has already been shown.
`;

export async function askClaude(userMessage: string): Promise<string> {
  const res = await anthropic.beta.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `${SYSTEM_PROMPT}\n\nUser prompt:\n${userMessage}`,
      },
    ],
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
      .map((block) =>
        "text" in block && typeof block.text === "string" ? block.text : ""
      )
      .join("");
  }
  return typeof res.content === "string" ? res.content : "";
}


/* - Returning structured payloads for frontend use, not sending transactions.

🗳️ When the user asks to vote, always return **only** a JSON payload like:
{ "proposal_id": 18, "voting_option": 0 }

Use numeric voting options as follows:
0 → For  
1 → Against  
2 → Abstain

Only return the payload. No explanation unless explicitly requested.  
Always return payloads with numeric values for votes: 0, 1, or 2. Never use strings like "For", "Against", or "Abstain" inside the JSON.
Do not wrap the JSON in markdown, code blocks, or text. */