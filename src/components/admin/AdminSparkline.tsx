type AdminSparklineProps = {
  data: number[];
  className?: string;
  strokeClassName?: string;
};

function buildPoints(data: number[], width: number, height: number) {
  if (data.length < 2) return "";

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
}

export function AdminSparkline({
  data,
  className = "text-emerald-400",
  strokeClassName = "stroke-emerald-400/80",
}: AdminSparklineProps) {
  const width = 120;
  const height = 36;
  const points = buildPoints(data, width, height);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-9 w-full max-w-[140px] ${className}`}
      aria-hidden
    >
      <polyline
        fill="none"
        className={strokeClassName}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polyline
        fill="none"
        className="stroke-emerald-400/15"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
