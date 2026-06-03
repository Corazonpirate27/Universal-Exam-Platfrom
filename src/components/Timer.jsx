import { formatDuration } from '../utils/exam';

export default function Timer({ secondsLeft }) {
  const urgent = secondsLeft <= 300;
  return (
    <div
      className={`inline-flex min-h-9 items-center gap-1.5 rounded px-3 font-mono text-sm font-extrabold shadow-sm ${
        urgent
          ? 'bg-white text-[#b30b00]'
          : 'bg-white text-slate-950'
      }`}
      aria-live="polite"
      aria-label={`Time remaining ${formatDuration(secondsLeft)}`}
    >
      <span aria-hidden="true">Time</span>
      <span>{formatDuration(secondsLeft)}</span>
    </div>
  );
}
