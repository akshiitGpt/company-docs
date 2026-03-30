import { NextRequest, NextResponse } from "next/server";
import { createDirectory, commitAndPush, sanitizePath } from "@/lib/git";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: dirPath } = body;

    if (!dirPath) {
      return NextResponse.json(
        { error: "path required" },
        { status: 400 }
      );
    }

    const safe = sanitizePath(dirPath);
    await createDirectory(safe);

    const result = await commitAndPush(`docs: create directory ${safe}`);

    return NextResponse.json({
      data: { path: safe, gitResult: result },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create directory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
