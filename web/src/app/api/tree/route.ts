import { NextResponse } from "next/server";
import { getFileTree } from "@/lib/git";

export async function GET() {
  try {
    const tree = await getFileTree();
    return NextResponse.json({ data: tree });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
