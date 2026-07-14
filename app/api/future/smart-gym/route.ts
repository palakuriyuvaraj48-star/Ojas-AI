import { NextResponse } from "next/server";
import { registerDevice, syncDevice, computeAnalytics, computeEquipmentRecommendations } from "@/lib/future-ai/smart-gym/engine";

export const runtime = "nodejs";

function getUserId(req: Request): string {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  return userId || "demo-user";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const userId = getUserId(request);

  switch (action) {
    case "devices": {
      const { futureSmartGym } = await import("@/lib/future-ai/storage");
      const devices = futureSmartGym.listDevices(userId);
      return NextResponse.json({ success: true, devices });
    }
    case "workouts": {
      const { futureSmartGym } = await import("@/lib/future-ai/storage");
      const workouts = futureSmartGym.listWorkouts(userId);
      return NextResponse.json({ success: true, workouts });
    }
    case "analytics": {
      const analytics = computeAnalytics(userId);
      return NextResponse.json({ success: true, data: analytics });
    }
    case "recommendations": {
      const recommendations = computeEquipmentRecommendations(userId);
      return NextResponse.json({ success: true, recommendations });
    }
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  try {
    const body = await request.json();

    switch (action) {
      case "register": {
        const result = registerDevice(getUserId(request), body);
        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, device: result.device });
      }
      case "sync": {
        const { deviceId, data, timestamp } = body;
        const result = syncDevice(deviceId, { deviceId, data: data as Record<string, unknown>, timestamp: timestamp || new Date().toISOString() });
        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, workoutsImported: result.workoutsImported });
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
