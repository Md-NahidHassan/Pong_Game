"use client";

import React from "react";

interface AnimatedBackgroundProps {
  visualEffects: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  visualEffects,
}) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden bg-[#030612]"
    >
      {/* Ambient radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,0.16),transparent_42%),radial-gradient(circle_at_82%_26%,rgba(168,85,247,0.18),transparent_44%),radial-gradient(circle_at_50%_88%,rgba(59,130,246,0.16),transparent_48%)]" />

      {/* Floating ambient neon orbs */}
      {visualEffects && (
        <>
          <div className="animate-float-orb absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div
            className="animate-float-orb absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-purple-600/12 blur-3xl"
            style={{ animationDelay: "2.2s" }}
          />
          <div
            className="animate-float-orb absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
            style={{ animationDelay: "4.1s" }}
          />
        </>
      )}

      {/* Perspective retro-futuristic floor grid */}
      <div className="absolute inset-x-0 bottom-0 h-[52vh] overflow-hidden opacity-45 [mask-image:linear-gradient(to_bottom,transparent,black_45%)]">
        <div
          className={`absolute -inset-x-[35%] -bottom-24 -top-20 bg-[linear-gradient(to_right,rgba(34,211,238,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.22)_1px,transparent_1px)] bg-[size:60px_60px] ${
            visualEffects
              ? "animate-grid-move"
              : "[transform:perspective(560px)_rotateX(62deg)]"
          }`}
        />
      </div>

      {/* Subtle scanline texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40" />
    </div>
  );
};
