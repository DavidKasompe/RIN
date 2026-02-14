interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export default function CircularProgress({
  value,
  size = 120,
  strokeWidth = 12,
  color = 'var(--color-cta)',
  label = '',
  showPercentage = true,
  animated = true,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Determine color based on value
  const getColor = () => {
    if (color !== 'var(--color-cta)') return color;
    if (value >= 70) return '#EF4444'; // Red for high risk
    if (value >= 40) return '#F59E0B'; // Orange for medium
    return '#10B981'; // Green for low risk
  };

  const progressColor = getColor();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? offset : circumference}
            className={animated ? 'transition-all duration-1000 ease-out' : ''}
            style={{
              strokeDashoffset: animated ? offset : circumference,
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <span
              className="font-bold text-[var(--color-text)] leading-none"
              style={{ fontSize: size <= 80 ? size * 0.24 : size * 0.22 }}
            >
              {Math.round(value)}%
            </span>
          )}
          {label && (
            <span
              className="text-[var(--color-text-light)] leading-none"
              style={{
                fontSize: size <= 80 ? size * 0.14 : size * 0.1,
                marginTop: size <= 80 ? 1 : 4,
              }}
            >
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
