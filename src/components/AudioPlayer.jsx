import { useEffect, useRef, useState } from 'react';

const formatTime = (value) => {
  if (!Number.isFinite(value)) return '0:00';
  const safe = Math.max(0, Math.floor(value || 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
};

export default function AudioPlayer({ files }) {
  const audioRef = useRef(null);
  const resumeAfterSwitchRef = useRef(false);
  const [tracks, setTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError('');
    try {
      await audio.play();
    } catch (err) {
      setPlaying(false);
      setError(err?.name === 'NotAllowedError' ? 'Click Play again to start audio.' : 'Audio could not be played.');
    }
  };

  useEffect(() => {
    const nextTracks = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setTracks(nextTracks);
    setCurrentIndex(0);
    setPlaying(false);
    setTime(0);
    setDuration(0);
    setError('');

    return () => nextTracks.forEach((track) => URL.revokeObjectURL(track.url));
  }, [files]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
  }, [speed, currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    const track = tracks[currentIndex];
    if (!audio || !track) return;
    audio.pause();
    audio.load();
    setPlaying(false);
    setTime(0);
    setDuration(0);
    setError('');
    if (resumeAfterSwitchRef.current) {
      resumeAfterSwitchRef.current = false;
      play();
    }
  }, [tracks, currentIndex]);

  if (!files.length) return null;

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await play();
    } else {
      audio.pause();
    }
  };

  const switchTrack = async (index) => {
    const audio = audioRef.current;
    resumeAfterSwitchRef.current = Boolean(audio && !audio.paused);
    setCurrentIndex(index);
  };

  const currentTrack = tracks[currentIndex];

  return (
    <div className="flex max-w-full flex-wrap items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
      <audio
        ref={audioRef}
        src={currentTrack?.url || ''}
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          setError('');
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onError={() => {
          setPlaying(false);
          setError('Audio file failed to load. Try another MP3 or browser-supported audio file.');
        }}
      />

      {tracks.length > 1 && (
        <>
          <label className="sr-only" htmlFor="audioTrack">
            Audio track
          </label>
          <select
            id="audioTrack"
            className="field h-9 w-32 py-1 text-xs"
            value={currentIndex}
            onChange={(event) => switchTrack(Number(event.target.value))}
          >
            {tracks.map((track, index) => (
              <option value={index} key={`${track.name}-${track.url}`}>
                Track {index + 1}
              </option>
            ))}
          </select>
        </>
      )}

      <button type="button" className="btn h-9 min-h-9 px-3" onClick={toggle} aria-label={playing ? 'Pause audio' : 'Play audio'}>
        {playing ? 'Pause' : 'Play'}
      </button>
      <span className="min-w-24 text-center font-mono text-xs font-bold">
        {formatTime(time)} / {formatTime(duration)}
      </span>
      <label className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
        Speed
        <select className="field h-9 w-20 py-1 text-xs" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => (
            <option key={value} value={value}>
              {value}x
            </option>
          ))}
        </select>
      </label>
      <span className="max-w-36 truncate text-xs font-semibold text-slate-500" title={currentTrack?.name}>
        {currentTrack?.name}
      </span>
      {error && <p className="basis-full text-xs font-bold text-red-600 dark:text-red-300">{error}</p>}
    </div>
  );
}
