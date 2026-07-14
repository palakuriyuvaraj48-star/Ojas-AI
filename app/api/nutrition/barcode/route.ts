import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") || "";

  const FOODS_DB = [
    { barcode: "1234567890", name: "Tandoori Chicken Bowl", cal: 580, p: 48, c: 42, f: 16, brand: "FreshMenu" },
    { barcode: "0987654321", name: "Paneer Tikka Wrap", cal: 720, p: 28, c: 78, f: 32, brand: "Local Café" },
    { barcode: "5555555555", name: "Protein Smoothie", cal: 340, p: 32, c: 28, f: 6, brand: "Juicery" },
    { barcode: "1111111111", name: "Egg White Omelette", cal: 240, p: 36, c: 8, f: 6, brand: "Heartland" },
  ];

  if (code) {
    const found = FOODS_DB.find((f) => f.barcode === code);
    if (found) return NextResponse.json(found);
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(FOODS_DB);
}
