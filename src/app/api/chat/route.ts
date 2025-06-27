// src/app/api/chat/route.ts
import { askClaude } from "@/utils/claudeClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message, accountId } = await req.json();

  try {
    const reply = await askClaude(message, accountId);

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Claude error:", error);
    return NextResponse.json(
      { error: "Error contacting Claude" },
      { status: 500 }
    );
  }
}
