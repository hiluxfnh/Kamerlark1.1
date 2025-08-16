"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const DEFAULT_CENTER = { lat: 3.848, lng: 11.502 };

const MapComponent = ({ latitude, longitude, address, onLocationChange }) => {
  const [markerPosition, setMarkerPosition] = useState({
    lat: typeof latitude === "number" ? latitude : DEFAULT_CENTER.lat,
    lng: typeof longitude === "number" ? longitude : DEFAULT_CENTER.lng,
  });
  const [query, setQuery] = useState(address || "");
  const [suggestions, setSuggestions] = useState([]);
  const [resolving, setResolving] = useState(false);
  const searchTimer = useRef(null);
  const leafletDivRef = useRef(null);
  const leafletRefs = useRef({ map: null, marker: null });
  const mapContainerStyle = useMemo(
    () => ({ height: "300px", width: "100%" }),
    []
  );
  const hasGoogleKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    setQuery(address || "");
  }, [address]);

  useEffect(() => {
    const go = async () => {
      if (!address || !address.trim()) return;
      try {
        // If address looks like "lat, lng", prefer reverse geocoding for a proper formatted address
        const latLngMatch = address
          .trim()
          .match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
        if (latLngMatch) {
          const lat = parseFloat(latLngMatch[1]);
          const lng = parseFloat(latLngMatch[2]);
          setMarkerPosition({ lat, lng });
          const formatted = await reverseGeocode(lat, lng);
          if (formatted) {
            setQuery(formatted);
          }
          return;
        }
        // Else, forward geocode the free-text address

        if (hasGoogleKey) {
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
        }
      } catch {}
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
          )}`,
          { headers: { "Accept-Language": "en" } }
        );
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

          // If we have numeric lat/lng but no meaningful address, reverse-geocode once on mount/prop change
          useEffect(() => {
            const latOk =
              typeof latitude === "number" && !Number.isNaN(latitude);
            const lngOk =
              typeof longitude === "number" && !Number.isNaN(longitude);
            const looksLikeCoords =
              typeof address === "string" &&
              /^\s*-?\d/.test(address) &&
              address.includes(",");
            if (
              latOk &&
              lngOk &&
              (!address || !address.trim() || looksLikeCoords)
            ) {
              (async () => {
                const formatted = await reverseGeocode(latitude, longitude);
                if (formatted) setQuery(formatted);
              })();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [latitude, longitude]);
        }
      } catch {}
    };
    go();
  }, [address, hasGoogleKey, onLocationChange]);

  const reverseGeocode = async (lat, lng) => {
    if (hasGoogleKey) {
      try {
        const resp = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await resp.json();
        if (data.status === "OK" && data.results[0]) {
          const formatted = data.results[0].formatted_address;
          onLocationChange &&
            onLocationChange({ lat, lng, address: formatted });
          return formatted;
        }
      } catch {}
    }
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const resp = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await resp.json();
      const formatted = data?.display_name || "";
      onLocationChange && onLocationChange({ lat, lng, address: formatted });
      return formatted;
    } catch {
      onLocationChange && onLocationChange({ lat, lng, address: undefined });
      return undefined;
    }
  };

  const onMarkerDragEnd = async (event) => {
    const newPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    setMarkerPosition(newPos);
    const formatted = await reverseGeocode(newPos.lat, newPos.lng);
    if (formatted) setQuery(formatted);
  };

  const onMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });
    const formatted = await reverseGeocode(lat, lng);
    if (formatted) setQuery(formatted);
  };

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`;
        const resp = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await resp.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => searchTimer.current && clearTimeout(searchTimer.current);
  }, [query]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setMarkerPosition({ lat, lng });
      // Show a temporary resolving hint while we fetch a proper address
      setResolving(true);
      setQuery((prev) =>
        prev && prev.trim().length > 0 ? prev : "Resolving address…"
      );
      const formatted = await reverseGeocode(lat, lng);
      if (formatted && formatted.length > 0) {
        setQuery(formatted);
      } else {
        // Keep previous text; do NOT write lat,lng into the address field
        setQuery((prev) => (prev === "Resolving address…" ? "" : prev));
      }
      setResolving(false);
    });
  };

  useEffect(() => {
    if (hasGoogleKey) return; // Leaflet only when no Google key
    if (!leafletDivRef.current) return;
    let cancelled = false;
    const ensureLeaflet = async () => {
      if (typeof window === "undefined") return null;
      if (window.L) return window.L;
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      return await new Promise((resolve, reject) => {
        const existing = document.getElementById("leaflet-js");
        if (existing) {
          existing.addEventListener("load", () => resolve(window.L));
          existing.addEventListener("error", reject);
          return;
        }
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => resolve(window.L);
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };
    (async () => {
      try {
        const L = await ensureLeaflet();
        if (cancelled || !L) return;
        const iconUrl =
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
        const iconRetinaUrl =
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
        const shadowUrl =
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
        if (L.Icon && L.Icon.Default) {
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
        }
        const map = L.map(leafletDivRef.current).setView(
          [markerPosition.lat, markerPosition.lng],
          13
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);
        const marker = L.marker([markerPosition.lat, markerPosition.lng], {
          draggable: true,
        }).addTo(map);
        marker.on("dragend", async (e) => {
          const ll = e.target.getLatLng();
          const newPos = { lat: ll.lat, lng: ll.lng };
          setMarkerPosition(newPos);
          const formatted = await reverseGeocode(newPos.lat, newPos.lng);
          if (formatted) setQuery(formatted);
        });
        map.on("click", async (e) => {
          const { lat, lng } = e.latlng;
          setMarkerPosition({ lat, lng });
          marker.setLatLng([lat, lng]);
          const formatted = await reverseGeocode(lat, lng);
          if (formatted) setQuery(formatted);
        });
        leafletRefs.current = { map, marker };
      } catch (e) {}
    })();
    return () => {
      cancelled = true;
      try {
        const { map } = leafletRefs.current || {};
        if (map) map.remove();
        leafletRefs.current = { map: null, marker: null };
      } catch {}
    };
  }, [hasGoogleKey]);

  useEffect(() => {
    if (hasGoogleKey) return;
    const { map, marker } = leafletRefs.current || {};
    if (map && marker) {
      marker.setLatLng([markerPosition.lat, markerPosition.lng]);
      map.setView([markerPosition.lat, markerPosition.lng]);
    }
  }, [markerPosition, hasGoogleKey]);

  if (hasGoogleKey) {
    return (
      <div>
        <div className="mb-2 flex flex-col gap-1">
          <div className="flex gap-2">
            <input
              type="text"
              className="border p-2 rounded-md flex-1"
              placeholder="Type an area, city, or address"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="button"
              className="px-3 py-2 border rounded-md"
              onClick={handleUseMyLocation}
            >
              Use my location
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-black text-white rounded-md"
              onClick={async () => {
                if (!query.trim()) return;
                try {
                  const resp = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                      query.trim()
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
                } catch {}
                try {
                  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    query.trim()
                  )}`;
                  const resp = await fetch(url);
                  const data = await resp.json();
                  if (Array.isArray(data) && data.length > 0) {
                    const first = data[0];
                    const newPos = {
                      lat: parseFloat(first.lat),
                      lng: parseFloat(first.lon),
                    };
                    setMarkerPosition(newPos);
                    onLocationChange &&
                      onLocationChange({
                        ...newPos,
                        address: first.display_name,
                      });
                  }
                } catch {}
              }}
            >
              Search
            </button>
          </div>
          {!!suggestions.length && (
            <div className="border rounded-md max-h-40 overflow-auto bg-white z-10">
              {suggestions.map((s, idx) => (
                <div
                  key={`${s.place_id || idx}`}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    const lat = parseFloat(s.lat);
                    const lng = parseFloat(s.lon);
                    setMarkerPosition({ lat, lng });
                    setQuery(s.display_name);
                    setSuggestions([]);
                    onLocationChange &&
                      onLocationChange({ lat, lng, address: s.display_name });
                  }}
                >
                  {s.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={markerPosition}
            onClick={onMapClick}
          >
            <Marker
              position={markerPosition}
              draggable
              onDragEnd={onMarkerDragEnd}
            />
          </GoogleMap>
        </LoadScript>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex flex-col gap-1">
        <div className="flex gap-2">
          <input
            type="text"
            className="border p-2 rounded-md flex-1"
            placeholder="Type an area, city, or address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="px-3 py-2 border rounded-md"
            onClick={handleUseMyLocation}
          >
            Use my location
          </button>
          <button
            type="button"
            className="px-3 py-2 bg-black text-white rounded-md"
            onClick={async () => {
              if (!query.trim()) return;
              try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                  query.trim()
                )}`;
                const resp = await fetch(url);
                const data = await resp.json();
                if (Array.isArray(data) && data.length > 0) {
                  const first = data[0];
                  const newPos = {
                    lat: parseFloat(first.lat),
                    lng: parseFloat(first.lon),
                  };
                  setMarkerPosition(newPos);
                  onLocationChange &&
                    onLocationChange({
                      ...newPos,
                      address: first.display_name,
                    });
                }
              } catch {}
            }}
          >
            Search
          </button>
        </div>
        {!!suggestions.length && (
          <div className="border rounded-md max-h-40 overflow-auto bg-white z-10">
            {suggestions.map((s, idx) => (
              <div
                key={`${s.place_id || idx}`}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => {
                  const lat = parseFloat(s.lat);
                  const lng = parseFloat(s.lon);
                  setMarkerPosition({ lat, lng });
                  setQuery(s.display_name);
                  setSuggestions([]);
                  onLocationChange &&
                    onLocationChange({ lat, lng, address: s.display_name });
                }}
              >
                {s.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ width: "100%", height: "300px" }} ref={leafletDivRef} />
    </div>
  );
};

export default MapComponent;
