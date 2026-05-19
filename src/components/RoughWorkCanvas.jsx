import { useEffect, useRef, useState } from 'react';

export default function RoughWorkCanvas({ open, onClose }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const [tool, setTool] = useState('pen');
  const [size, setSize] = useState(5);

  useEffect(() => {
    if (!open) return undefined;

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const image = canvas.toDataURL();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);
      const context = canvas.getContext('2d');
      context.scale(ratio, ratio);
      const img = new Image();
      img.onload = () => context.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = image;
    };

    const id = window.setTimeout(resize, 30);
    window.addEventListener('resize', resize);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', resize);
    };
  }, [open]);

  if (!open) return null;

  const getPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      pressure: event.pressure && event.pressure > 0 ? event.pressure : 0.65,
    };
  };

  const draw = (point) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const last = lastPointRef.current || point;
    context.save();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = size * 3;
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = '#111827';
      context.lineWidth = Math.max(2, size * point.pressure);
    }
    context.beginPath();
    context.moveTo(last.x, last.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    context.restore();
    lastPointRef.current = point;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div>
          <h2 className="font-extrabold">Rough Work</h2>
          <p className="text-xs text-slate-500">Mouse, touch, and stylus supported.</p>
        </div>
        <button type="button" className="btn h-10 w-10 px-0" onClick={onClose} aria-label="Close rough work">
          X
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <button type="button" className={`btn ${tool === 'pen' ? 'btn-primary' : ''}`} onClick={() => setTool('pen')}>
          Pen
        </button>
        <button type="button" className={`btn ${tool === 'eraser' ? 'btn-primary' : ''}`} onClick={() => setTool('eraser')}>
          Eraser
        </button>
        <label className="flex items-center gap-2 text-sm font-bold">
          Size
          <input type="range" min="2" max="18" value={size} onChange={(event) => setSize(Number(event.target.value))} />
        </label>
        <button type="button" className="btn ml-auto" onClick={clear}>
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="min-h-0 flex-1 touch-none bg-white"
        aria-label="Rough work drawing canvas"
        onPointerDown={(event) => {
          event.preventDefault();
          drawingRef.current = true;
          lastPointRef.current = getPoint(event);
          event.currentTarget.setPointerCapture?.(event.pointerId);
          draw(lastPointRef.current);
        }}
        onPointerMove={(event) => {
          if (!drawingRef.current) return;
          event.preventDefault();
          const events = event.getCoalescedEvents ? event.getCoalescedEvents() : [event];
          events.forEach((item) => draw(getPoint(item)));
        }}
        onPointerUp={(event) => {
          drawingRef.current = false;
          lastPointRef.current = null;
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        }}
        onPointerCancel={() => {
          drawingRef.current = false;
          lastPointRef.current = null;
        }}
      />
    </aside>
  );
}
