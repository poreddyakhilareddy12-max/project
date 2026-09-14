import React, { useState, useRef } from 'react';
import { 
  IncidentType, 
  IncidentSeverity 
} from '../types';
import { incidentsApi } from '../services/api';
import { offlineStorage } from '../services/indexedDb';
import { useNetwork } from '../context/NetworkContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  AlertTriangle, 
  Camera, 
  Upload, 
  MapPin, 
  CheckCircle2, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  X,
  FileText,
  Send
} from 'lucide-react';

export const FieldOperations: React.FC = () => {
  const { effectiveOnline, syncPending, refreshPendingCount } = useNetwork();

  const [incidentType, setIncidentType] = useState<IncidentType>('LANDSLIDE');
  const [severity, setSeverity] = useState<IncidentSeverity>('HIGH');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(25.6751); // Default Kohima
  const [longitude, setLongitude] = useState<number>(94.1086);
  const [isLocating, setIsLocating] = useState(false);

  // Photo state - MUST BE EMPTY INITIALLY (Strict Requirement)
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'offline' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get current device GPS coordinates
  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(5)));
          setLongitude(Number(pos.coords.longitude.toFixed(5)));
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation failed or denied, using manual coordinates:', err);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  // Form submission with offline resiliency
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setNotification({ type: 'error', message: 'Please provide a description of the road hazard.' });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    const clientUuid = `field-rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    if (effectiveOnline) {
      try {
        let uploadedPhotoUrl: string | undefined = undefined;
        if (photoFile) {
          const uploadRes = await incidentsApi.uploadPhoto(photoFile);
          uploadedPhotoUrl = uploadRes.photo_url;
        }

        await incidentsApi.create({
          client_uuid: clientUuid,
          incident_type: incidentType,
          severity,
          description,
          latitude,
          longitude,
          photo_url: uploadedPhotoUrl,
        });

        setNotification({
          type: 'success',
          message: `Hazard incident successfully transmitted to Central Command (UUID: ${clientUuid.substring(0, 14)}...)`,
        });

        // Reset form
        setDescription('');
        clearPhoto();
      } catch (err: any) {
        console.warn('Online submission failed, falling back to local IndexedDB queue:', err);
        await saveToIndexedDB(clientUuid, timestamp);
      }
    } else {
      // Direct Offline Mode
      await saveToIndexedDB(clientUuid, timestamp);
    }

    setSubmitting(false);
  };

  const saveToIndexedDB = async (uuid: string, timestamp: string) => {
    try {
      await offlineStorage.saveIncident({
        client_uuid: uuid,
        incident_type: incidentType,
        severity,
        description,
        latitude,
        longitude,
        photo_blob: photoPreview || undefined,
        client_timestamp: timestamp,
        sync_status: 'PENDING',
      });

      await refreshPendingCount();

      setNotification({
        type: 'offline',
        message: 'OFFLINE MODE: Incident saved securely in local browser storage. It will synchronize automatically when connectivity returns.',
      });

      setDescription('');
      clearPhoto();
    } catch (e: any) {
      setNotification({ type: 'error', message: `Failed to save offline: ${e.message}` });
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1000px] mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Field Incident Reporting & Geo-Tagging Portal</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Designed for field officials, border roads inspectors, and convoy drivers in remote North Eastern corridors.
        </p>
      </div>

      {/* Connectivity & Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs leading-relaxed ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : notification.type === 'offline'
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-200 animate-pulse'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {notification.type === 'offline' && <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Incident Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Incident Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Incident / Disruption Type *
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as IncidentType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="LANDSLIDE">Mountain Landslide / Mudflow</option>
              <option value="FLOOD">Riverine / Flash Flooding</option>
              <option value="ROAD_DAMAGE">Asphalt Collapse / Shoulder Damage</option>
              <option value="BRIDGE_ISSUE">Bridge Damage / Structural Culvert Defect</option>
              <option value="TRAFFIC_CONGESTION">Severe Hill Road Traffic Jam</option>
              <option value="ACCIDENT">Vehicle Overturn / Collision</option>
              <option value="OTHER">Other Route Obstruction</option>
            </select>
          </div>

          {/* Severity Level */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Severity Level *
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none font-semibold"
            >
              <option value="LOW">LOW — Minor Slush / Caution Required</option>
              <option value="MEDIUM">MEDIUM — Single-lane Alternating Crawl</option>
              <option value="HIGH">HIGH — Dangerous / Heavy Commercial Risk</option>
              <option value="CRITICAL">CRITICAL — Road Completely Impassable / Blocked</option>
            </select>
          </div>
        </div>

        {/* GPS Geolocation Capture */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Geo-Tagging Coordinates (WGS84)</span>
            </span>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isLocating ? 'Capturing GPS...' : 'Fetch Device GPS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Latitude</label>
              <input
                type="number"
                step="0.00001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Longitude</label>
              <input
                type="number"
                step="0.00001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Hazard Description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Hazard Description & Location Context *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., Mudslide covered 40 meters of roadway near Pagla Pahar bend. Heavy earthmovers needed to clear debris..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Photo Evidence Section (Strict requirement: Starts empty, no fake images!) */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Photographic Verification Evidence
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!photoPreview ? (
            /* Empty State Container */
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors">
              <Camera className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-400 mb-1">No photo uploaded</p>
              <p className="text-[11px] text-slate-600 mb-4">Attach genuine field image or capture using mobile camera</p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Take Photo</span>
                </button>
              </div>
            </div>
          ) : (
            /* Selected Photo Preview */
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2">
              <img
                src={photoPreview}
                alt="Selected evidence"
                className="w-full max-h-64 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900/90 text-rose-400 hover:text-rose-200 border border-slate-700 transition-colors shadow-md"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mt-2 text-center text-xs text-slate-400 font-mono">
                {photoFile?.name} ({(photoFile?.size ? photoFile.size / 1024 : 0).toFixed(1)} KB)
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Processing Report...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {effectiveOnline ? 'Transmit Incident to Command Center' : 'Save Locally (Offline Queue)'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
