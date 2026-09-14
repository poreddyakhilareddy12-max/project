import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RoadSegment, Vehicle, Incident, RouteCandidate } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

// Fix for custom icons using L.divIcon
const createVehicleIcon = (type: string, isMedical: boolean) => {
  const bg = isMedical ? 'bg-rose-600 border-rose-300' : 'bg-blue-600 border-cyan-300';
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-7 h-7 rounded-full ${bg} border-2 text-white shadow-lg flex items-center justify-center text-xs font-black animate-pulse">
          ${isMedical ? '🚑' : '🚛'}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createIncidentIcon = (severity: string, type: string) => {
  const bg = severity === 'CRITICAL' ? 'bg-rose-600' : severity === 'HIGH' ? 'bg-orange-600' : 'bg-amber-600';
  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-6 h-6 rounded-md ${bg} border border-white text-white shadow-lg flex items-center justify-center text-[10px] font-bold">
          ⚠️
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createHubIcon = (name: string) => {
  return L.divIcon({
    className: 'custom-hub-marker',
    html: `
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-cyan-400 border border-white shadow-md"></div>
        <span class="text-[10px] font-bold bg-slate-950/80 text-slate-200 px-1 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow">
          ${name}
        </span>
      </div>
    `,
    iconSize: [80, 16],
    iconAnchor: [6, 8],
  });
};

interface LiveMapProps {
  segments?: RoadSegment[];
  vehicles?: Vehicle[];
  incidents?: Incident[];
  activeRoutes?: RouteCandidate[];
  selectedRouteId?: string;
  onSelectRoute?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

// Controller to smoothly pan to coordinates if changed
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const LiveMap: React.FC<LiveMapProps> = ({
  segments = [],
  vehicles = [],
  incidents = [],
  activeRoutes = [],
  selectedRouteId,
  onSelectRoute,
  center = [25.8, 93.2], // Centered between Assam, Meghalaya, Nagaland, Manipur
  zoom = 7,
  height = '100%',
}) => {
  const getSegmentColor = (seg: RoadSegment) => {
    if (seg.is_blocked) return '#ef4444'; // Red
    if (seg.current_risk_score >= 80) return '#dc2626'; // Deep Red
    if (seg.current_risk_score >= 60) return '#f97316'; // Orange
    if (seg.current_risk_score >= 30) return '#f59e0b'; // Amber
    return '#10b981'; // Emerald Green
  };

  return (
    <div style={{ height, width: '100%' }} className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapController center={center} zoom={zoom} />
        
        {/* Dark Matter Operations Basemap */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Monitored Road Segments */}
        {segments.map((seg) => {
          try {
            const coords = JSON.parse(seg.geometry_geojson);
            return (
              <Polyline
                key={seg.id}
                positions={coords}
                pathOptions={{
                  color: getSegmentColor(seg),
                  weight: seg.is_blocked ? 5 : 4,
                  opacity: 0.85,
                  dashArray: seg.is_blocked ? '6, 8' : undefined,
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 space-y-1.5 min-w-[200px] text-slate-900">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-xs">{seg.highway_name}</span>
                      <StatusBadge type="risk" value={seg.risk_level} size="sm" />
                    </div>
                    <p className="text-xs font-medium text-slate-700">
                      {seg.start_location} &rarr; {seg.end_location} ({seg.distance_km} km)
                    </p>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>Current Risk Score: <strong className="text-slate-900">{seg.current_risk_score}/100</strong></div>
                      <div>Status: <strong className={seg.is_blocked ? 'text-red-600 font-bold' : 'text-emerald-600'}>{seg.is_blocked ? 'BLOCKED' : 'OPEN'}</strong></div>
                      <div>24h Rainfall: {seg.rainfall_24h_mm} mm</div>
                      <div>Slope Gradient: {seg.slope_deg}&deg;</div>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          } catch (e) {
            return null;
          }
        })}

        {/* Active Route Alternatives (if route planning mode) */}
        {activeRoutes.map((cand) => {
          const isSelected = cand.id === selectedRouteId;
          const isRecommended = cand.category === 'RECOMMENDED';
          const color = isRecommended ? '#06b6d4' : cand.category === 'SAFEST' ? '#10b981' : '#f59e0b';
          return (
            <Polyline
              key={cand.id}
              positions={cand.geometry}
              pathOptions={{
                color,
                weight: isSelected ? 6 : 3,
                opacity: isSelected ? 1.0 : 0.45,
                dashArray: cand.category === 'FASTEST' && cand.blocked_segments_count > 0 ? '5, 5' : undefined,
              }}
              eventHandlers={{
                click: () => onSelectRoute && onSelectRoute(cand.id),
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-semibold">
                  {cand.highway_corridor} &bull; {cand.distance_km} km ({cand.expected_delay_minutes} min delay)
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* Active Vehicles */}
        {vehicles.map((v) => {
          const isMedical = v.vehicle_type === 'MEDICAL_SUPPLY';
          return (
            <Marker
              key={v.id}
              position={[v.current_lat, v.current_lng]}
              icon={createVehicleIcon(v.vehicle_type, isMedical)}
            >
              <Popup>
                <div className="p-2 space-y-1 min-w-[210px] text-slate-900">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-bold text-xs">{v.registration_number}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-mono font-bold px-1.5 py-0.5 rounded">
                      {v.vehicle_type}
                    </span>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div>Speed: <strong>{v.speed_kmh} km/h</strong></div>
                    <div>Status: <strong className="text-emerald-700">{v.status}</strong></div>
                    <div>Capacity: {v.capacity_tons} Tons</div>
                    <div className="text-[10px] text-slate-500 pt-1">
                      GPS Ping: {new Date(v.last_gps_ping).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Geo-tagged Incidents */}
        {incidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={createIncidentIcon(inc.severity, inc.incident_type)}
          >
            <Popup>
              <div className="p-2 space-y-1.5 max-w-xs text-slate-900">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="font-bold text-xs text-red-700">⚠️ {inc.incident_type}</span>
                  <StatusBadge type="risk" value={inc.severity} size="sm" />
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{inc.description}</p>
                {inc.photo_url && (
                  <div className="mt-1 rounded overflow-hidden border border-slate-200">
                    <img
                      src={inc.photo_url.startsWith('http') || inc.photo_url.startsWith('data:') ? inc.photo_url : `${inc.photo_url}`}
                      alt="Incident evidence"
                      className="w-full h-28 object-cover"
                    />
                  </div>
                )}
                <div className="text-[10px] text-slate-500 pt-1 border-t flex justify-between">
                  <span>Reported by: {inc.reporter_role}</span>
                  <span>{new Date(inc.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
