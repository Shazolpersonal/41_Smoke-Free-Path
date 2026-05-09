import React from "react";
import { Svg, G, Path, Polygon, Circle } from "react-native-svg";
import theme from "../../theme";

interface DuaDecoratorProps {
  width?: number;
  color?: string;
  opacity?: number;
}

export default function DuaDecorator({
  width = 200,
  color = theme.colors.secondary,
  opacity = 0.8,
}: DuaDecoratorProps) {
  // Height is fixed relative to decoration needs, typically thin
  const height = 24;
  const center = width / 2;
  const centerY = height / 2;

  const diamondSize = 4;

  // A symmetrical path expanding out from the center diamond
  // Left swash
  const leftPath = `M ${center - 12} ${centerY} C ${center - 40} ${centerY - 10}, ${center - 60} ${centerY + 10}, ${20} ${centerY}`;
  // Right swash
  const rightPath = `M ${center + 12} ${centerY} C ${center + 40} ${centerY - 10}, ${center + 60} ${centerY + 10}, ${width - 20} ${centerY}`;

  return (
    <Svg
      width={width}
      height={height}
      opacity={opacity}
      viewBox={`0 0 ${width} ${height}`}
    >
      <G>
        {/* Left Decorative Line */}
        <Path d={leftPath} fill="none" stroke={color} strokeWidth="1.5" />
        {/* Right Decorative Line */}
        <Path d={rightPath} fill="none" stroke={color} strokeWidth="1.5" />

        {/* End Dots */}
        <Circle cx={20} cy={centerY} r={2} fill={color} />
        <Circle cx={width - 20} cy={centerY} r={2} fill={color} />

        {/* Center Diamond */}
        <Polygon
          points={`
            ${center},${centerY - diamondSize}
            ${center + diamondSize},${centerY}
            ${center},${centerY + diamondSize}
            ${center - diamondSize},${centerY}
          `.trim()}
          fill={color}
        />

        {/* Outer Ring around Diamond */}
        <Polygon
          points={`
            ${center},${centerY - diamondSize - 3}
            ${center + diamondSize + 3},${centerY}
            ${center},${centerY + diamondSize + 3}
            ${center - diamondSize - 3},${centerY}
          `.trim()}
          fill="none"
          stroke={color}
          strokeWidth="1"
        />
      </G>
    </Svg>
  );
}
