import React from "react";
import { Svg, Path, Circle, G } from "react-native-svg";
import theme from "../../theme";

interface MilestoneStarburstProps {
  size?: number;
  color?: string;
  glowColor?: string;
  hasGlow?: boolean;
}

export default function MilestoneStarburst({
  size = 20,
  color = theme.colors.primary,
  glowColor = theme.colors.primaryLight,
  hasGlow = true,
}: MilestoneStarburstProps) {
  const center = size / 2;
  const radius = size * 0.45;
  const innerRadius = radius * 0.4;

  // 8-point starburst
  const points = 8;
  const angleStep = (Math.PI * 2) / points;
  let d = "";

  for (let i = 0; i < points * 2; i++) {
    const angle = i * (angleStep / 2) - Math.PI / 2;
    const isOuter = i % 2 === 0;
    const r = isOuter ? radius : innerRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    if (i === 0) {
      d += `M ${x} ${y} `;
    } else {
      d += `L ${x} ${y} `;
    }
  }
  d += "Z";

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G>
        {hasGlow && (
          <Circle
            cx={center}
            cy={center}
            r={radius * 1.2}
            fill={glowColor}
            opacity={0.3}
          />
        )}
        <Path d={d} fill={color} />
      </G>
    </Svg>
  );
}
