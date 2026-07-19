import React from "react";

type Point = { label: string; value: number };

type ChartProps = {
  data: Point[];
  width?: number;
  height?: number;
  className?: string;
  emptyLabel?: string;
};

function hasValues(data: Point[]) {
  return data.some((d) => d.value > 0);
}

function truncateLabel(label: string, max = 8) {
  return label.length > max ? `${label.slice(0, max)}…` : label;
}

export function LineChart({
  data,
  width = 600,
  height = 240,
  stroke = "#6366f1",
  fill = "#eef2ff",
  className = "",
  emptyLabel = "No data for this period",
}: ChartProps & { stroke?: string; fill?: string }) {
  if (!hasValues(data)) {
    return (
      <div
        className={`flex h-[${height}px] min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 ${className}`}
        style={{ minHeight: height }}
      >
        {emptyLabel}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const padLeft = 40;
  const padBottom = 52;
  const padTop = 16;
  const padRight = 16;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;
  const stepX = innerW / Math.max(1, data.length - 1);
  const scaleY = (v: number) => padTop + innerH - (v / max) * innerH;
  const points = data.map((d, i) => `${padLeft + i * stepX},${scaleY(d.value)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className}`}
      role="img"
      aria-label="Line chart"
    >
      <rect x={padLeft} y={padTop} width={innerW} height={innerH} rx={12} fill={fill} />
      {[0, 0.5, 1].map((tick) => {
        const y = padTop + innerH * (1 - tick);
        const value = Math.round(max * tick);
        return (
          <g key={tick}>
            <line x1={padLeft} y1={y} x2={padLeft + innerW} y2={y} stroke="#e2e8f0" strokeWidth={1} />
            <text x={padLeft - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
              {value}
            </text>
          </g>
        );
      })}
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={2.5} />
      {data.map((d, i) => (
        <g key={`${d.label}-${i}`}>
          <circle cx={padLeft + i * stepX} cy={scaleY(d.value)} r={4} fill={stroke} />
          <title>{`${d.label}: ${d.value}`}</title>
          <text
            x={padLeft + i * stepX}
            y={height - 14}
            textAnchor="middle"
            className="fill-slate-500 text-[10px]"
          >
            {truncateLabel(d.label, data.length > 10 ? 6 : 10)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function BarChart({
  data,
  width = 600,
  height = 240,
  color = "#8b5cf6",
  className = "",
  emptyLabel = "No data yet",
}: ChartProps & { color?: string }) {
  if (!hasValues(data)) {
    return (
      <div
        className={`flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 ${className}`}
        style={{ minHeight: height }}
      >
        {emptyLabel}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const padLeft = 40;
  const padBottom = 52;
  const padTop = 16;
  const padRight = 16;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;
  const gap = 8;
  const barW = Math.max(12, (innerW - gap * (data.length - 1)) / data.length);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className}`}
      role="img"
      aria-label="Bar chart"
    >
      <rect x={padLeft} y={padTop} width={innerW} height={innerH} rx={12} fill="#f8fafc" />
      {[0, 0.5, 1].map((tick) => {
        const y = padTop + innerH * (1 - tick);
        const value = Math.round(max * tick);
        return (
          <g key={tick}>
            <line x1={padLeft} y1={y} x2={padLeft + innerW} y2={y} stroke="#e2e8f0" strokeWidth={1} />
            <text x={padLeft - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
              {value}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = padLeft + i * (barW + gap);
        const y = padTop + innerH - h;
        return (
          <g key={`${d.label}-${i}`}>
            <rect x={x} y={y} width={barW} height={Math.max(h, 2)} rx={6} fill={color} />
            <title>{`${d.label}: ${d.value}`}</title>
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" className="fill-slate-600 text-[10px] font-semibold">
                {d.value}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={height - 14}
              textAnchor="middle"
              className="fill-slate-500 text-[10px]"
            >
              {truncateLabel(d.label)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function HorizontalBarChart({
  data,
  className = "",
  color = "#6C5DD3",
  emptyLabel = "No data yet",
}: {
  data: Point[];
  className?: string;
  color?: string;
  emptyLabel?: string;
}) {
  if (!hasValues(data)) {
    return (
      <div className={`rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 ${className}`}>
        {emptyLabel}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={`space-y-3 ${className}`}>
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className="text-slate-500">{item.value}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div
              className="h-2.5 rounded-full"
              style={{ width: `${Math.round((item.value / max) * 100)}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
