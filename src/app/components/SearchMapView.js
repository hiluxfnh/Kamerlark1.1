"use client";
import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false });
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const Marker = dynamic(async () => (await import("react-leaflet")).Marker, { ssr: false });
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, { ssr: false });

// Default center: Yaounde, Cameroon
const DEFAULT_CENTER = [3.848, 11.502];
const DEFAULT_ZOOM = 7;

const SearchMapView = ({ rooms }) => {
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const tileUrl = mapTilerKey
    ? `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${mapTilerKey}`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileAttribution = mapTilerKey
    ? "&copy; MapTiler & OpenStreetMap contributors"
    : "&copy; OpenStreetMap contributors";

  // Only rooms that have coordinates
  const mappable = useMemo(
    () => rooms.filter((r) => typeof r.latitude === "number" && typeof r.longitude === "number"),
    [rooms]
  );

  const priceIcon = (price) => {
    const label = price
      ? new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 0 }).format(Number(price))
      : "—";
    return L.divIcon({
      className: "",
      html: `<div style="
        background:#111827;color:#fff;font-size:11px;font-weight:700;
        padding:4px 8px;border-radius:20px;white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid #fff;
        cursor:pointer;
      ">${label}</div>`,
      iconAnchor: [30, 16],
      iconSize: [60, 32],
    });
  };

  return (
    <div style={{ width: "100%", height: "calc(100vh - 140px)", position: "relative", zIndex: 1 }}>
      <MapContainer
        center={mappable.length ? [mappable[0].latitude, mappable[0].longitude] : DEFAULT_CENTER}
        zoom={mappable.length ? 12 : DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} />
        {mappable.map((room) => (
          <Marker
            key={room.id}
            position={[room.latitude, room.longitude]}
            icon={priceIcon(room.price)}
          >
            <Popup>
              <div style={{ minWidth: 180, maxWidth: 220 }}>
                {room.images?.[0] && (
                  <img
                    src={room.images[0]}
                    alt={room.name}
                    style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 6, marginBottom: 6 }}
                  />
                )}
                <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 2px" }}>{room.name}</p>
                {room.location && (
                  <p style={{ fontSize: 11, color: "#666", margin: "0 0 4px" }}>{room.location}</p>
                )}
                <p style={{ fontWeight: 600, fontSize: 12, margin: "0 0 6px" }}>
                  {new Intl.NumberFormat("fr-FR").format(Number(room.price) || 0)} {room.currency || "XAF"}/mo
                </p>
                <a
                  href={`/room/${room.id}`}
                  style={{
                    display: "inline-block",
                    background: "#111827",
                    color: "#fff",
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  View listing
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {mappable.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(255,255,255,0.9)",
            padding: "16px 24px",
            borderRadius: 12,
            zIndex: 1000,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 14, color: "#555" }}>
            No listings with map coordinates for current filters.
          </p>
          <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
            Listings need a pinned location to appear on the map.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchMapView;
