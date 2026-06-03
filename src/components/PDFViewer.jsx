import { memo, useEffect, useMemo, useState } from 'react';

function PDFViewer({ file }) {
  const [openOnMobile, setOpenOnMobile] = useState(Boolean(file));
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const embeddedUrl = useMemo(() => (url ? `${url}#toolbar=0&navpanes=0&pagemode=none&view=FitH` : null), [url]);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  useEffect(() => {
    setOpenOnMobile(Boolean(file));
  }, [file]);

  const emptyState = (
    <div className="grid flex-1 place-items-center p-6 text-center text-sm text-slate-500">
      <div className="w-full max-w-sm rounded bg-white p-8 shadow-sm ring-1 ring-slate-300 dark:bg-slate-800 dark:ring-slate-700">
        <div className="mx-auto mb-4 grid h-20 w-16 place-items-center rounded-sm border border-slate-300 bg-slate-50 text-3xl font-black text-[#b30b00] shadow-sm dark:border-slate-600 dark:bg-slate-900">
          PDF
        </div>
        <p className="font-bold text-slate-700 dark:text-slate-200">No PDF attached</p>
        <p className="mt-1 text-xs">Use uploaded or original material as the source paper.</p>
      </div>
    </div>
  );

  return (
    <section className="border-b border-[#b6b6b6] bg-[#cfcfcf] dark:border-slate-700 dark:bg-[#171b20] lg:flex lg:w-[54%] lg:flex-col lg:border-b-0">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[#b6b6b6] bg-[#efefef] px-3 py-2 dark:border-slate-700 dark:bg-[#252a30] sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-[#b30b00] text-xs font-black text-white">PDF</span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Question Paper</p>
            <h2 className="truncate text-sm font-bold">{file ? file.name : 'Untitled document'}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {url && (
            <a className="acrobat-tool h-9 min-h-9 px-3" href={url} target="_blank" rel="noreferrer">
              <span aria-hidden="true">↗</span>
              Open
            </a>
          )}
          <button
            type="button"
            className="acrobat-tool h-9 min-h-9 px-3 lg:hidden"
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
          <div className="h-[58vh] p-3 lg:h-full lg:p-5">
            <iframe
              title="Uploaded question paper"
              className="mx-auto h-full w-full max-w-5xl bg-white shadow-xl ring-1 ring-black/20"
              src={embeddedUrl}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(PDFViewer);
