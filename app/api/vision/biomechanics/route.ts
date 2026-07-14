import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    efficiencyScores: {
      efficiency: 88,
      stability: 91,
      control: 85,
      tempo: 82,
      symmetry: 94,
      rom: 78,
    },
    joints: {
      neck: { name: "Cervical Spine (Neck)", rom: "42° flex", status: "Excellent", confidence: 97 },
      shoulder: { name: "Shoulders", rom: "165° flexion", status: "Excellent", confidence: 96 },
      elbow: { name: "Elbows", rom: "145° flexion", status: "Stable", confidence: 95 },
      wrist: { name: "Wrists", rom: "72° extension", status: "Stable", confidence: 94 },
      spine: { name: "Thoracic Spine (Back)", rom: "24° rotation", status: "Review", confidence: 92 },
      hip: { name: "Lumbo-Pelvic (Hips)", rom: "115° flexion", status: "Review", confidence: 91 },
      knee: { name: "Knees", rom: "128° flexion", status: "Attention", confidence: 93 },
      ankle: { name: "Ankles", rom: "18° dorsiflexion", status: "Attention", confidence: 89 },
    },
    recommendations: [
      {
        why: "Elevated fatigue signature (sleep is below 6.5 hours and quadriceps soreness is high).",
        confidence: 94,
        improvement: "Reduce Squat weight load by 15% today.",
        benefit: "Minimizes lower lumbar shear stress and reduces injury risk under fatigue.",
      },
      {
        why: "Ankle dorsiflexion limits are triggering knee valgus caving.",
        confidence: 88,
        improvement: "Widening your squat stance by 3cm and practicing Calf wall flossing before lifting.",
        benefit: "Improves squat balance and allows thighs to track parallel cleanly.",
      },
    ],
  };

  return NextResponse.json(payload);
}
