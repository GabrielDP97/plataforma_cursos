interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ percentage, showLabel = true, className = '' }: ProgressBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-300">Progreso del curso</span>
          <span className="font-mono text-violet-400">{Math.round(clampedPercentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 transition-all duration-500 ease-out"
          style={{ width: `${clampedPercentage}%` }}
          role="progressbar"
          aria-valuenow={clampedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
