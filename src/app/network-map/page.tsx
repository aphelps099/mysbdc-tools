'use client';

import dynamic from 'next/dynamic';

/* ═══════════════════════════════════════════════════════
   /network-map — NorCal SBDC Network Map
   Leaflet needs the browser, so the whole app is a
   client-only dynamic import.
   ═══════════════════════════════════════════════════════ */

const NetworkMapApp = dynamic(() => import('@/components/network-map/NetworkMapApp'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'grid', placeContent: 'center', height: '100vh', fontFamily: 'Georgia, serif' }}>
      Loading the network map…
    </div>
  ),
});

export default function NetworkMapPage() {
  return <NetworkMapApp />;
}
