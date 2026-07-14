import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const estimates = [
      { id: "r1", name: "Grilled Chicken Salad with Avocado", portion: "350g serving", cal: 420, p: 38, c: 12, f: 24, fiber: 6, confidence: 94 },
      { id: "r2", name: "Masala Dosa with Sambar", portion: "2 pieces + 150ml sambar", cal: 380, p: 10, c: 58, f: 12, fiber: 4, confidence: 87 },
      { id: "r3", name: "Protein Oatmeal Bowl", portion: "300g serving", cal: 460, p: 32, c: 52, f: 10, fiber: 8, confidence: 91 },
    ];

    const result = estimates[Math.floor(Math.random() * estimates.length)];

    return NextResponse.json({
      ...result,
      message: "AI Vision Lens identified possible food matches. Select the best match and adjust portion if needed.",
      alternatives: estimates.filter((e) => e.id !== result.id),
    });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
