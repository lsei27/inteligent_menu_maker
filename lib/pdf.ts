/**
 * Generování PDF menu pomocí pdf-lib – podpora české diakritiky
 */
import { PDFDocument, rgb } from "pdf-lib";
import type { GeneratedMenu } from "./types";

const MM_TO_PT = 72 / 25.4;
const LINE_HEIGHT = 7 * MM_TO_PT;
const MARGIN = 20 * MM_TO_PT;
const PAGE_WIDTH = 210 * MM_TO_PT;
const PAGE_HEIGHT = 297 * MM_TO_PT;

const DEJAVU_FONT_URL =
  "https://unpkg.com/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf";

async function getFont(pdfDoc: PDFDocument) {
  const res = await fetch(DEJAVU_FONT_URL);
  if (!res.ok) throw new Error("Nepodařilo se načíst font");
  const bytes = new Uint8Array(await res.arrayBuffer());
  return pdfDoc.embedFont(bytes);
}

export async function generateMenuPDF(menu: GeneratedMenu): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await getFont(pdfDoc);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const weekStart = menu.days[0]?.date ?? "";
  const weekEnd = menu.days[menu.days.length - 1]?.date ?? "";

  const drawText = (text: string, x: number, size = 10): void => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHT;
  };

  const drawLine = (): void => {
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHT + 2;
  };

  drawText("POLEDNÍ MENU", MARGIN, 16);
  y -= 2;
  drawText(`${weekStart} - ${weekEnd}`, MARGIN, 12);
  y -= 6;
  drawLine();
  y -= 10;

  for (const day of menu.days) {
    drawText(`${day.day_name.toUpperCase()} ${day.date}`, MARGIN, 12);
    y -= 2;
    drawLine();
    y -= 2;
    drawText(`Polévka: ${day.soup.name}`, MARGIN);
    y -= 2;

    day.dishes.forEach((d, i) => {
      drawText(`${i + 1}. ${d.name}`, MARGIN);
    });
    y -= 8;

    if (y < MARGIN + 80) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  y -= 4;
  drawLine();
  y -= 10;
  drawText("⭐ TÝDENNÍ SPECIALITA ⭐", MARGIN, 12);
  y -= 2;
  drawText(menu.specialty.name, MARGIN, 11);
  y -= LINE_HEIGHT + 4;
  drawLine();

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
