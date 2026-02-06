import { NextResponse } from "next/server";
import { getMenuHistory } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ history: [] }, {
        headers: { "Cache-Control": "no-store" },
      });
    }
    const history = await getMenuHistory(12);
    return NextResponse.json({ history }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ history: [] }, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
