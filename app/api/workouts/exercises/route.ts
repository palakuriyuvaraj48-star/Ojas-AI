import { NextResponse } from "next/server";
import { EXERCISES_DATABASE } from "@/lib/workouts/exercises";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase() || "";
  const muscle = searchParams.get("muscle")?.toLowerCase() || "";
  const results = EXERCISES_DATABASE.filter((exercise) =>
    (!query || exercise.name.toLowerCase().includes(query) || exercise.muscleGroup.toLowerCase().includes(query) || exercise.equipment.toLowerCase().includes(query)) &&
    (!muscle || exercise.muscleGroup.toLowerCase() === muscle)
  );
  return NextResponse.json(results);
}
