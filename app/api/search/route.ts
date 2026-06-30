import { NextRequest, NextResponse } from "next/server";

import { MIN_QUERY_LENGTH, searchAll } from "@/lib/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ items: [] });
  }

  const items = await searchAll(q);
  return NextResponse.json({ items });
}
