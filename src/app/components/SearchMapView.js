"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import fallbackImg from "../assets/a1.png";

// Cameroon-ish default view when nothing is mappable yet.
const DEFAULT_CENTER = [4.6, 11.5];
const DEFAULT_ZOOM = 6;

const fmtCompact = (p) =>
  p
    ? new Intl.NumberFormat("fr-FR", {
        notation: "compact",
        maximumFractionDigits: 0,
      }).format(Number(p))
    : "—";

const fmtFull = (p) => new Intl.NumberFormat("fr-FR").format(Number(p) || 0);

// A clean rounded "price pill" marker (Booking/Airbnb style) with an active
// state that pops it forward and inverts the colours.
const makePriceIcon = (price, active) => {
  const bg = active ? "#082e4d" : "#ffffff";
  const color = active ? "#ffffff" : "#0f172a";
  const border = active ? "#082e4d" : "rgba(15,23,42,0.12)";
  return L.divIcon({
    className: "kl-price-pin",
    html: `<div style="
      display:inline-flex;align-items:center;
      background:${bg};color:${color};
      border:1.5px solid ${border};
      font-size:12px;font-weight:700;line-height:1;
      padding:6px 11px;border-radius:999px;white-space:nowrap;
      box-shadow:0 4px 12px rgba(2,6,23,${active ? 0.35 : 0.18});
      transform:translateY(${active ? "-3px" : "0"}) scale(${active ? 1.06 : 1});
      transition:transform .15s ease, box-shadow .15s ease;
    ">${fmtCompact(price)}</div>`,
    iconSize: [56, 30],
    iconAnchor: [28, 30],
  });
};

// Smoothly fit the map to all visible listings whenever they change.
function FitBounds({ points }) {
  const map = useMap();
  const key = JSON.stringify(points);
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.flyTo(points[0], 14, { duration: 0.6 });
      return;
    }
    map.flyToBounds(L.latLngBounds(points), {
      padding: [60, 60],
      maxZoom: 14,
      duration: 0.6,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

// Tapping empty map space dismisses the selected-listing card.
function MapClickCatcher({ onClick }) {
  useMapEvents({ click: () => onClick() });
  return null;
}

const SearchMapView = ({ rooms }) => {
  const [selected, setSelected] = useState(null);
  // Measure our own top offset so the map fills exactly to the bottom of the
  // viewport regardless of header/filter-bar height (which varies by screen).
  const wrapRef = useRef(null);
  const [mapHeight, setMapHeight] = useState("70vh");
  useEffect(() => {
    // Exact pixels from the live viewport (window.innerHeight) — dvh can resolve
    // larger than the visible area and overflow the bottom. Recomputes on
    // resize, which also fires when mobile browser chrome shows/hides.
    const compute = () => {
      const top = wrapRef.current?.getBoundingClientRect().top ?? 120;
      setMapHeight(`${Math.max(240, Math.round(window.innerHeight - top))}px`);
    };
    const raf = requestAnimationFrame(compute);
    // A ResizeObserver on <body> recomputes once the sticky filter bar finishes
    // reflowing (fonts/icons load) — otherwise an early measurement is short by
    // ~14px and the map overflows past the bottom.
    let ro;
    try {
      ro = new ResizeObserver(compute);
      ro.observe(document.body);
    } catch {}
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  // Prefer MapTiler if a key exists; otherwise CARTO Voyager — a free, clean,
  // modern basemap (no API key) that looks like the maps in Booking/Google.
  const tileUrl = mapTilerKey
    ? `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}@2x.png?key=${mapTilerKey}`
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const mappable = useMemo(
    () =>
      rooms.filter(
        (r) => typeof r.latitude === "number" && typeof r.longitude === "number"
      ),
    [rooms]
  );
  const points = useMemo(
    () => mappable.map((r) => [r.latitude, r.longitude]),
    [mappable]
  );

  // Drop the open card if the underlying result set changes (filters etc.).
  useEffect(() => {
    setSelected(null);
  }, [JSON.stringify(points)]);

  const cardImg = selected?.images?.[0] || fallbackImg.src;

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden"
      style={{ height: mapHeight }}
    >
      <MapContainer
        center={points[0] || DEFAULT_CENTER}
        zoom={points.length ? 12 : DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%", background: "#eef2f6" }}
        scrollWheelZoom
        zoomControl={false}
        tap={false}
      >
        <TileLayer
          url={tileUrl}
          attribution={attribution}
          subdomains="abcd"
          detectRetina
        />
        <ZoomControl position="topright" />
        <FitBounds points={points} />
        <MapClickCatcher onClick={() => setSelected(null)} />
        {mappable.map((room) => (
          <Marker
            key={room.id}
            position={[room.latitude, room.longitude]}
            icon={makePriceIcon(room.price, selected?.id === room.id)}
            zIndexOffset={selected?.id === room.id ? 1000 : 0}
            eventHandlers={{ click: () => setSelected(room) }}
          />
        ))}
      </MapContainer>

      {/* Count badge */}
      <div className="pointer-events-none absolute left-3 top-3 z-[1000]">
        <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-md ring-1 ring-black/5 backdrop-blur">
          {mappable.length} {mappable.length === 1 ? "stay" : "stays"} on map
        </span>
      </div>

      {/* Empty state */}
      {mappable.length === 0 && (
        <div className="absolute left-1/2 top-1/2 z-[1000] w-[calc(100%-32px)] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/95 p-5 text-center shadow-xl ring-1 ring-black/5 backdrop-blur">
          <p className="text-sm font-medium text-gray-800">
            No pinned listings here
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Listings show on the map once their location is set. Try the grid
            view or widen your filters.
          </p>
        </div>
      )}

      {/* Selected listing card — slides up from the bottom (Uber/Booking style) */}
      {selected && (
        <div
          className="absolute left-1/2 z-[1200] w-[calc(100%-24px)] max-w-md -translate-x-1/2 animate-[klUp_.22s_ease-out]"
          style={{ bottom: "max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))" }}
        >
          <div
            className="flex overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            style={{ height: 116 }}
          >
            <a
              href={`/room/${selected.id}`}
              aria-label={`Open ${selected.name}`}
              style={{ width: 116, flex: "0 0 116px", height: "100%" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cardImg}
                alt={selected.name || "Listing"}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => {
                  e.currentTarget.src = fallbackImg.src;
                }}
              />
            </a>
            <div className="flex min-w-0 flex-1 flex-col p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-gray-900">
                  {selected.name || "Room"}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              {selected.location ? (
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {selected.location}
                </p>
              ) : null}
              <p className="mt-1 text-sm font-bold text-gray-900">
                {fmtFull(selected.price)}{" "}
                <span className="text-xs font-medium text-gray-500">
                  {selected.currency || "XAF"}/mo
                </span>
              </p>
              <a
                href={`/room/${selected.id}`}
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-[#082e4d] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0a3a61]"
              >
                View listing
              </a>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes klUp {
          from {
            opacity: 0;
            transform: translate(-50%, 12px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .kl-price-pin {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default SearchMapView;
