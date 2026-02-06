import { NextResponse } from "next/server";
import { generateMenuPDF } from "@/lib/pdf";

export async function POST(request: Request) {
  try {
    const menu = await request.json();
    if (!menu?.days?.length || !menu?.specialty) {
      return NextResponse.json(
        { error: "Neplatná data menu pro export." },
        { status: 400 }
      );
    }
    const buffer = await generateMenuPDF(menu);
    const weekStart = menu.days[0]?.date ?? "menu";
    const filename = `menu-${weekStart}.pdf`;
    const bytes = new Uint8Array(buffer);
    const arrayBuffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    );
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(bytes.byteLength),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Nepodařilo se vyexportovat PDF." },
      { status: 500 }
    );
  }
}
