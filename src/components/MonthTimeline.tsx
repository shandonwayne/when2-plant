import MonthChip from './MonthChip';

interface MonthTimelineProps {
  months: number[];
  label?: string;
}

export default function MonthTimeline({ months, label }: MonthTimelineProps) {
  if (months.length === 0) return null;

  const sorted = [...months].sort((a, b) => a - b);

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-widest text-earth-500 shrink-0 w-16">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1 flex-wrap">
        {sorted.map((m) => (
          <MonthChip key={m} month={m} size="sm" />
        ))}
      </div>
    </div>
  );
}
