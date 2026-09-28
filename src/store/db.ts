import Dexie, { Table } from 'dexie';

export interface ProjectRecord {
  id: string;
  name: string;
  document: string;
  updatedAt: string;
}

class HermesDB extends Dexie {
  projects!: Table<ProjectRecord>;
  constructor() {
    super('HermesDesignStudio');
    this.version(1).stores({ projects: 'id, name, updatedAt' });
  }
}

export const db = new HermesDB();
