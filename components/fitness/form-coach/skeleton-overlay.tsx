"use client";

import type { JointMap, JointName } from "@/lib/vision";

interface Bone {
  a: JointName;
  b: JointName;
}

const BONES: Bone[] = [
  { a: "head", b: "neck" },
  { a: "neck", b: "leftShoulder" },
  { a: "neck", b: "rightShoulder" },
  { a: "leftShoulder", b: "leftElbow" },
  { a: "leftElbow", b: "leftWrist" },
  { a: "rightShoulder", b: "rightElbow" },
  { a: "rightElbow", b: "rightWrist" },
  { a: "neck", b: "spine" },
  { a: "spine", b: "pelvis" },
  { a: "pelvis", b: "leftHip" },
  { a: "pelvis", b: "rightHip" },
  { a: "leftShoulder", b: "rightShoulder" },
  { a: "leftHip", b: "rightHip" },
  { a: "leftHip", b: "leftKnee" },
  { a: "leftKnee", b: "leftAnkle" },
  { a: "rightHip", b: "rightKnee" },
  { a: "rightKnee", b: "rightAnkle" },
];

interface Props {
  pose: JointMap | null;
  mirrored?: boolean;
  showAngles?: boolean;
  angles?: Record<string, number>;
  className?: string;
}

export function SkeletonOverlay({ pose, mirrored, showAngles, angles, className }: Props) {
  if (!pose) return null;
  const px = (n: JointName) => (mirrored ? 100 - pose[n].x * 100 : pose[n].x * 100);
  const py = (n: JointName) => pose[n].y * 100;

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {BONES.map((bone, i) => (
        <line
          key={i}
          x1={px(bone.a)} y1={py(bone.a)} x2={px(bone.b)} y2={py(bone.b)}
          stroke="#22d3ee" strokeWidth={0.9} strokeLinecap="round" opacity={0.85}
        />
      ))}
      {(Object.keys(pose) as JointName[]).map((n) => (
        <circle key={n} cx={px(n)} cy={py(n)} r={1.5} fill="#7dd3fc" />
      ))}
      {showAngles && angles && (
        <>
          {angles.kneeAngle != null && (
            <AngleLabel x={px("leftKnee")} y={py("leftKnee") - 4} label={`${Math.round(angles.kneeAngle)}°`} />
          )}
          {angles.hipAngle != null && (
            <AngleLabel x={px("leftHip")} y={py("leftHip") - 4} label={`${Math.round(angles.hipAngle)}°`} />
          )}
          {angles.elbowAngle != null && angles.elbowAngle < 178 && (
            <AngleLabel x={px("leftElbow")} y={py("leftElbow") - 4} label={`${Math.round(angles.elbowAngle)}°`} />
          )}
          {angles.torso != null && (
            <AngleLabel x={px("neck")} y={py("neck") - 3} label={`${Math.round(angles.torso)}°`} />
          )}
        </>
      )}
    </svg>
  );
}

function AngleLabel({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <text x={x} y={y} fill="#e0f2fe" fontSize={3.2} fontWeight={700} textAnchor="middle" style={{ paintOrder: "stroke" }} stroke="#0c4a6e" strokeWidth={0.6}>
      {label}
    </text>
  );
}
