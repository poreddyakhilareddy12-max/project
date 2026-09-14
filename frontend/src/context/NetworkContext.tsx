import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '../services/indexedDb';
import { incidentsApi } from '../services/api';

interface NetworkContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  toggleSimulatedOffline: () => void;
  syncPending: () => Promise<void>;
  refreshPendingCount: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await offlineStorage.getPendingCount();
      setPendingSyncCount(count);
    } catch (e) {
      console.warn('Failed to get pending count:', e);
    }
  }, []);

  const syncPending = useCallback(async () => {
    if (!effectiveOnline || isSyncing) return;
    try {
      const pendingItems = await offlineStorage.getPending();
      if (pendingItems.length === 0) {
        await refreshPendingCount();
        return;
      }

      setIsSyncing(true);
      for (const item of pendingItems) {
        await offlineStorage.updateStatus(item.client_uuid, 'SYNCING');
      }

      const payload = pendingItems.map((item) => ({
        client_uuid: item.client_uuid,
        incident_type: item.incident_type,
        severity: item.severity,
        description: item.description,
        latitude: item.latitude,
        longitude: item.longitude,
        road_segment_id: item.road_segment_id,
        district_id: item.district_id,
        photo_url: item.photo_blob || undefined,
        client_timestamp: item.client_timestamp,
      }));

      const res = await incidentsApi.sync(payload);
      console.log('Batch sync completed:', res);

      for (const item of pendingItems) {
        await offlineStorage.updateStatus(item.client_uuid, 'SYNCED');
      }
    } catch (err: any) {
      console.error('Offline synchronization failed:', err);
      const pendingItems = await offlineStorage.getPending();
      for (const item of pendingItems) {
        await offlineStorage.updateStatus(item.client_uuid, 'FAILED', err?.message || 'Sync failed');
      }
    } finally {
      setIsSyncing(false);
      await refreshPendingCount();
    }
  }, [effectiveOnline, isSyncing, refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingCount]);

  // Trigger auto-sync when connection is restored
  useEffect(() => {
    if (effectiveOnline && pendingSyncCount > 0) {
      syncPending();
    }
  }, [effectiveOnline, pendingSyncCount, syncPending]);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        effectiveOnline,
        pendingSyncCount,
        isSyncing,
        toggleSimulatedOffline,
        syncPending,
        refreshPendingCount,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
