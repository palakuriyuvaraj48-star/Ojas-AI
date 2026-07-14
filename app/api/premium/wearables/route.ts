import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    wearables: [
      { id: "whoop", name: "WHOOP Strap 4.0", connected: true, battery: 78, lastSync: "10 mins ago", health: "Excellent" },
      { id: "oura", name: "Oura Ring Gen3", connected: true, battery: 42, lastSync: "1 hour ago", health: "Good" },
      { id: "garmin", name: "Garmin Fenix 7", connected: false, battery: 0, lastSync: "Never", health: "Disconnected" },
    ],
    biometrics: {
      rhr: 54,
      hrv: 72,
      sleepHrs: 7.2,
      readiness: 85,
      activeCalories: 450,
      steps: 8200,
    },
  };
  return NextResponse.json(payload);
}
