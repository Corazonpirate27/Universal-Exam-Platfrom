export default function ThemeToggle({ theme, setTheme, compact = false, tone = 'neutral' }) {
  const dark = theme === 'dark';
  const className =
    tone === 'red'
      ? 'acrobat-tool h-9 min-h-9 bg-white/15 text-white hover:bg-white hover:text-[#b30b00]'
      : 'acrobat-tool h-9 min-h-9';
  return (
    <button
      type="button"
      className={className}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
      title={`Switch to ${dark ? 'light' : 'dark'} theme`}
    >
      <span aria-hidden="true">{dark ? '◐' : '○'}</span>
      {!compact && <span>{dark ? 'Dark' : 'Light'}</span>}
    </button>
  );
}
