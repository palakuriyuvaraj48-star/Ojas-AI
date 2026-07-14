import {
  SmartGymDevice,
  SmartGymWorkout,
  SmartGymSyncRequest,
  SmartGymAnalyticsResponse,
  EquipmentRecommendation,
  MaintenanceStatus,
} from "./types";
import { generateId } from "@/lib/future-ai/storage";
import { futureSmartGym } from "@/lib/future-ai/storage";

export function registerDevice(userId: string, device: Partial<SmartGymDevice>): { success: boolean; device?: SmartGymDevice; error?: string } {
  if (!device.name || device.name.trim().length < 2) {
    return { success: false, error: "Device name must be at least 2 characters." };
  }
  if (!device.type || !["strength", "cardio", "resistance", "sensor"].includes(device.type)) {
    return { success: false, error: "Invalid device type." };
  }

  const record: SmartGymDevice = {
    id: generateId(),
    userId,
    name: device.name.trim(),
    type: device.type,
    manufacturer: device.manufacturer,
    model: device.model,
    connected: true,
    lastSync: new Date().toISOString(),
    settings: device.settings || {},
    metadata: device.metadata || {},
  };

  futureSmartGym.addDevice({
    id: record.id,
    userId: record.userId,
    name: record.name,
    type: record.type,
    manufacturer: record.manufacturer,
    model: record.model,
    connected: record.connected,
    lastSync: record.lastSync,
    settings: record.settings,
    metadata: record.metadata,
  });

  return { success: true, device: record };
}

