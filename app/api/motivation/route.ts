import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    xpProgress: {
      currentXp: 12480,
      targetXp: 15000,
      level: 18,
      levelTitle: "Elite Athlete",
      streak: 18,
      longestStreak: 45,
    },
    dailyMissions: [
      { id: "m1", title: "Drink 3.5L Water", xp: 300, done: false },
      { id: "m2", title: "Complete squat camera tracking", xp: 500, done: false },
      { id: "m3", title: "Walk 8000 steps today", xp: 200, done: true },
      { id: "m4", title: "Stretch hips for 10 minutes", xp: 250, done: false },
    ],
    challenges: {
      weekly: [
        { title: "Complete 4 progressive strength sessions", progress: "3/4", done: false },
        { title: "Hit protein targets 5 days straight", progress: "5/5", done: true },
      ],
      monthly: [
        { title: "Increase squat 1RM target projection by 5%", progress: "3.5%/5%", done: false },
      ],
    },
    storeItems: [
      { id: "theme1", name: "Cyberpunk Cyber Neon Theme", cost: 5000, type: "theme", unlocked: false },
      { id: "voice1", name: "Arnold AI Coach Voice", cost: 8000, type: "voice", unlocked: true },
      { id: "avatar1", name: "Golden Skeletal Frame Avatar", cost: 3000, type: "frame", unlocked: false },
    ],
  };

  return NextResponse.json(payload);
}
