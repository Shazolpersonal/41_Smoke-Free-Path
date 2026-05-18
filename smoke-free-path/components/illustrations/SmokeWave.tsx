import React from "react";
import Svg, { Path } from "react-native-svg";

interface SmokeWaveProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
}

const SmokeWave: React.FC<SmokeWaveProps> = ({
  width = 280,
  height = 120,
  color = "#3D5070",
  opacity = 0.5,
}) => {
  const w = width;
  const h = height;

  const wave1 = `M 0 ${h * 0.5} C ${w * 0.2} ${h * 0.2} ${w * 0.4} ${h * 0.8} ${w * 0.6} ${h * 0.4} S ${w * 0.8} ${h * 0.2} ${w} ${h * 0.5}`;
  const wave2 = `M 0 ${h * 0.6} C ${w * 0.2} ${h * 0.3} ${w * 0.4} ${h * 0.9} ${w * 0.6} ${h * 0.5} S ${w * 0.8} ${h * 0.3} ${w} ${h * 0.6}`;
  const wave3 = `M 0 ${h * 0.4} C ${w * 0.2} ${h * 0.1} ${w * 0.4} ${h * 0.7} ${w * 0.6} ${h * 0.3} S ${w * 0.8} ${h * 0.1} ${w} ${h * 0.4}`;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Path
        d={wave1}
        stroke={color}
        strokeWidth={2}
        fill="none"
        opacity={opacity}
      />
      <Path
        d={wave2}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        opacity={opacity * 0.7}
      />
      <Path
        d={wave3}
        stroke={color}
        strokeWidth={1}
        fill="none"
        opacity={opacity * 0.4}
      />
    </Svg>
  );
};

export default SmokeWave;
