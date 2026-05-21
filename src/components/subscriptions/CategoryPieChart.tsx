import { formatCurrency } from '../../utils/calculations';

interface Slice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  slices: Slice[];
  defaultCurrency: string;
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  // Évite le bug du cercle complet (start === end après 360°)
  const safeEnd = end - start >= 359.999 ? start + 359.999 : end;
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, safeEnd);
  const large = safeEnd - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)} Z`;
}

export default function CategoryPieChart({ slices, defaultCurrency }: Props) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0 || slices.length === 0) return null;

  const cx = 100, cy = 100, r = 88;
  let angle = 0;

  const paths = slices.map(slice => {
    const span = (slice.value / total) * 360;
    const path = arcPath(cx, cy, r, angle, angle + span);
    angle += span;
    return { ...slice, path, pct: (slice.value / total) * 100 };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Répartition mensuelle</h3>
      <div className="flex items-center gap-6 flex-wrap justify-center sm:justify-start">

        {/* Camembert SVG */}
        <svg viewBox="0 0 200 200" className="w-36 h-36 flex-shrink-0 drop-shadow-sm">
          {paths.map((s, i) => (
            <path
              key={i}
              d={s.path}
              fill={s.color}
              stroke="white"
              strokeWidth="2"
            />
          ))}
          {/* Cercle central pour effet donut optionnel — retirez ces 2 lignes si vous préférez un camembert plein */}
          <circle cx={cx} cy={cy} r={38} fill="white" />
          <text x={cx} y={cy - 6} textAnchor="middle" className="text-xs" fontSize="10" fill="#6b7280">Total</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#111827" fontWeight="600">
            {formatCurrency(total, defaultCurrency)}
          </text>
        </svg>

        {/* Légende */}
        <div className="flex-1 min-w-0 space-y-2">
          {paths.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="flex-1 text-gray-600 truncate">{s.label}</span>
              <span className="text-gray-400 text-xs w-8 text-right">{s.pct.toFixed(0)}%</span>
              <span className="font-medium text-gray-900 text-xs w-20 text-right">
                {formatCurrency(s.value, defaultCurrency)}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
