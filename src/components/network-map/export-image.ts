import html2canvas from 'html2canvas';

/* ═══════════════════════════════════════════════════════
   Map image export — renders the live map stage (tiles,
   regions, pins, legend, attribution) to a PNG at 2×/4×/6×.
   Attribution must stay in the capture (MapTiler terms), so
   only transient chrome is excluded.
   ═══════════════════════════════════════════════════════ */

const EXCLUDED_CLASSES = ['nm-map-toolbar', 'nm-basemap-notice', 'leaflet-control-zoom', 'nm-map-empty'];

export async function exportMapImage(element: HTMLElement, scale: number): Promise<void> {
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#dfe8ef',
    ignoreElements: (node) =>
      node instanceof HTMLElement && EXCLUDED_CLASSES.some((cls) => node.classList.contains(cls)),
  });
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
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
