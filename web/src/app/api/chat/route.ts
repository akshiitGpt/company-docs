import { NextRequest, NextResponse } from "next/server";
import { pullLatest } from "@/lib/git";

const OPENCLAW_URL =
  process.env.OPENCLAW_GATEWAY_URL || "http://localhost:18789";

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "message required" },
        { status: 400 }
      );
    }

    // Pull latest docs before answering
    await pullLatest();

    // Forward to OpenClaw gateway
    const response = await fetch(`${OPENCLAW_URL}/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.OPENCLAW_API_KEY
          ? { Authorization: `Bearer ${process.env.OPENCLAW_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        message,
        sessionId: sessionId || undefined,
        channel: "webchat",
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          error: `OpenClaw returned ${response.status}`,
          details: text,
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Chat request failed";

    // If OpenClaw isn't running, return a helpful error
    if (
      message.includes("ECONNREFUSED") ||
      message.includes("fetch failed")
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot connect to OpenClaw gateway. Ensure it is running.",
          details: `Tried: ${OPENCLAW_URL}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
