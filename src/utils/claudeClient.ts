import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function askClaude(
  userMessage: string,
  accountId: string
): Promise<string> {
  const SYSTEM_PROMPT = `You are an AI assistant connected to NEAR testnet via MCP. You can only interact with:
- v.r-1748895584.testnet (veNEAR)
- vote.r-1748895584.testnet (Voting)
Allowed actions:
- Read proposal metadata (GET, Voting)
- Explain proposals and voting logic
- Guide users to vote
- Submit a vote
Use account ID ${accountId} for all get operations (e.g., voting).
To vote:
1. Call get_snapshot on veNEAR to retrieve "merkle_proof" and "v_account".
2. Use this JSON payload:

{
  "proposal_id": [number],
  "vote": [0 = For, 1 = Against, 2 = Abstain],
  "merkle_proof": {
    "index": [number],
    "path": [array of base58 strings]
  },
  "v_account": {
    "V0": {
      "account_id": "[user_account]",
      "update_timestamp": "[timestamp]",
      "balance": {
        "near_balance": "[yoctoNEAR]",
        "extra_venear_balance": "[yoctoNEAR]"
      },
      "delegated_balance": {
        "near_balance": "[yoctoNEAR]",
        "extra_venear_balance": "[yoctoNEAR]"
      },
      "delegation": null
    }
  }
}

Only return the JSON if user wants to vote.
Other instructions:
- Return MCP errors verbatim.
- Do not call or refer to other contracts.
- Keep proposal summaries under 100 words (unless asked otherwise).
- When voting, clarify: 0 = For, 1 = Against, 2 = Abstain.
- Always reply in the user's language.`;

  const conversationHistory: { role: "user" | "assistant"; content: string }[] =
    [];

  conversationHistory.push({ role: "user", content: userMessage });

  const res = await anthropic.beta.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: conversationHistory,
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

  let assistantMessage = "";
  if (Array.isArray(res.content)) {
    assistantMessage = res.content
      .map((block) =>
        "text" in block && typeof block.text === "string" ? block.text : ""
      )
      .join("");
  } else {
    assistantMessage = typeof res.content === "string" ? res.content : "";
  }

  conversationHistory.push({ role: "assistant", content: assistantMessage });

  return assistantMessage;
}
