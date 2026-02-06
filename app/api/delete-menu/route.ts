import { NextResponse } from "next/server";
import { deleteMenuEntry } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export async function DELETE(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Databáze není nakonfigurována." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Chybí ID záznamu." },
        { status: 400 }
      );
    }

    const ok = await deleteMenuEntry(id);
    if (!ok) {
      return NextResponse.json(
        { error: "Nepodařilo se smazat záznam." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Nepodařilo se smazat záznam." },
      { status: 500 }
    );
  }
}
