"use client";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

const ESRI_SATELLITE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const luxuryMarkerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255,255,255,0.95);
    border: 2px solid rgba(255,255,255,0.8);
    box-shadow: 0 8px 32px rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #171717;
    "></div>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], 17, { animate: false });
  }, [lat, lng, map]);

  return null;
}

interface SatelliteMapProps {
  lat: number;
  lng: number;
  className?: string;
}

export function SatelliteMap({ lat, lng, className }: SatelliteMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={17}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url={ESRI_SATELLITE} />
      <MapRecenter lat={lat} lng={lng} />
      <Marker position={[lat, lng]} icon={luxuryMarkerIcon} />
    </MapContainer>
  );
}
