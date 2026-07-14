import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    analytics: {
      openRate: 84,
      dismissRate: 12,
      successRate: 98,
      aiDeliveryScore: 92,
    },
    triggers: [
      { id: "tr1", label: "Missed Workout Push Alert", channel: "Push", active: true },
      { id: "tr2", label: "Hydration Reminder (3L+)", channel: "In-App", active: true },
      { id: "tr3", label: "CNS Recovery Drop Warning", channel: "Email", active: false },
    ],
  };
  return NextResponse.json(payload);
}
