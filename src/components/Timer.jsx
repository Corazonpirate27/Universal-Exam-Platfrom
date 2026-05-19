import { formatDuration } from '../utils/exam';

export default function Timer({ secondsLeft }) {
  const urgent = secondsLeft <= 300;
  return (
    <div
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 font-mono text-sm font-extrabold ${
        urgent
          ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
          : 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-slate-100'
      }`}
      aria-live="polite"
      aria-label={`Time remaining ${formatDuration(secondsLeft)}`}
    >
      <span aria-hidden="true">Time</span>
      <span>{formatDuration(secondsLeft)}</span>
    </div>
  );
}
