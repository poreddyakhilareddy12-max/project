import Dexie, { Table } from 'dexie';
import { OfflineIncident } from '../types';

export class NerDatabase extends Dexie {
  pending_incidents!: Table<OfflineIncident, string>;

  constructor() {
    super('ner_offline_db');
    this.version(1).stores({
      pending_incidents: 'client_uuid, sync_status, client_timestamp',
    });
  }
}

export const db = new NerDatabase();

export const offlineStorage = {
  async saveIncident(incident: OfflineIncident): Promise<string> {
    await db.pending_incidents.put(incident);
    return incident.client_uuid;
  },

  async getPending(): Promise<OfflineIncident[]> {
    return await db.pending_incidents
      .filter((item) => item.sync_status === 'PENDING' || item.sync_status === 'FAILED')
      .toArray();
  },

  async getAll(): Promise<OfflineIncident[]> {
    return await db.pending_incidents.reverse().toArray();
  },

  async getPendingCount(): Promise<number> {
    return await db.pending_incidents
      .filter((item) => item.sync_status === 'PENDING' || item.sync_status === 'FAILED')
      .count();
  },

  async updateStatus(client_uuid: string, status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED', errorMsg?: string) {
    await db.pending_incidents.update(client_uuid, {
      sync_status: status,
      error_message: errorMsg,
    });
  },

  async deleteIncident(client_uuid: string) {
    await db.pending_incidents.delete(client_uuid);
  },

  async clearSynced() {
    const synced = await db.pending_incidents.filter((i) => i.sync_status === 'SYNCED').toArray();
    for (const item of synced) {
      await db.pending_incidents.delete(item.client_uuid);
    }
  },
};
