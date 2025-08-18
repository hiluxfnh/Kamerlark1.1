"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Image from 'next/image';
import klLogo from '../assets/kamerlark.png';
// Fix default marker icons path under Next.js bundling
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// Lazy load leaflet only on client
const LeafletMap: any = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false });
const TileLayer: any = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const Marker: any = dynamic(async () => (await import("react-leaflet")).Marker, { ssr: false });
const Circle: any = dynamic(async () => (await import('react-leaflet')).Circle, { ssr: false });
const useMapEvents: any = ((): any => {
  // trick: defer import to runtime
  try {
    // @ts-ignore
    return require("react-leaflet").useMapEvents;
  } catch {
    return () => null;
  }
})();

type LatLng = { lat: number; lng: number };

type Props = {
  value?: { address?: string; location?: LatLng };
  // source is optional and indicates how the location was set: 'gps' (Use my location), 'geocode' (search/suggestion), 'pick' (map click/drag)
  onChange?: (v: { address: string; location: LatLng; source?: 'gps' | 'geocode' | 'pick' }) => void;
};

const ClickHandler: React.FC<{ onPick: (p: LatLng) => void }> = ({ onPick }) => {
  const map = useMapEvents?.({
    click(e: any) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null as any;
};

const MapPicker: React.FC<Props> = ({ value, onChange }) => {
  const [query, setQuery] = useState<string>(value?.address || "");
  const [marker, setMarker] = useState<LatLng>(value?.location || { lat: 3.848, lng: 11.5021 });
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Array<{ label: string; lat: number; lng: number }>>([]);
  const [openSuggest, setOpenSuggest] = useState(false);
  const debounceRef = useRef<any>(null);
  const cacheRef = useRef<Map<string, Array<{ label: string; lat: number; lng: number }>>>(new Map());
  const CACHE_KEY = 'map_search_cache_v1';
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const tileUrl = mapTilerKey
    ? `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${mapTilerKey}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = mapTilerKey
    ? '&copy; MapTiler & OpenStreetMap contributors'
    : '&copy; OpenStreetMap contributors';
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string>("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  // Brand marker icon (Kamerlark logo) as a styled pin-shaped DivIcon
  const klMarkerIcon = useMemo(() => {
    try {
      const size = 44; // circle diameter
      const tail = 14; // pin tail height
      const bg = '#111827'; // gray-900
      const logo = (klLogo as any).src || (klLogo as unknown as string);
      const html = `
        <div style="position: relative; width: ${size}px; height: ${size + tail}px;">
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${bg};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.9);
          ">
            <img src="${logo}" alt="Kamerlark" style="width: 82%; height: 82%; object-fit: contain; border-radius: 6px;" />
          </div>
          <div style="
            position: absolute;
            left: 50%;
            bottom: 0px;
            width: ${tail}px;
            height: ${tail}px;
            background: ${bg};
            transform: translateX(-50%) translateY(20%) rotate(45deg);
            border-bottom-right-radius: 3px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            border-right: 2px solid rgba(255,255,255,0.9);
            border-bottom: 2px solid rgba(255,255,255,0.9);
          "></div>
        </div>`;
      return L.divIcon({
        html,
        className: '',
        iconSize: [size, size + tail] as any,
        iconAnchor: [size / 2, size + tail] as any,
        popupAnchor: [0, -size] as any,
      });
    } catch {
      return undefined as any;
    }
  }, []);

  // Load persisted cache
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, Array<{ label: string; lat: number; lng: number }>>;
        const m = new Map<string, Array<{ label: string; lat: number; lng: number }>>();
        Object.entries(obj).forEach(([k, v]) => m.set(k, v));
        cacheRef.current = m;
      }
    } catch {}
  }, []);

  const persistCache = () => {
    try {
      const obj: Record<string, Array<{ label: string; lat: number; lng: number }>> = {};
      // limit to last 30 entries
      const entries = Array.from(cacheRef.current.entries()).slice(-30);
      entries.forEach(([k, v]) => (obj[k] = v));
      if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch {}
  };

  useEffect(() => {
    if (value?.address) setQuery(value.address);
    if (value?.location) setMarker(value.location);
  }, [value?.address, value?.location]);

  const geocode = async (text: string) => {
    if (!text.trim()) return;
    setSearching(true);
    setError("");
    try {
      // Prefer MapTiler if key is provided
      if (mapTilerKey) {
        const r = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(text)}.json?key=${mapTilerKey}&limit=1`);
        const j = await r.json();
        if (j.features && j.features.length) {
          const f = j.features[0];
          const p = { lat: f.center[1], lng: f.center[0] };
          const addr = f.place_name || f.text || text;
          setMarker(p);
          onChange && onChange({ address: addr, location: p, source: 'geocode' });
          return;
        }
      }
      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (key) {
        const r = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(text)}&key=${key}`);
        const j = await r.json();
        if (j.status === "OK" && j.results?.length) {
          const loc = j.results[0].geometry.location;
          const addr = j.results[0].formatted_address;
          const p = { lat: loc.lat, lng: loc.lng };
          setMarker(p);
          onChange && onChange({ address: addr, location: p });
          return;
        }
      }
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`;
      const resp = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const p = { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
  setMarker(p);
  onChange && onChange({ address: first.display_name, location: p, source: 'geocode' });
      } else {
        setError("No results for that address.");
      }
    } catch (e: any) {
      setError(e?.message || "Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const onPick = (p: LatLng) => {
    setMarker(p);
    onChange && onChange({ address: query, location: p, source: 'pick' });
  };

  const reverseGeocode = async (p: LatLng): Promise<string> => {
    try {
      if (mapTilerKey) {
        const r = await fetch(`https://api.maptiler.com/geocoding/${p.lng},${p.lat}.json?key=${mapTilerKey}&limit=1`);
        const j = await r.json();
        const f = j?.features?.[0];
        const label = f?.place_name || f?.text || '';
        if (label) return label as string;
      }
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.lat}&lon=${p.lng}`);
      const d = await resp.json();
      return d.display_name || '';
    } catch {
      return '';
    }
  };

  const useMyLocation = async () => {
    setLocError("");
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocError("Geolocation not supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMarker(p);
        setAccuracy(typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : null);
        const addr = await reverseGeocode(p);
  if (addr) setQuery(addr);
  onChange && onChange({ address: addr || query, location: p, source: 'gps' });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocError(err?.message || 'Failed to get current location.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const Recenter: React.FC<{ position: LatLng; zoom?: number }> = ({ position, zoom = 15 }) => {
    const map = useMapEvents?.({});
    useEffect(() => {
      try {
        if (map && position?.lat && position?.lng) {
          map.setView([position.lat, position.lng], zoom, { animate: true });
        }
      } catch {}
    }, [position?.lat, position?.lng]);
    return null as any;
  };

  // Debounced suggestions as you type
  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const key = query.trim().toLowerCase();
      if (cacheRef.current.has(key)) {
        setSuggestions(cacheRef.current.get(key) || []);
        return;
      }
      try {
        // Prefer MapTiler if key exists; then Google; fallback to OSM Nominatim
        if (mapTilerKey) {
          const r = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${mapTilerKey}&limit=7`);
          const j = await r.json();
          const opts: Array<{ label: string; lat: number; lng: number }> = (j.features || []).map((f: any) => ({ label: f.place_name || f.text, lat: f.center[1], lng: f.center[0] }));
          setSuggestions(opts);
          cacheRef.current.set(key, opts);
          persistCache();
          return;
        }
        const gkey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (gkey) {
          const r = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${gkey}`);
          const j = await r.json();
          const opts: Array<{ label: string; lat: number; lng: number }> = (j.results || []).slice(0, 7).map((res: any) => ({ label: res.formatted_address, lat: res.geometry.location.lat, lng: res.geometry.location.lng }));
          setSuggestions(opts);
          cacheRef.current.set(key, opts);
          persistCache();
          return;
        }
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=7`;
        const resp = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await resp.json();
        const opts: Array<{ label: string; lat: number; lng: number }> = (Array.isArray(data) ? data : []).map((d: any) => ({ label: d.display_name, lat: parseFloat(d.lat), lng: parseFloat(d.lon) }));
        setSuggestions(opts);
        cacheRef.current.set(key, opts);
        persistCache();
      } catch (e) {
        // ignore suggestions error
      }
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div>
  <div className="flex gap-2 mb-2 relative items-stretch">
        <input
          type="text"
          className="border p-2 rounded-md flex-1"
          placeholder="Enter area, street, or place"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpenSuggest(true);
          }}
          onKeyDown={(e) => {
            if ((e as any).key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              geocode(query);
              setOpenSuggest(false);
            }
          }}
          onFocus={() => setOpenSuggest(true)}
          onBlur={() => setTimeout(() => setOpenSuggest(false), 200)}
        />
        <button
          type="button"
          className="px-4 py-2 rounded-md bg-black text-white disabled:bg-gray-400"
          disabled={!query.trim() || searching}
          onClick={() => geocode(query)}
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
          onClick={useMyLocation}
          disabled={locating}
          title="Use my current location"
        >
          {locating ? 'Locating…' : 'Use my location'}
        </button>
        {openSuggest && suggestions.length > 0 && (
          <ul className="absolute left-0 right-24 top-10 z-20 bg-white border rounded-md shadow max-h-60 overflow-auto text-sm">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery(s.label);
                  const p = { lat: s.lat, lng: s.lng };
                  setMarker(p);
                  onChange && onChange({ address: s.label, location: p, source: 'geocode' });
                  setOpenSuggest(false);
                }}
              >
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>
  {error ? <p className="text-sm text-red-600 mb-1">{error}</p> : null}
  {locError ? <p className="text-sm text-red-600 mb-2">{locError}</p> : null}
      <div style={{ height: 300, width: '100%', position: 'relative' }}>
        <LeafletMap center={[marker.lat, marker.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url={tileUrl} attribution={tileAttribution} detectRetina />
          <Marker
            position={[marker.lat, marker.lng]}
            icon={klMarkerIcon}
            draggable
            eventHandlers={{
              dragend: (e: any) => {
                const m = e.target.getLatLng();
                onPick({ lat: m.lat, lng: m.lng });
              },
            }}
          />
          <ClickHandler onPick={onPick} />
          {accuracy && (
            <Circle
              center={[marker.lat, marker.lng]}
              radius={accuracy}
              pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.15 } as any}
            />
          )}
          <Recenter position={marker} />
        </LeafletMap>
        <div style={{ position: 'absolute', right: 8, bottom: 8, display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="rounded-full bg-white border border-gray-300 shadow flex items-center justify-center"
            style={{ width: 44, height: 44 }}
            title="Use my location"
            aria-label="Use my location"
          >
            {locating ? (
              <span className="text-xs">…</span>
            ) : (
              <Image src={klLogo} alt="Locate me" width={24} height={24} />
            )}
            <span className="sr-only">Locate me</span>
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-1">Tip: type an area, then click on the map to fine-tune the exact spot.</p>
    </div>
  );
};

export default MapPicker;
