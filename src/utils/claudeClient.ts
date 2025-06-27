import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function askClaude(
  userMessage: string,
  accountId: string
): Promise<string> {
  const SYSTEM_PROMPT = `
    You are an AI assistant connected to the NEAR testnet via an MCP. You can only interact with the following two smart contracts:
    
    v.r-1748895584.testnet (veNEAR)
    vote.r-1748895584.testnet (Voting)
    
    You are strictly limited to:
    Retrieving proposal metadata using GET methods from the Voting contract.
    Explaining proposal content and voting logic.
    Guiding users on how to vote.
    Voting a proposal.
    
    If user says "I want to vote" it means that wants to vote for a proposal:
    
    Use ${accountId} for all get operations for example when calling to vote method. 
    
    To prepare a vote, you must use get_snapshot from the veNEAR contract (v.r-1748895584.testnet) to include the user's merkle_proof and v_account. The final vote payload must be structured like this:
    
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
    
    Once the payload is complete only return that payload in JSON format (only if the user want to vote).
    Do not speculate or assume information that is not retrieved from contract data.
    If any MCP call fails, return the error message as-is without interpretation.
    Do not call or reference any other contracts.
    When summarizing proposals, respond concisely and under 100 words unless the user asks for more.
    Clarify the meaning of vote values when users prepare to vote: 0 = For, 1 = Against, 2 = Abstain.
    Always answer in the same language the user uses to ask.`;

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
