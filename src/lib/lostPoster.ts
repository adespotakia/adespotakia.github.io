/**
 * Builds the "ΧΑΘΗΚΕ" poster on a plain <canvas>.
 * We draw manually instead of using html2canvas: html2canvas cannot parse the
 * modern CSS color functions (oklch) that Tailwind v4 emits and throws.
 */
export interface LostPosterData {
  name: string;
  animalType: string;
  locations: string;
  details: string;
  phone: string;
  registererName: string;
  photoUrls: string[];
}

const W = 1240; // ~A4 at 150dpi
const H = 1754;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    if (/^https?:/.test(src)) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(" ")) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
};

export const buildPosterCanvas = async (data: LostPosterData): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const margin = 70;
  let y = 130;

  ctx.textAlign = "center";
  ctx.fillStyle = "#7c3aed";
  ctx.font = "bold 96px Arial, sans-serif";
  ctx.fillText("ΧΑΘΗΚΕ", W / 2, y);

  y += 70;
  const kind = data.animalType === "cat" ? "Γάτα" : data.animalType === "dog" ? "Σκύλος" : "Ζώο";
  ctx.fillStyle = "#111827";
  ctx.font = "bold 46px Arial, sans-serif";
  ctx.fillText(`${kind} — ακούει στο όνομα «${data.name || "—"}»`, W / 2, y);

  y += 50;
  const images = (await Promise.all(data.photoUrls.slice(0, 4).map(loadImage))).filter(
    Boolean,
  ) as HTMLImageElement[];

  if (images.length) {
    const cols = images.length === 1 ? 1 : 2;
    const cellW = (W - margin * 2 - (cols - 1) * 20) / cols;
    const cellH = images.length <= 2 ? 520 : 380;
    images.forEach((img, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = margin + col * (cellW + 20);
      const yy = y + row * (cellH + 20);
      // cover-fit
      const scale = Math.max(cellW / img.width, cellH / img.height);
      const sw = cellW / scale;
      const sh = cellH / scale;
      ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, yy, cellW, cellH);
    });
    const rows = Math.ceil(images.length / cols);
    y += rows * (cellH + 20) + 30;
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "#111827";
  ctx.font = "bold 36px Arial, sans-serif";
  ctx.fillText("Περιοχή:", margin, y);
  ctx.font = "36px Arial, sans-serif";
  const areaLines = wrap(ctx, data.locations || "—", W - margin * 2 - 180);
  areaLines.forEach((l, i) => ctx.fillText(l, margin + 180, y + i * 46));
  y += areaLines.length * 46 + 30;

  if (data.details.trim()) {
    ctx.font = "34px Arial, sans-serif";
    ctx.fillStyle = "#374151";
    const lines = wrap(ctx, data.details, W - margin * 2).slice(0, 10);
    lines.forEach((l, i) => ctx.fillText(l, margin, y + i * 44));
    y += lines.length * 44 + 30;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#111827";
  ctx.font = "bold 52px Arial, sans-serif";
  ctx.fillText(`Επικοινωνία: ${data.phone || "—"}`, W / 2, Math.max(y + 40, H - 180));

  ctx.fillStyle = "#6b7280";
  ctx.font = "30px Arial, sans-serif";
  ctx.fillText(`Αδέσπολις Ξάνθης — ${data.registererName}`, W / 2, H - 100);

  return canvas;
};
