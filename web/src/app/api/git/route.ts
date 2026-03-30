import { NextRequest, NextResponse } from "next/server";
import { pullLatest, getGitStatus, commitAndPush } from "@/lib/git";

export async function GET() {
  try {
    const status = await getGitStatus();
    return NextResponse.json({ data: status });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Git status failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "pull") {
      const result = await pullLatest();
      return NextResponse.json({ data: { result } });
    }

    if (action === "push") {
      const msg = body.message || "docs: manual sync";
      const result = await commitAndPush(msg);
      return NextResponse.json({ data: { result } });
    }

    return NextResponse.json(
      { error: 'Unknown action. Use "pull" or "push".' },
      { status: 400 }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Git operation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
