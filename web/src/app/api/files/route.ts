import { NextRequest, NextResponse } from "next/server";
import {
  readFile,
  writeFile,
  deleteFile,
  commitAndPush,
  sanitizePath,
  fileExists,
} from "@/lib/git";

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get("path");

  if (!filePath) {
    return NextResponse.json(
      { error: "path parameter required" },
      { status: 400 }
    );
  }

  try {
    const file = await readFile(filePath);
    return NextResponse.json({ data: file });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "File not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: filePath, content, commitMessage } = body;

    if (!filePath || content === undefined) {
      return NextResponse.json(
        { error: "path and content required" },
        { status: 400 }
      );
    }

    const safe = sanitizePath(filePath);

    if (!safe.endsWith(".md")) {
      return NextResponse.json(
        { error: "Only .md files allowed" },
        { status: 400 }
      );
    }

    await writeFile(safe, content);

    const msg =
      commitMessage ||
      ((await fileExists(safe))
        ? `docs: update ${safe}`
        : `docs: create ${safe}`);

    const result = await commitAndPush(msg);

    return NextResponse.json({ data: { path: safe, gitResult: result } });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Write failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: filePath } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: "path required" },
        { status: 400 }
      );
    }

    const safe = sanitizePath(filePath);
    await deleteFile(safe);

    const result = await commitAndPush(`docs: delete ${safe}`);

    return NextResponse.json({ data: { deleted: safe, gitResult: result } });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
