"use client";

import { TABLES } from "./schema";
import { logger } from "@/lib/logger";

export class StorageService {
  private static isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.localStorage;
  }

  static get<T>(key: string): T | null {
    if (!this.isAvailable()) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      logger.error(`Storage read failed: ${key}`, err);
      return null;
    }
  }

  static set<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      logger.error(`Storage write failed: ${key}`, err);
      return false;
    }
  }

  static remove(key: string): void {
    if (!this.isAvailable()) return;
    localStorage.removeItem(key);
  }

  static clear(keys: string[]): void {
    keys.forEach((k) => this.remove(k));
  }

  static clearAllAppData(): void {
    this.clear(Object.values(TABLES));
  }
}

export { TABLES };
