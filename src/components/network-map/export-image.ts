/* ═══════════════════════════════════════════════════════
   Map image download — turns a rendered <canvas> (produced
   by MapCanvas.renderToCanvas) into a PNG download. The
   rendering itself is native (see render-map.ts), so the
   color coding is always captured; this module only handles
   the blob + download.
   ═══════════════════════════════════════════════════════ */

export async function downloadCanvasPng(canvas: HTMLCanvasElement, scale: number): Promise<void> {
  const blob = await new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob(resolve, 'image/png');
    } catch {
      // Tainted canvas (a cross-origin basemap tile without CORS) — the
      // caller retries without the basemap.
      resolve(null);
    }
  });
  if (!blob) throw new Error('Could not render the map image.');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `norcal-sbdc-network-map@${scale}x.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
