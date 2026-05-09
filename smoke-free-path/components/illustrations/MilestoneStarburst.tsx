import React from "react";
import { Svg, Polygon, Circle, Text } from "react-native-svg";
import theme from "../../theme";

interface MilestoneStarburstProps {
  size?: number;
  dayNumber: number;
  color?: string;
  backgroundColor?: string;
}

export default function MilestoneStarburst({
  size = 120,
  dayNumber,
  color = theme.colors.primary,
  backgroundColor = theme.colors.background,
}: MilestoneStarburstProps) {
  const center = size / 2;
  const outerRadius = size / 2;
  const innerRadius = size * 0.38; // The inner circle that holds the text
  const pointsCount = 12; // 12-point starburst
  const starPoints = [];

  // Generate the starburst polygon points
  for (let i = 0; i < pointsCount * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : outerRadius * 0.75;
    const angle = (Math.PI / pointsCount) * i;
    const x = center + radius * Math.sin(angle);
    const y = center - radius * Math.cos(angle);
    starPoints.push(`${x},${y}`);
  }

  const polygonPoints = starPoints.join(" ");

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer starburst shape */}
      <Polygon points={polygonPoints} fill={color} />

      {/* Inner background circle */}
      <Circle cx={center} cy={center} r={innerRadius} fill={backgroundColor} />

      {/* Thin gold ring */}
      <Circle
        cx={center}
        cy={center}
        r={innerRadius - 4}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Centered day number */}
      <Text
        x={center}
        y={center + size * 0.1} // Slight vertical adjustment for text alignment
        fill={color}
        fontSize={size * 0.28}
        fontWeight="bold"
        textAnchor="middle"
      >
        {dayNumber}
      </Text>
    </Svg>
  );
}
