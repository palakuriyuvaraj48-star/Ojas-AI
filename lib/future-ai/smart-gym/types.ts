export interface SmartGymDevice {
  id: string;
  userId: string;
  name: string;
  type: "strength" | "cardio" | "resistance" | "sensor";
  manufacturer?: string;
  model?: string;
  connected: boolean;
  lastSync?: string;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface SmartGymWorkout {
  id: string;
  userId: string;
  deviceId: string;
  exercise: string;
  startedAt: string;
  endedAt?: string;
  sets: Array<{ weight?: number; reps?: number; duration?: number; resistance?: number }>;
  metadata: Record<string, unknown>;
}

export interface SmartGymSyncRequest {
  deviceId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface SmartGymAnalyticsResponse {
  totalWorkouts: number;
  totalVolume: number;
  topExercises: Array<{ exercise: string; count: number }>;
  avgDuration: number;
  progression: Array<{ date: string; value: number; label?: string }>;
}

export interface EquipmentRecommendation {
  id: string;
  name: string;
  type: string;
  reason: string;
  confidence: number;
  priority: "high" | "medium" | "low";
}

export interface MaintenanceStatus {
  status: "ok" | "due" | "overdue" | "unknown";
  confidence: number;
  message: string;
  nextCheck?: string;
}

export const DEVICE_TYPES = ["strength", "cardio", "resistance", "sensor"] as const;
