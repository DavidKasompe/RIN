'use client';

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface TrendChartProps {
  data: DataPoint[];
  title?: string;
  color?: string;
  height?: number;
}

export default function TrendChart({ 
  data, 
  title = 'Trend Over Time',
  color = 'var(--color-chart-blue)',
  height = 200 
}: TrendChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-[var(--color-text-light)] py-8">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  // Calculate SVG points
  const padding = 20;
  const width = 100; // percentage
  const chartHeight = height - padding * 2;
  const chartWidth = 100 - padding;

  const points = data.map((point, index) => {
    const x = (padding + (index / (data.length - 1 || 1)) * chartWidth);
    const y = padding + ((maxValue - point.value) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  // Create area path
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">{title}</h3>
      )}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={percent}
              x2="100"
              y2={percent}
              stroke="var(--color-border)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}

          {/* Area fill */}
          <polygon
            points={areaPoints}
            fill={color}
            opacity="0.1"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = (padding + (index / (data.length - 1 || 1)) * chartWidth);
            const y = padding + ((maxValue - point.value) / range) * chartHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill={color}
                className="hover:r-2 transition-all cursor-pointer"
              >
                <title>{`${point.label || point.date}: ${point.value}`}</title>
              </circle>
            );
          })}
        </svg>

        {/* Date labels */}
        <div className="flex justify-between mt-2 text-xs text-[var(--color-text-light)]">
          <span>{data[0]?.date}</span>
          <span>{data[Math.floor(data.length / 2)]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}
