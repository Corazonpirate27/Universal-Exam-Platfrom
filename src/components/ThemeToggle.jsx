export default function ThemeToggle({ theme, setTheme, compact = false }) {
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className="btn h-9 min-h-9"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
      title={`Switch to ${dark ? 'light' : 'dark'} theme`}
    >
      <span aria-hidden="true">{dark ? 'Dark' : 'Light'}</span>
      {!compact && <span>{dark ? 'Dark' : 'Light'}</span>}
    </button>
  );
}
