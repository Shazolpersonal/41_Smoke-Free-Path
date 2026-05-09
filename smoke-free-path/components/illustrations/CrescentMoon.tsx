import React from "react";
import { Svg, Circle, Defs, Mask, Rect, G } from "react-native-svg";
import theme from "../../theme";

interface CrescentMoonProps {
  size?: number;
  color?: string;
  glowColor?: string;
  showGlow?: boolean;
}

export default function CrescentMoon({
  size = 80,
  color = theme.colors.primary,
  glowColor = theme.colors.primaryLight,
  showGlow = true,
}: CrescentMoonProps) {
  const center = size / 2;
  const radius = size * 0.4; // The main moon radius
  // Move the cutout circle up and right
  const cutoutX = center + radius * 0.35;
  const cutoutY = center - radius * 0.35;
  const cutoutRadius = radius * 0.9;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <Mask id="moonMask">
          {/* White keeps the pixel, Black hides it */}
          <Rect x="0" y="0" width="100%" height="100%" fill="white" />
          <Circle cx={cutoutX} cy={cutoutY} r={cutoutRadius} fill="black" />
        </Mask>
      </Defs>

      {/* Glow */}
      {showGlow && (
        <Circle
          cx={center}
          cy={center}
          r={radius * 1.3}
          fill={glowColor}
          opacity={0.15}
        />
      )}

      {/* Crescent Moon */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        fill={color}
        mask="url(#moonMask)"
      />
    </Svg>
  );
}
