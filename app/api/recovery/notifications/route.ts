import { NextResponse } from "next/server";
import { computeRecovery, defaultSignals } from "@/lib/recovery";

function buildNotifications() {
  const signals = defaultSignals();
  const result = computeRecovery(signals, { previousScore: 70 });
  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const list = [
    {
      id: "1",
      type: result.trend === "improving" ? "success" : "info",
      title: "Recovery Status",
      message: `Your recovery score is ${result.score}/100 (${result.readiness}). ${result.recommendation.label} is recommended today.`,
      read: false,
      createdAt: now(),
      actionLabel: "View Timeline",
      actionRoute: "/recovery?tab=timeline",
    },
    {
      id: "2",
      type: result.fatigueLevel >= 55 ? "warning" : "info",
      title: "Intensity Guidance",
      message:
        result.fatigueLevel >= 55
          ? `Fatigue is elevated (${result.fatigueLevel}/100). Consider reducing training intensity today.`
          : "Fatigue is managed. You can train with confidence.",
      read: false,
      createdAt: now(),
      actionLabel: "Rest Day Planner",
      actionRoute: "/recovery?tab=rest-day",
    },
    {
      id: "3",
      type: "info",
      title: "Mobility Session",
      message: "A 15-minute mobility flow may help your tightest muscle groups recover faster.",
      read: false,
      createdAt: now(),
      actionLabel: "Open Mobility",
      actionRoute: "/recovery?tab=mobility",
    },
    {
      id: "4",
      type: "success",
      title: "Sleep Consistency",
      message: "Your sleep consistency is holding steady. Keep your fixed wake time to protect recovery.",
      read: true,
      createdAt: now(),
    },
  ];

  return list;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";
  const notifications = buildNotifications();

  if (type !== "all") {
    const filtered = notifications.filter((n) => n.type === type);
    const unreadCount = notifications.filter((n) => !n.read).length;
    return NextResponse.json({ notifications: filtered, unreadCount });
  }
  const unreadCount = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    return NextResponse.json({ success: true, message: id ? "Notification marked as read" : "Actions processed" });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
