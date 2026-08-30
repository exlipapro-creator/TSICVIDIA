/**
 * TSICVIDIA Storage Adapter
 * Type-safe storage interface with local storage and memory fallback.
 */

export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): boolean;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
}

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix = 'tsicvidia.') {
    this.prefix = prefix;
  }

  private fullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      const raw = window.localStorage.getItem(this.fullKey(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[LocalStorageAdapter] Failed to get key "${key}":`, err);
      return null;
    }
  }

  set<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(this.fullKey(key), serialized);
      return true;
    } catch (err) {
      console.warn(`[LocalStorageAdapter] Failed to set key "${key}":`, err);
      return false;
    }
  }

  remove(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.fullKey(key));
      }
    } catch (err) {
      console.warn(`[LocalStorageAdapter] Failed to remove key "${key}":`, err);
    }
  }

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(this.prefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      }
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to clear storage:', err);
    }
  }

  has(key: string): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      return window.localStorage.getItem(this.fullKey(key)) !== null;
    } catch {
      return false;
    }
  }
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  get<T>(key: string): T | null {
    const raw = this.store.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): boolean {
    try {
      this.store.set(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  has(key: string): boolean {
    return this.store.has(key);
  }
}

export const defaultStorage: StorageAdapter =
  typeof window !== 'undefined' && window.localStorage
    ? new LocalStorageAdapter('tsicvidia.')
    : new MemoryStorageAdapter();
