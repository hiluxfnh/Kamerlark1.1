import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
import Image from "next/image";
import klLogo from "../assets/kamerlark.png";

const LeafletMap = dynamic(
  async () => (await import("react-leaflet")).MapContainer,
  { ssr: false }
);
const TileLayer = dynamic(
  async () => (await import("react-leaflet")).TileLayer,
  { ssr: false }
);
const Marker = dynamic(async () => (await import("react-leaflet")).Marker, {
  ssr: false,
});
const useMapEvents = (() => {
  try {
    return require("react-leaflet").useMapEvents;
  } catch {
    return () => null;
  }
})();

// Props: latitude, longitude, address (optional), onLocationChange({lat,lng,address}), interactive (optional)
const MapComponent = ({
  latitude,
  longitude,
  address,
  onLocationChange,
  interactive,
}) => {
  const [markerPosition, setMarkerPosition] = useState({
    lat: latitude || -33.8688,
    lng: longitude || 151.2093,
  });
  const mapContainerStyle = useMemo(
    () => ({ height: "300px", width: "100%", position: "relative", zIndex: 1 }),
    []
  );
  const center = markerPosition;
  const isInteractive =
    typeof interactive === "boolean" ? interactive : Boolean(onLocationChange);
  const hasGoogleKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  // Clean modern basemap: MapTiler when keyed, else CARTO Voyager (free, no key).
  const tileUrl = mapTilerKey
    ? `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}@2x.png?key=${mapTilerKey}`
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  const tileAttribution = mapTilerKey
    ? "&copy; MapTiler &copy; OpenStreetMap contributors"
    : "&copy; OpenStreetMap &copy; CARTO";
  const tileSubdomains = mapTilerKey ? "abc" : "abcd";

  // Geocode when address changes: prefer Google, fallback to OpenStreetMap Nominatim (free)
  useEffect(() => {
    const geocode = async () => {
      if (!address) return;
      // Try Google first if key is available
      if (hasGoogleKey) {
        try {
          const resp = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              address
            )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await resp.json();
          if (data.status === "OK" && data.results[0]) {
            const loc = data.results[0].geometry.location;
            const formatted = data.results[0].formatted_address;
            const newPos = { lat: loc.lat, lng: loc.lng };
            setMarkerPosition(newPos);
            onLocationChange &&
              onLocationChange({ ...newPos, address: formatted });
            return;
          }
        } catch (e) {
          // fall through to OSM
        }
      }
      // Fallback to OpenStreetMap Nominatim (no API key required)
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`;
        const resp = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          const newPos = {
            lat: parseFloat(first.lat),
            lng: parseFloat(first.lon),
          };
          setMarkerPosition(newPos);
          onLocationChange &&
            onLocationChange({ ...newPos, address: first.display_name });
        }
      } catch (e) {
        // Geocoding is best-effort (Nominatim can rate-limit / be blocked by
        // CORS). A failure just means we keep the existing marker position —
        // warn quietly instead of spamming the console with errors.
        console.warn("Geocode unavailable; using existing coordinates.");
      }
    };
    geocode();
  }, [address, hasGoogleKey]);

  const onMarkerDragEnd = (event) => {
    const newPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    setMarkerPosition(newPos);
    onLocationChange && onLocationChange({ ...newPos, address });
  };

  // Render Google Map if API key is available; otherwise render Leaflet with crisp tiles
  if (hasGoogleKey) {
    const {
      GoogleMap,
      LoadScript,
      Marker: GMarker,
    } = require("@react-google-maps/api");
    return (
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={center}
          options={{
            draggable: true,
            scrollwheel: true,
            disableDoubleClickZoom: false,
            keyboardShortcuts: true,
            gestureHandling: "greedy",
            zoomControl: true,
            clickableIcons: true,
          }}
        >
          <GMarker
            position={markerPosition}
            draggable={isInteractive}
            onDragEnd={isInteractive ? onMarkerDragEnd : undefined}
          />
        </GoogleMap>
      </LoadScript>
    );
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${markerPosition.lat},${markerPosition.lng}`;

  return (
    <div
      style={{
        width: "100%",
        height: "320px",
        position: "relative",
        zIndex: 1,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <LeafletMap
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%", background: "#eef2f6" }}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={true}
        boxZoom={isInteractive}
        keyboard={true}
        touchZoom={true}
      >
        <TileLayer
          url={tileUrl}
          attribution={tileAttribution}
          subdomains={tileSubdomains}
          detectRetina
        />
        <Marker
          position={[markerPosition.lat, markerPosition.lng]}
          icon={(() => {
            const size = 44; // circle diameter
            const tail = 14; // pin tail
            const bg = "#111827";
            const logo = (klLogo && klLogo.src) || iconUrl;
            const html = `
                <div style="position: relative; width: ${size}px; height: ${
              size + tail
            }px;">
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
              className: "",
              iconSize: [size, size + tail],
              iconAnchor: [size / 2, size + tail],
              popupAnchor: [0, -size],
            });
          })()}
          draggable={isInteractive}
          eventHandlers={
            isInteractive
              ? {
                  dragend: (e) => {
                    const m = e.target.getLatLng();
                    const newPos = { lat: m.lat, lng: m.lng };
                    setMarkerPosition(newPos);
                    onLocationChange &&
                      onLocationChange({ ...newPos, address });
                  },
                }
              : undefined
          }
        />
      </LeafletMap>
      {!isInteractive && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ zIndex: 1000 }}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#082e4d] shadow-lg ring-1 ring-black/5 transition-transform hover:scale-[1.03] active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Get directions
        </a>
      )}
    </div>
  );
};

export default MapComponent;
