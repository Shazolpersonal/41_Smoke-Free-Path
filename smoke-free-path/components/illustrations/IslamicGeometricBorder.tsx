import React from "react";
import { Svg, G, Polygon, Circle, Line, Path } from "react-native-svg";
import theme from "../../theme";

interface IslamicGeometricBorderProps {
  width: number;
  height?: number;
  color?: string;
  opacity?: number;
  pattern?: "line" | "diamonds" | "dots";
}

export default function IslamicGeometricBorder({
  width,
  height = 40,
  color = theme.colors.secondary,
  opacity = 0.6,
  pattern = "diamonds",
}: IslamicGeometricBorderProps) {
  const centerY = height / 2;

  const renderPattern = () => {
    switch (pattern) {
      case "diamonds": {
        const diamondSize = 8;
        const spacing = 24;
        const count = Math.floor(width / spacing);
        const startX = (width - (count - 1) * spacing) / 2;

        return Array.from({ length: count }).map((_, i) => {
          const cx = startX + i * spacing;
          // Points for a rhombus/diamond
          const points = `
            ${cx},${centerY - diamondSize}
            ${cx + diamondSize},${centerY}
            ${cx},${centerY + diamondSize}
            ${cx - diamondSize},${centerY}
          `;
          return (
            <Polygon
              key={`diamond-${i}`}
              points={points.trim()}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
            />
          );
        });
      }

      case "line": {
        const diamondSize = 6;
        const cx = width / 2;
        const points = `
          ${cx},${centerY - diamondSize}
          ${cx + diamondSize},${centerY}
          ${cx},${centerY + diamondSize}
          ${cx - diamondSize},${centerY}
        `;
        return (
          <G>
            {/* Top Line */}
            <Line
              x1={0}
              y1={centerY - 2}
              x2={cx - diamondSize - 4}
              y2={centerY - 2}
              stroke={color}
              strokeWidth="1"
              opacity={0.5}
            />
            <Line
              x1={cx + diamondSize + 4}
              y1={centerY - 2}
              x2={width}
              y2={centerY - 2}
              stroke={color}
              strokeWidth="1"
              opacity={0.5}
            />
            {/* Bottom Line */}
            <Line
              x1={0}
              y1={centerY + 2}
              x2={cx - diamondSize - 4}
              y2={centerY + 2}
              stroke={color}
              strokeWidth="1"
              opacity={0.5}
            />
            <Line
              x1={cx + diamondSize + 4}
              y1={centerY + 2}
              x2={width}
              y2={centerY + 2}
              stroke={color}
              strokeWidth="1"
              opacity={0.5}
            />

            {/* Center Diamond */}
            <Polygon points={points.trim()} fill={color} opacity={0.8} />
            {/* Outer Diamond */}
            <Polygon
              points={`
                ${cx},${centerY - diamondSize - 4}
                ${cx + diamondSize + 4},${centerY}
                ${cx},${centerY + diamondSize + 4}
                ${cx - diamondSize - 4},${centerY}
              `.trim()}
              fill="none"
              stroke={color}
              strokeWidth="1"
            />
          </G>
        );
      }

      case "dots": {
        const dotSize = 2;
        const spacing = 16;
        const count = Math.floor(width / spacing);
        const startX = (width - (count - 1) * spacing) / 2;

        return (
          <G>
            <Line
              x1={0}
              y1={centerY}
              x2={width}
              y2={centerY}
              stroke={color}
              strokeWidth="0.5"
              opacity={0.3}
            />
            {Array.from({ length: count }).map((_, i) => (
              <Circle
                key={`dot-${i}`}
                cx={startX + i * spacing}
                cy={centerY}
                r={dotSize}
                fill={color}
              />
            ))}
          </G>
        );
      }
    }
  };

  return (
    <Svg
      width={width}
      height={height}
      opacity={opacity}
      viewBox={`0 0 ${width} ${height}`}
    >
      {renderPattern()}
    </Svg>
  );
}
