"use client";

import type { JointMap, JointName } from "@/lib/vision";

interface Bone {
  a: JointName;
  b: JointName;
  jointKey?: string; // Links bone to biomechanical fault metrics
}

const BONES: Bone[] = [
  { a: "head", b: "neck" },
  { a: "neck", b: "leftShoulder" },
  { a: "neck", b: "rightShoulder" },
  { a: "leftShoulder", b: "leftElbow", jointKey: "elbowAngle" },
  { a: "leftElbow", b: "leftWrist", jointKey: "elbowAngle" },
  { a: "rightShoulder", b: "rightElbow", jointKey: "elbowAngle" },
  { a: "rightElbow", b: "rightWrist", jointKey: "elbowAngle" },
  { a: "neck", b: "spine", jointKey: "torso" },
  { a: "spine", b: "pelvis", jointKey: "torso" },
  { a: "pelvis", b: "leftHip", jointKey: "hipAngle" },
  { a: "pelvis", b: "rightHip", jointKey: "hipAngle" },
  { a: "leftShoulder", b: "rightShoulder" },
  { a: "leftHip", b: "rightHip" },
  { a: "leftHip", b: "leftKnee", jointKey: "kneeAngle" },
  { a: "leftKnee", b: "leftAnkle", jointKey: "kneeAngle" },
  { a: "rightHip", b: "rightKnee", jointKey: "kneeAngle" },
  { a: "rightKnee", b: "rightAnkle", jointKey: "kneeAngle" },
];

interface Props {
  pose: JointMap | null;
  mirrored?: boolean;
  showAngles?: boolean;
  angles?: Record<string, number>;
  faultJoints?: string[];
  primaryJoint?: string;
  targetAngle?: number;
  activeCue?: string;
  className?: string;
}

export function SkeletonOverlay({
  pose,
  mirrored,
  showAngles = true,
  angles,
  faultJoints = [],
  primaryJoint = "kneeAngle",
  targetAngle = 95,
  activeCue,
  className,
}: Props) {
  if (!pose) return null;
  const px = (n: JointName) => (mirrored ? 100 - pose[n].x * 100 : pose[n].x * 100);
  const py = (n: JointName) => pose[n].y * 100;

  // Determine if a specific bone is problematic
  const isBoneFaulted = (bone: Bone) => {
    if (!bone.jointKey) return false;
    return faultJoints.some((fj) => fj.toLowerCase().includes(bone.jointKey!.toLowerCase()));
  };

  // Determine bone stroke color
  const getBoneStyle = (bone: Bone) => {
    if (isBoneFaulted(bone)) {
      return { stroke: "#ef4444", strokeWidth: 1.8, opacity: 1.0, filter: "drop-shadow(0 0 4px #ef4444)" };
    }
    if (bone.jointKey === primaryJoint) {
      return { stroke: "#10b981", strokeWidth: 1.3, opacity: 0.95 };
    }
    return { stroke: "#22d3ee", strokeWidth: 0.9, opacity: 0.85 };
  };

  const isKneeFaulted = faultJoints.some((f) => f.toLowerCase().includes("knee"));
  const isElbowFaulted = faultJoints.some((f) => f.toLowerCase().includes("elbow"));
  const isTorsoFaulted = faultJoints.some((f) => f.toLowerCase().includes("torso") || f.toLowerCase().includes("spine"));

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Bones with dynamic color segmentation */}
      {BONES.map((bone, i) => {
        const style = getBoneStyle(bone);
        return (
          <line
            key={i}
            x1={px(bone.a)}
            y1={py(bone.a)}
            x2={px(bone.b)}
            y2={py(bone.b)}
            stroke={style.stroke}
            strokeWidth={style.strokeWidth}
            strokeLinecap="round"
            opacity={style.opacity}
            style={{ filter: style.filter }}
          />
        );
      })}

      {/* Joint Nodes */}
      {(Object.keys(pose) as JointName[]).map((n) => {
        const isFaulted =
          (isKneeFaulted && (n === "leftKnee" || n === "rightKnee")) ||
          (isElbowFaulted && (n === "leftElbow" || n === "rightElbow")) ||
          (isTorsoFaulted && (n === "spine" || n === "pelvis"));

        return (
          <circle
            key={n}
            cx={px(n)}
            cy={py(n)}
            r={isFaulted ? 2.4 : 1.5}
            fill={isFaulted ? "#ef4444" : "#7dd3fc"}
            stroke={isFaulted ? "#ffffff" : "#0369a1"}
            strokeWidth={isFaulted ? 0.6 : 0.4}
            className={isFaulted ? "animate-pulse" : ""}
          />
        );
      })}

      {/* Live Angle Labels & Diagnostic Callouts */}
      {showAngles && angles && (
        <>
          {angles.kneeAngle != null && (
            <AngleCallout
              x={px("leftKnee")}
              y={py("leftKnee") - 4}
              angle={Math.round(angles.kneeAngle)}
              target={targetAngle}
              isFault={isKneeFaulted}
              jointName="Knee"
            />
          )}

          {angles.elbowAngle != null && angles.elbowAngle < 178 && (
            <AngleCallout
              x={px("leftElbow")}
              y={py("leftElbow") - 4}
              angle={Math.round(angles.elbowAngle)}
              target={targetAngle}
              isFault={isElbowFaulted}
              jointName="Elbow"
            />
          )}

          {angles.torso != null && (
            <text
              x={px("neck")}
              y={py("neck") - 3}
              fill={isTorsoFaulted ? "#ef4444" : "#e0f2fe"}
              fontSize={2.8}
              fontWeight={700}
              textAnchor="middle"
              style={{ paintOrder: "stroke" }}
              stroke="#000000"
              strokeWidth={0.6}
            >
              Torso: {Math.round(angles.torso)}°
            </text>
          )}
        </>
      )}
    </svg>
  );
}

function AngleCallout({
  x,
  y,
  angle,
  target,
  isFault,
  jointName,
}: {
  x: number;
  y: number;
  angle: number;
  target: number;
  isFault: boolean;
  jointName: string;
}) {
  const bgColor = isFault ? "#7f1d1d" : "#064e3b";
  const strokeColor = isFault ? "#ef4444" : "#10b981";
  const textColor = isFault ? "#fca5a5" : "#6ee7b7";

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x="-11"
        y="-3.5"
        width="22"
        height="5.5"
        rx="1.2"
        fill={bgColor}
        stroke={strokeColor}
        strokeWidth="0.35"
        opacity="0.95"
      />
      <text
        x="0"
        y="0.6"
        fill={textColor}
        fontSize={2.6}
        fontWeight={800}
        textAnchor="middle"
      >
        {isFault ? `⚠ ${angle}°` : `✓ ${angle}°`}
      </text>
    </g>
  );
}
