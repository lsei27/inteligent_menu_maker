/**
 * Generování PDF menu pomocí jspdf
 */
import { jsPDF } from "jspdf";
import type { GeneratedMenu } from "./types";

const LINE_HEIGHT = 7;
const MARGIN = 20;
const PAGE_WIDTH = 210;

function addText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: { fontSize?: number; bold?: boolean }
): number {
  const fs = options?.fontSize ?? 10;
  doc.setFontSize(fs);
  doc.setFont("helvetica", options?.bold ? "bold" : "normal");
  doc.text(text, x, y);
  return y + LINE_HEIGHT;
}

export function generateMenuPDF(menu: GeneratedMenu): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = MARGIN;

  const weekStart = menu.days[0]?.date ?? "";
  const weekEnd = menu.days[menu.days.length - 1]?.date ?? "";

  addText(doc, "POLEDNÍ MENU", MARGIN, y, { fontSize: 16, bold: true });
  y += LINE_HEIGHT + 2;
  addText(doc, `${weekStart} - ${weekEnd}`, MARGIN, y, { fontSize: 12 });
  y += LINE_HEIGHT + 6;

  doc.setDrawColor(0, 0, 0);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;

  for (const day of menu.days) {
    addText(doc, `${day.day_name.toUpperCase()} ${day.date}`, MARGIN, y, {
      fontSize: 12,
      bold: true,
    });
    y += LINE_HEIGHT + 2;

    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += LINE_HEIGHT + 2;

    addText(doc, `Polévka: ${day.soup.name}`, MARGIN, y);
    y += LINE_HEIGHT + 2;

    day.dishes.forEach((d, i) => {
      addText(doc, `${i + 1}. ${d.name}`, MARGIN, y);
      y += LINE_HEIGHT;
    });
    y += 8;

    if (y > 270) {
      doc.addPage();
      y = MARGIN;
    }
  }

  y += 4;
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;
  addText(doc, "⭐ TÝDENNÍ SPECIALITA ⭐", MARGIN, y, {
    fontSize: 12,
    bold: true,
  });
  y += LINE_HEIGHT + 2;
  addText(doc, menu.specialty.name, MARGIN, y, { fontSize: 11 });
  y += LINE_HEIGHT + 4;
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  const buffer = Buffer.from(doc.output("arraybuffer"));
  return buffer;
}
