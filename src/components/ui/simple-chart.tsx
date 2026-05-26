import React from "react";

type Point = { label: string; value: number };

export function LineChart({ data, width = 600, height = 180, stroke = "#6366f1", fill = "#eef2ff", className = "" }: { data: Point[]; width?: number; height?: number; stroke?: string; fill?: string; className?: string }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const min = Math.min(...data.map((d) => d.value)) || 0;
  const pad = 24;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const stepX = innerW / Math.max(1, data.length - 1);
  const scaleY = (v: number) => pad + innerH - ((v - min) / (max - min || 1)) * innerH;

  const points = data.map((d, i) => `${pad + i * stepX},${scaleY(d.value)}`).join(" ");

  return (
    <svg width={width} height={height} className={className} aria-label="line chart">
      <rect x={pad} y={pad} width={innerW} height={innerH} rx={12} fill={fill} />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={2} />
      {data.map((d, i) => (
        <circle key={i} cx={pad + i * stepX} cy={scaleY(d.value)} r={3} fill={stroke} />
      ))}
    </svg>
  );
}

export function BarChart({ data, width = 600, height = 180, color = "#8b5cf6", className = "" }: { data: Point[]; width?: number; height?: number; color?: string; className?: string }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const pad = 24;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const barW = innerW / data.length - 8;
  return (
    <svg width={width} height={height} className={className} aria-label="bar chart">
      <rect x={pad} y={pad} width={innerW} height={innerH} rx={12} fill="#f1f5f9" />
      {data.map((d, i) => {
        const h = (d.value / (max || 1)) * innerH;
        const x = pad + i * (barW + 8);
        const y = pad + innerH - h;
        return <rect key={i} x={x} y={y} width={barW} height={h} rx={6} fill={color} />;
      })}
    </svg>
  );
}
