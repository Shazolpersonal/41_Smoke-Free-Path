import React from "react";
import { Svg, Circle, G } from "react-native-svg";
import theme from "../../theme";

interface StarFieldProps {
  width?: number;
  height?: number;
  starCount?: number;
  opacity?: number;
}

// 40 hardcoded positions as percentage of width/height (0.0 to 1.0)
const STAR_POSITIONS = [
  { x: 0.1, y: 0.2, r: 1.5, isGold: true, hasGlow: true },
  { x: 0.85, y: 0.15, r: 2.5, isGold: false, hasGlow: true },
  { x: 0.3, y: 0.8, r: 1.0, isGold: false, hasGlow: false },
  { x: 0.7, y: 0.75, r: 2.0, isGold: true, hasGlow: false },
  { x: 0.5, y: 0.4, r: 1.2, isGold: false, hasGlow: false },
  { x: 0.15, y: 0.6, r: 1.8, isGold: false, hasGlow: false },
  { x: 0.9, y: 0.5, r: 2.2, isGold: true, hasGlow: true },
  { x: 0.4, y: 0.1, r: 1.0, isGold: false, hasGlow: false },
  { x: 0.6, y: 0.9, r: 1.5, isGold: false, hasGlow: false },
  { x: 0.25, y: 0.35, r: 2.5, isGold: false, hasGlow: true },
  { x: 0.75, y: 0.3, r: 1.0, isGold: false, hasGlow: false },
  { x: 0.45, y: 0.65, r: 1.8, isGold: true, hasGlow: false },
  { x: 0.8, y: 0.85, r: 1.2, isGold: false, hasGlow: false },
  { x: 0.2, y: 0.95, r: 2.0, isGold: false, hasGlow: false },
  { x: 0.05, y: 0.45, r: 1.0, isGold: false, hasGlow: false },
  { x: 0.95, y: 0.25, r: 1.5, isGold: true, hasGlow: false },
  { x: 0.35, y: 0.55, r: 2.2, isGold: false, hasGlow: true },
  { x: 0.65, y: 0.05, r: 1.2, isGold: false, hasGlow: false },
  { x: 0.55, y: 0.8, r: 1.0, isGold: false, hasGlow: false },
  { x: 0.12, y: 0.1, r: 1.8, isGold: false, hasGlow: false },
  { x: 0.88, y: 0.65, r: 2.5, isGold: true, hasGlow: true },
  { x: 0.28, y: 0.7, r: 1.0, isGold: false, hasGlow: false },
  { x: 0.72, y: 0.4, r: 1.5, isGold: false, hasGlow: false },
  { x: 0.48, y: 0.2, r: 2.0, isGold: false, hasGlow: false },
  { x: 0.52, y: 0.95, r: 1.2, isGold: true, hasGlow: false },
  { x: 0.18, y: 0.85, r: 1.0, isGold: false, hasGlow: false },
  { x: 0.92, y: 0.05, r: 1.8, isGold: false, hasGlow: false },
  { x: 0.38, y: 0.9, r: 1.5, isGold: false, hasGlow: false },
  { x: 0.62, y: 0.25, r: 2.2, isGold: true, hasGlow: true },
  { x: 0.22, y: 0.5, r: 1.0, isGold: false, hasGlow: false },
  { x: 0.78, y: 0.95, r: 1.2, isGold: false, hasGlow: false },
  { x: 0.42, y: 0.45, r: 2.5, isGold: false, hasGlow: true },
  { x: 0.58, y: 0.6, r: 1.0, isGold: false, hasGlow: false },
  { x: 0.08, y: 0.75, r: 1.8, isGold: true, hasGlow: false },
  { x: 0.82, y: 0.45, r: 1.5, isGold: false, hasGlow: false },
  { x: 0.32, y: 0.15, r: 1.2, isGold: false, hasGlow: false },
  { x: 0.68, y: 0.55, r: 2.0, isGold: false, hasGlow: false },
  { x: 0.15, y: 0.3, r: 1.0, isGold: true, hasGlow: false },
  { x: 0.95, y: 0.8, r: 1.5, isGold: false, hasGlow: false },
  { x: 0.45, y: 0.85, r: 2.2, isGold: false, hasGlow: true },
];

export default function StarField({
  width = 300,
  height = 300,
  starCount = 40,
  opacity = 0.8,
}: StarFieldProps) {
  const count = Math.min(Math.max(0, starCount), 40);
  const activeStars = STAR_POSITIONS.slice(0, count);

  return (
    <Svg
      width={width}
      height={height}
      opacity={opacity}
      viewBox={`0 0 ${width} ${height}`}
    >
      {activeStars.map((star, index) => {
        const cx = star.x * width;
        const cy = star.y * height;
        const fill = star.isGold ? theme.colors.primary : theme.colors.text;

        return (
          <G key={`star-${index}`}>
            {star.hasGlow && (
              <Circle
                cx={cx}
                cy={cy}
                r={star.r * 2.5}
                fill={fill}
                opacity={0.15}
              />
            )}
            <Circle
              cx={cx}
              cy={cy}
              r={star.r}
              fill={fill}
              opacity={star.isGold ? 0.9 : 0.6 + (index % 4) * 0.1}
            />
          </G>
        );
      })}
    </Svg>
  );
}
