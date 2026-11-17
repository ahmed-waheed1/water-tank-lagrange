// A(x) = x² + 128/x  (the square-base case y = x, V = 32), with its minimum at x = 4, A = 48.

const W = 640;
const H = 340;
const PAD = { l: 52, r: 20, t: 20, b: 44 };
const X0 = 1.5;
const X1 = 8;
const Y0 = 40;
const Y1 = 90;

const A = (x: number) => x * x + 128 / x;
const sx = (x: number) => PAD.l + ((x - X0) / (X1 - X0)) * (W - PAD.l - PAD.r);
const sy = (y: number) => H - PAD.b - ((y - Y0) / (Y1 - Y0)) * (H - PAD.t - PAD.b);

export default function AreaChart() {
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const x = X0 + ((X1 - X0) * i) / 160;
    pts.push(`${sx(x).toFixed(1)},${sy(A(x)).toFixed(1)}`);
  }
  const xTicks = [2, 3, 4, 5, 6, 7, 8];
  const yTicks = [40, 50, 60, 70, 80, 90];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-labelledby="chart-title chart-desc"
    >
      <title id="chart-title">Steel area A(x) = x² + 128/x</title>
      <desc id="chart-desc">
        The curve falls from about 88 m² at x = 1.5 to a minimum of 48 m² at x = 4, then rises to 80 m² at x = 8.
      </desc>

      {yTicks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={sy(t)} y2={sy(t)} stroke="#E8EEF8" />
          <text x={PAD.l - 10} y={sy(t)} dy="0.32em" textAnchor="end" className="fill-[#5b6b86] font-mono text-[12px]">
            {t}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <text key={t} x={sx(t)} y={H - PAD.b + 20} textAnchor="middle" className="fill-[#5b6b86] font-mono text-[12px]">
          {t}
        </text>
      ))}
      <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="#9aa8bf" />
      <text x={(W + PAD.l) / 2} y={H - 6} textAnchor="middle" className="fill-[#12357A] text-[12px] font-semibold">
        base side x (m)
      </text>
      <text
        transform={`translate(14 ${(H - PAD.b + PAD.t) / 2}) rotate(-90)`}
        textAnchor="middle"
        className="fill-[#12357A] text-[12px] font-semibold"
      >
        steel area A (m²)
      </text>

      <line x1={sx(4)} x2={sx(4)} y1={sy(48)} y2={H - PAD.b} stroke="#C2410C" strokeDasharray="4 4" />
      <line x1={PAD.l} x2={sx(4)} y1={sy(48)} y2={sy(48)} stroke="#C2410C" strokeDasharray="4 4" />
      <polyline points={pts.join(" ")} fill="none" stroke="#2F7BEA" strokeWidth={3} strokeLinejoin="round" />
      <circle cx={sx(4)} cy={sy(48)} r={7} fill="#F59A4A" stroke="#fff" strokeWidth={2.5} />
      <g transform={`translate(${sx(4) + 14} ${sy(48) - 18})`}>
        <rect width={150} height={26} rx={6} fill="#0F2350" />
        <text x={10} y={17} className="fill-white font-mono text-[12px]">
          min: x = 4, A = 48
        </text>
      </g>
    </svg>
  );
}
