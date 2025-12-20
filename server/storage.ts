export interface IStorage {
  // Can be extended for game stats persistence
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
