interface RadarDataPoint {
  dimension: string;
  value: number;
  maxValue?: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  color?: string;
  title?: string;
}

export default function RadarChart({ 
  data, 
  size = 300,
  color = 'var(--color-chart-blue)',
  title = 'Student Assessment'
}: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 60;
  const levels = 5;

  // Calculate points for each dimension
  const angleStep = (2 * Math.PI) / data.length;
  
  const getPoint = (value: number, index: number, maxVal: number = 100) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / maxVal) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const getAxisPoint = (index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };

  // Create path string for data
  const dataPath = data.map((point, index) => {
    const maxVal = point.maxValue || 100;
    const p = getPoint(point.value, index, maxVal);
    return `${index === 0 ? 'M' : 'L'} ${p.x},${p.y}`;
  }).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center w-full">
      {title && (
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">{title}</h3>
      )}
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id="radarGradient">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Grid circles */}
        {Array.from({ length: levels }).map((_, i) => (
          <circle
            key={`grid-${i}`}
            cx={center}
            cy={center}
            r={((i + 1) / levels) * radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {data.map((_, index) => {
          const point = getAxisPoint(index);
          return (
            <line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data area */}
        <path
          d={dataPath}
          fill="url(#radarGradient)"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const maxVal = point.maxValue || 100;
          const p = getPoint(point.value, index, maxVal);
          return (
            <circle
              key={`point-${index}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill={color}
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{`${point.dimension}: ${point.value}${point.maxValue !== 100 ? `/${point.maxValue}` : '%'}`}</title>
            </circle>
          );
        })}

        {/* Labels */}
        {data.map((point, index) => {
          const axisPoint = getAxisPoint(index);
          const angle = angleStep * index - Math.PI / 2;
          
          // Position labels outside the chart
          const labelDistance = radius + 30;
          const labelX = center + labelDistance * Math.cos(angle);
          const labelY = center + labelDistance * Math.sin(angle);
          
          return (
            <text
              key={`label-${index}`}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium fill-[var(--color-text)]"
            >
              {point.dimension}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--color-text-light)]">
        {data.map((point, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span>{point.dimension}: {point.value}{point.maxValue !==  100 ? `/${point.maxValue}` : '%'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
