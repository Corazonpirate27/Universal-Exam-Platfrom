import { useEffect, useMemo, useState } from 'react';

export default function PDFViewer({ file }) {
  const [openOnMobile, setOpenOnMobile] = useState(Boolean(file));
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  useEffect(() => {
    setOpenOnMobile(Boolean(file));
  }, [file]);

  const emptyState = (
    <div className="grid flex-1 place-items-center p-6 text-center text-sm text-slate-500">
      <div>
        <p className="font-bold text-slate-700 dark:text-slate-200">No PDF attached</p>
        <p className="mt-1">Use uploaded or original material as the source paper.</p>
      </div>
    </div>
  );

  return (
    <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:w-[46%] lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex min-h-12 items-center justify-between gap-3 px-4 py-2">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Document</p>
          <h2 className="truncate text-sm font-extrabold">{file ? file.name : 'Question Paper'}</h2>
        </div>
        <div className="flex items-center gap-2">
          {url && (
            <a className="btn h-9 min-h-9 px-3" href={url} target="_blank" rel="noreferrer">
              Open
            </a>
          )}
          <button
            type="button"
            className="btn h-9 min-h-9 px-3 lg:hidden"
            onClick={() => setOpenOnMobile((value) => !value)}
            aria-expanded={openOnMobile}
          >
            {openOnMobile ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className={`${openOnMobile ? 'block' : 'hidden'} lg:block lg:min-h-0 lg:flex-1`}>
        {!file || !url ? (
          emptyState
        ) : (
          <iframe
            title="Uploaded question paper"
            className="h-[58vh] w-full bg-white lg:h-full"
            src={url}
          />
        )}
      </div>
    </section>
  );
}
