'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface SiteLeafletMapProps {
  lat?: number;
  lng?: number;
  siteName: string;
  machineCode: string;
  clientName?: string;
  radiusMeters?: number;
  className?: string;
}

export function SiteLeafletMap({
  lat,
  lng,
  siteName,
  machineCode,
  clientName,
  radiusMeters = 350,
  className = 'h-52 w-full',
}: SiteLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mounted, setMounted] = useState(false);

  // Validate or fallback coordinates
  const validLat = typeof lat === 'number' && !Number.isNaN(lat) && lat !== 0 ? lat : 19.0760;
  const validLng = typeof lng === 'number' && !Number.isNaN(lng) && lng !== 0 ? lng : 72.8777;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    // Destroy existing map instance if container was re-rendered
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [validLat, validLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap tiles without watermark
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Add Geofence circular perimeter
      const geofenceCircle = L.circle([validLat, validLng], {
        color: '#27272a',
        fillColor: '#71717a',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '5, 5',
        radius: radiusMeters,
      }).addTo(map);

      geofenceCircle.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 2px;">
          <strong style="color: #18181b;">🛡️ Geofence Boundary</strong><br/>
          <span>${siteName}</span><br/>
          <span style="color: #71717a;">Radius: ${radiusMeters}m</span>
        </div>
      `);

      // Custom pulsing Machine DivIcon
      const machineIcon = L.divIcon({
        className: 'custom-leaflet-machine-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background-color: rgba(39, 39, 42, 0.2); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 28px; height: 28px; border-radius: 9999px; background-color: #18181b; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); border: 2px solid white; font-size: 13px;">
              🚜
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([validLat, validLng], { icon: machineIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 2px;">
          <strong style="color: #0F172A; font-size: 13px;">🚜 ${machineCode}</strong><br/>
          <span style="color: #059669; font-weight: 600;">● Active on site</span><br/>
          <span style="color: #64748B;">Site: ${siteName}</span>
          ${clientName ? `<br/><span style="color: #94A3B8;">Client: ${clientName}</span>` : ''}
        </div>
      `).openPopup();

      // Trigger map resize invalidate after layout stabilizes
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } catch {
      // Graceful fallback if leaflet fails to initialize
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, validLat, validLng, siteName, machineCode, clientName, radiusMeters]);

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`}>
        <p className="text-xs text-slate-400">Loading Leaflet Map...</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
      <div ref={mapContainerRef} className={className} style={{ zIndex: 1 }} />
      {/* Top GPS Tag Overlay */}
      <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur-md dark:bg-slate-900/90 dark:text-slate-100">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Leaflet Live GPS</span>
        <span className="font-mono text-[10px] text-slate-500">({validLat.toFixed(4)}, {validLng.toFixed(4)})</span>
      </div>
    </div>
  );
}
