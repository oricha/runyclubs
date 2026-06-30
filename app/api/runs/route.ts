import { NextRequest, NextResponse } from "next/server";

import { getRuns, parseRunFilters } from "@/lib/runs";

export async function GET(req: NextRequest) {
  const filters = parseRunFilters(req.nextUrl.searchParams);
  const result = await getRuns(filters);
  return NextResponse.json(result);
}
