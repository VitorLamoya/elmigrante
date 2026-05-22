import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./JobsMap.css";

function JobsMap({ locations, jobLabel = "vaga", jobsLabel = "vagas" }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([48.5, 8.5], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) return;

    markerLayerRef.current.clearLayers();
    const validLocations = locations.filter((location) => Number.isFinite(location.latitude) && Number.isFinite(location.longitude));

    validLocations.forEach((location) => {
      const marker = L.circleMarker([location.latitude, location.longitude], {
        radius: Math.min(18, 8 + location.count * 2),
        color: "#ffffff",
        weight: 2,
        fillColor: "#0f766e",
        fillOpacity: 0.9,
      });

      marker.bindPopup(`<strong>${location.label}</strong><br>${location.count} ${location.count === 1 ? jobLabel : jobsLabel}`);
      marker.addTo(markerLayerRef.current);
    });

    if (validLocations.length > 0) {
      const bounds = L.latLngBounds(validLocations.map((location) => [location.latitude, location.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 7 });
    }
  }, [locations, jobLabel, jobsLabel]);

  return <div className="real-jobs-map" ref={containerRef} />;
}

export default JobsMap;
