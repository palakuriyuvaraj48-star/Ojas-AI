import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const calories = parseInt(searchParams.get("calories") || "0");
  const protein = parseInt(searchParams.get("protein") || "0");
  const targetCal = parseInt(searchParams.get("targetCal") || "2000");
  const targetPro = parseInt(searchParams.get("targetPro") || "150");
  const workoutCompleted = searchParams.get("workout") === "true";
  const type = searchParams.get("type") || "all";

  const notifications: any[] = [];
  const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // 1. Protein alert
  if (protein < targetPro) {
    notifications.push({
      id: "prot-1",
      type: "warning",
      title: "Protein Deficit Detected",
      message: `I noticed your protein intake is below today's target. You're at ${protein}g of your ${targetPro}g protein target. Log a protein-rich meal.`,
      read: false,
      createdAt: timeNow,
      actionLabel: "Scan Protein Food",
      actionRoute: "/nutrition?tab=scanner",
    });
  }

  // 2. Workout recovery alert
  if (workoutCompleted) {
    notifications.push({
      id: "work-1",
      type: "success",
      title: "Workout Recovery Window Active",
      message: "Your workout today was demanding. Consider a protein-rich meal to kickstart cellular protein synthesis.",
      read: false,
      createdAt: timeNow,
      actionLabel: "Log Recovery Meal",
      actionRoute: "/nutrition?tab=scanner",
    });
  }

  // 3. Calorie limit alerts
  if (calories >= targetCal) {
    notifications.push({
      id: "cal-1",
      type: "warning",
      title: "Calorie Target Reached",
      message: `You've already reached today's calorie target of ${targetCal} kcal (Logged: ${calories} kcal).`,
      read: false,
      createdAt: timeNow,
    });
  } else if (calories > 0 && calories < targetCal - 300) {
    notifications.push({
      id: "cal-2",
      type: "success",
      title: "Calorie Budget Available",
      message: `You still have room for another balanced meal (Remaining: ${targetCal - calories} kcal).`,
      read: false,
      createdAt: timeNow,
      actionLabel: "Plan Next Meal",
      actionRoute: "/nutrition?tab=planner",
    });
  }

  // 4. Default hydration check
  notifications.push({
    id: "hyd-1",
    type: "reminder",
    title: "Hydration Check",
    message: "Drink a glass of water now. Retaining optimal hydration levels optimizes cellular recovery pathways.",
    read: false,
    createdAt: timeNow,
    actionLabel: "Log Water",
    actionRoute: "/nutrition?tab=dashboard",
  });

  // 5. Default preplan list (always add)
  notifications.push({
    id: "list-1",
    type: "info",
    title: "AI Grocery List Updated",
    message: "Your AI-compiled grocery list for the week has been adapted to your macro preferences.",
    read: true,
    createdAt: timeNow,
    actionLabel: "View Grocery List",
    actionRoute: "/nutrition?tab=grocery",
  });

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
