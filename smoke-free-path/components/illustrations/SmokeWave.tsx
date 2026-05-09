import React from "react";
import { Svg, Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface SmokeWaveProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
}

export default function SmokeWave({
  width = 280,
  height = 120,
  color = "#3D5070", // Fallback color as specified, but usually passed from cravingCalm or similar
  opacity = 0.5,
}: SmokeWaveProps) {
  // Use a soft gradient to fade the waves from left to right
  return (
    <Svg
      width={width}
      height={height}
      opacity={opacity}
      viewBox={`0 0 ${width} ${height}`}
    >
      <Defs>
        <LinearGradient id="smokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <Stop offset="50%" stopColor={color} stopOpacity="0.4" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/*
        Draw 3 overlapping cubic bezier paths that mimic dissipating smoke.
        We will draw them horizontally from left to right.
      */}

      {/* Wave 1: Slow, wide wave */}
      <Path
        d={`M 0 ${height * 0.5} C ${width * 0.2} ${height * 0.2} ${width * 0.4} ${height * 0.8} ${width * 0.7} ${height * 0.4} S ${width} ${height * 0.3} ${width} ${height * 0.3}`}
        fill="none"
        stroke="url(#smokeGrad)"
        strokeWidth={12}
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* Wave 2: Middle wave, tighter curve */}
      <Path
        d={`M 0 ${height * 0.6} C ${width * 0.15} ${height * 0.8} ${width * 0.35} ${height * 0.2} ${width * 0.6} ${height * 0.6} S ${width} ${height * 0.45} ${width} ${height * 0.45}`}
        fill="none"
        stroke="url(#smokeGrad)"
        strokeWidth={16}
        strokeLinecap="round"
        opacity={0.5}
      />

      {/* Wave 3: Higher wave */}
      <Path
        d={`M 0 ${height * 0.4} C ${width * 0.25} ${height * 0.1} ${width * 0.45} ${height * 0.7} ${width * 0.8} ${height * 0.3} S ${width} ${height * 0.6} ${width} ${height * 0.6}`}
        fill="none"
        stroke="url(#smokeGrad)"
        strokeWidth={20}
        strokeLinecap="round"
        opacity={0.3}
      />
    </Svg>
  );
}
