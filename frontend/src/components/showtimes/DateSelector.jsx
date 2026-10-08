import { formatDateLabel } from '../../utils/formatters.js';

export default function DateSelector({ dates, activeDate, onSelect }) {
  if (!dates.length) return null;

  return (
    <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
      {dates.map((date, index) => {
        const active = date === activeDate;
        return (
          <button
            key={date}
            onClick={() => onSelect(date)}
            className={`flex h-[88px] w-[88px] flex-none flex-col items-center justify-center rounded-xl border text-center ${
              active ? 'border-gold bg-gold text-black shadow-gold' : 'border-line bg-surface text-slate-100 hover:border-slate-400'
            }`}
          >
            <span className="text-base font-bold uppercase">{index === 0 ? 'HOY' : formatDateLabel(date).split(' ')[0]}</span>
            <span className="mt-1 text-xs font-medium">{formatDateLabel(date)}</span>
          </button>
        );
      })}
    </div>
  );
}