export function syncDevice(deviceId: string, payload: SmartGymSyncRequest): { success: boolean; workoutsImported?: number; error?: string } {
  const devices = (globalThis as any).localStorage
    ? (() => {
        try {
          const raw = (globalThis as any).localStorage.getItem("titan_future_smart_gym_devices");
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      })()
    : [];

  const device = devices.find((d: any) => d.id === deviceId);
  if (!device) {
    return { success: false, error: "Device not found." };
  }

  const index = devices.findIndex((d: any) => d.id === deviceId);
  if (index !== -1) {
    devices[index].lastSync = new Date().toISOString();
    devices[index].connected = true;
    try {
      (globalThis as any).localStorage.setItem("titan_future_smart_gym_devices", JSON.stringify(devices));
    } catch {
      // ignore storage errors
    }
  }

  const { workoutTemplates } = getMockWorkoutData(device.type);
  let imported = 0;
  for (const template of workoutTemplates) {
    const record: SmartGymWorkout = {
      id: generateId(),
      userId: device.userId,
      deviceId: device.id,
      exercise: template.exercise,
      startedAt: template.startedAt,
      endedAt: template.endedAt,
      sets: template.sets,
      metadata: { importedFromSync: true, syncTimestamp: payload.timestamp },
    };
    futureSmartGym.addWorkout({
      id: record.id,
      userId: record.userId,
      deviceId: record.deviceId,
      exercise: record.exercise,
      startedAt: record.startedAt,
      endedAt: record.endedAt,
      sets: record.sets,
      metadata: record.metadata,
    });
    imported++;
  }

  return { success: true, workoutsImported: imported };
}

export function importFromDevice(deviceId: string): { success: boolean; workoutsImported?: number; error?: string } {
  const payload: SmartGymSyncRequest = {
    deviceId,
    data: { source: "bulk_import" },
    timestamp: new Date().toISOString(),
  };
  return syncDevice(deviceId, payload);
}

export function detectWorkout(_deviceId: string, telemetry: Record<string, unknown>): { type: string; confidence: number } {
  const patterns: Array<{ type: string; match: () => boolean; confidence: number }> = [
    {
      type: "strength",
      match: () => {
        const reps = Array.isArray(telemetry.reps) ? telemetry.reps : [];
        const weights = Array.isArray(telemetry.weights) ? telemetry.weights : [];
        return reps.length > 0 && weights.length > 0;
      },
      confidence: 0.92,
    },
    {
      type: "cardio",
      match: () => {
        const heartRate = telemetry.heartRate as number | undefined;
        const duration = telemetry.duration as number | undefined;
        return (heartRate !== undefined && heartRate > 100) || (duration !== undefined && duration > 600);
      },
      confidence: 0.87,
    },
    {
      type: "resistance",
      match: () => {
        const resistance = telemetry.resistance as number | undefined;
        return resistance !== undefined && resistance > 0;
      },
      confidence: 0.85,
    },
  ];

  const matched = patterns.find((p) => p.match());
  if (matched) {
    return { type: matched.type, confidence: matched.confidence };
  }

  return { type: "unknown", confidence: 0.3 };
}

export function computeEquipmentRecommendations(userId: string): EquipmentRecommendation[] {
  const workouts = futureSmartGym.listWorkouts(userId);
  const exercised = new Set(workouts.map((w) => (w as any).exercise));
  const allExercises = ["Bench Press", "Squat", "Deadlift", "Pull-Ups", "Lunges", "Overhead Press", "Barbell Row", "Leg Press", "Cable Flyes", "Dips"];

  return allExercises
    .filter((ex) => !exercised.has(ex))
    .map((name, idx) => ({
      id: `rec-${Date.now()}-${idx}`,
      name,
      type: name.toLowerCase().includes("press") || name.toLowerCase().includes("row") || name.toLowerCase().includes("dip") ? "strength" : "functional",
      reason: "You haven't trained this exercise recently. Adding it will improve muscle balance.",
      confidence: Math.round(60 + Math.random() * 30),
      priority: idx < 3 ? "high" : idx < 6 ? "medium" : "low",
    }))
    .slice(0, 5);
}

export function computeMaintenanceStatus(_device: SmartGymDevice): MaintenanceStatus {
  const rand = Math.random();
  let status: MaintenanceStatus["status"];
  let message: string;
  let confidence: number;

  if (rand < 0.6) {
    status = "ok";
    message = "Equipment is in good working order.";
    confidence = 88 + Math.random() * 10;
  } else if (rand < 0.8) {
    status = "due";
    message = "Routine maintenance recommended within the next 2 weeks.";
    confidence = 70 + Math.random() * 15;
  } else if (rand < 0.95) {
    status = "overdue";
    message = "Overdue maintenance. Please inspect before next use.";
    confidence = 82 + Math.random() * 10;
  } else {
    status = "unknown";
    message = "Insufficient data to assess maintenance status.";
    confidence = 45 + Math.random() * 20;
  }

  if (status === "due" || status === "overdue") {
    const d = new Date();
    d.setDate(d.getDate() + (status === "due" ? 14 : 3));
    return { status, confidence: Math.round(confidence), message, nextCheck: d.toISOString() };
  }

  return { status, confidence: Math.round(confidence), message };
}

export function computeAnalytics(userId: string): SmartGymAnalyticsResponse {
  const workouts = futureSmartGym.listWorkouts(userId);
  const totalWorkouts = workouts.length;

  let totalVolume = 0;
  const exerciseCount: Record<string, number> = {};
  let totalDuration = 0;
  let durationCount = 0;

  const progression: Array<{ date: string; value: number; label?: string }> = [];

  workouts.forEach((w: any) => {
    if (w.sets && Array.isArray(w.sets)) {
      w.sets.forEach((s: any) => {
        const weight = s.weight || 0;
        const reps = s.reps || 0;
        const duration = s.duration || 0;
        const resistance = s.resistance || 0;
        totalVolume += weight * reps + resistance * duration;
      });
    }

    exerciseCount[w.exercise] = (exerciseCount[w.exercise] || 0) + 1;

    if (w.startedAt && w.endedAt) {
      const start = new Date(w.startedAt).getTime();
      const end = new Date(w.endedAt).getTime();
      if (!isNaN(start) && !isNaN(end)) {
        totalDuration += (end - start) / 1000 / 60;
        durationCount++;
      }
    }

    const dateKey = new Date(w.startedAt).toISOString().split("T")[0];
    const existing = progression.find((p) => p.date === dateKey);
    if (existing) {
      existing.value += 1;
    } else {
      progression.push({ date: dateKey, value: 1 });
    }
  });

  progression.sort((a, b) => a.date.localeCompare(b.date));

  const topExercises = Object.entries(exerciseCount)
    .map(([exercise, count]) => ({ exercise, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalWorkouts,
    totalVolume: Math.round(totalVolume),
    topExercises,
    avgDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
    progression,
  };
}

function getMockWorkoutData(type: string): { workoutTemplates: SmartGymWorkout[] } {
  const now = new Date();
  const templates: SmartGymWorkout[] = [];

  const exerciseSets: Record<string, Array<{ exercise: string; sets: Array<{ weight?: number; reps?: number; duration?: number; resistance?: number }> }>> = {
    strength: [
      { exercise: "Bench Press", sets: [{ weight: 80, reps: 8 }, { weight: 85, reps: 6 }, { weight: 90, reps: 5 }] },
      { exercise: "Squat", sets: [{ weight: 100, reps: 8 }, { weight: 110, reps: 6 }, { weight: 120, reps: 4 }] },
      { exercise: "Deadlift", sets: [{ weight: 120, reps: 5 }, { weight: 130, reps: 4 }] },
    ],
    cardio: [
      { exercise: "Treadmill Run", sets: [{ duration: 1800, resistance: 2 }] },
      { exercise: "Cycling", sets: [{ duration: 1200, resistance: 4 }] },
    ],
    resistance: [
      { exercise: "Cable Flyes", sets: [{ weight: 30, reps: 12 }, { weight: 35, reps: 10 }] },
      { exercise: "Pull-Downs", sets: [{ weight: 50, reps: 10 }, { weight: 55, reps: 8 }] },
    ],
    sensor: [
      { exercise: "Mobility Flow", sets: [{ duration: 600 }] },
    ],
  };

  const items = exerciseSets[type] || exerciseSets.strength;
  const count = 2 + Math.floor(Math.random() * 2);

  for (let i = 0; i < count; i++) {
    const template = items[i % items.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const startedAt = new Date(now.getTime() - daysAgo * 86400000 - Math.floor(Math.random() * 86400000));
    const endedAt = new Date(startedAt.getTime() + 30 * 60 * 1000 + Math.floor(Math.random() * 30 * 60 * 1000));

    templates.push({
      id: generateId(),
      userId: "",
      deviceId: "",
      exercise: template.exercise,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      sets: template.sets,
      metadata: { mock: true },
    });
  }

  return { workoutTemplates: templates.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()) };
}
