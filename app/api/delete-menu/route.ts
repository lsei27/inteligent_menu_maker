import { NextResponse } from "next/server";
import { deleteMenuEntry } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export async function DELETE(request: Request) {
  console.log("[delete-menu] DELETE request received");
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
    console.log("[delete-menu] deleteMenuEntry result:", ok, "id:", id);
    if (!ok) {
      console.error("[delete-menu] Žádný řádek nebyl smazán, id:", id);
      return NextResponse.json(
        { error: "Nepodařilo se smazat záznam." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[delete-menu] Chyba:", e);
    return NextResponse.json(
      { error: "Nepodařilo se smazat záznam." },
      { status: 500 }
    );
  }
}
