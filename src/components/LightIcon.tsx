import type { LightRequirement } from '../types';

interface LightIconProps {
  requirement: LightRequirement;
  size?: number;
}

export default function LightIcon({ requirement, size = 20 }: LightIconProps) {
  const r = size / 2;
  const cx = r;
  const cy = r;
  const innerR = r - 2;

  if (requirement === 'shade') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Shade">
        <circle cx={cx} cy={cy} r={innerR} fill="#6B7280" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#4B5563" strokeWidth="1.5" />
      </svg>
    );
  }

  if (requirement === 'partial_sun') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Partial Sun">
        <defs>
          <clipPath id={`half-${size}`}>
            <rect x={cx} y="0" width={r} height={size} />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cy} r={innerR} fill="#6B7280" />
        <circle cx={cx} cy={cy} r={innerR} fill="#FBBF24" clipPath={`url(#half-${size})`} />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#4B5563" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Full Sun">
      <circle cx={cx} cy={cy} r={innerR} fill="#FBBF24" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#D97706" strokeWidth="1.5" />
    </svg>
  );
}
