const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const MONTH_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-sky-800', text: 'text-sky-100' },
  2: { bg: 'bg-sky-700', text: 'text-sky-100' },
  3: { bg: 'bg-emerald-800', text: 'text-emerald-100' },
  4: { bg: 'bg-[#3A5216]', text: 'text-[#C8E68A]' },
  5: { bg: 'bg-[#4A6118]', text: 'text-[#D4EE8A]' },
  6: { bg: 'bg-[#6B6B14]', text: 'text-[#E8E87A]' },
  7: { bg: 'bg-[#8B6518]', text: 'text-[#F5D478]' },
  8: { bg: 'bg-[#A04828]', text: 'text-[#FACBAE]' },
  9: { bg: 'bg-[#A03048]', text: 'text-[#F8B8C8]' },
  10: { bg: 'bg-[#8A4A68]', text: 'text-[#E8C0D4]' },
  11: { bg: 'bg-[#5A7A88]', text: 'text-[#C8E0EA]' },
  12: { bg: 'bg-slate-700', text: 'text-slate-200' },
};

interface MonthChipProps {
  month: number;
  size?: 'sm' | 'md';
}

export default function MonthChip({ month, size = 'sm' }: MonthChipProps) {
  const colors = MONTH_COLORS[month] || MONTH_COLORS[1];
  const label = MONTH_LABELS[month - 1] || '';

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wide select-none
        ${colors.bg} ${colors.text}
        ${size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1 text-xs'}
        transition-transform duration-150 hover:scale-105
      `}
    >
      {label}
    </span>
  );
}
