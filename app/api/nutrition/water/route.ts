import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "today";

  if (action === "today") {
    return NextResponse.json({
      date: new Date().toISOString().split("T")[0],
      totalLitres: 2.1,
      targetLitres: 3.2,
      logs: [
        { id: "1", amount: 0.25, time: "08:15 AM" },
        { id: "2", amount: 0.5, time: "10:30 AM" },
        { id: "3", amount: 0.25, time: "12:45 PM" },
        { id: "4", amount: 0.5, time: "03:00 PM" },
        { id: "5", amount: 0.6, time: "05:30 PM" },
      ],
      recommendations: [
        { text: "Based on your weight (64.2kg) and activity level, you should drink 3.2L today.", percent: 65 },
        { text: "You logged a workout. Add +500mL within the next hour.", percent: 15 },
      ],
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    return NextResponse.json({
      id: Date.now().toString(),
      amount,
      loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      totalToday: (2.1 + amount).toFixed(1),
    });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
