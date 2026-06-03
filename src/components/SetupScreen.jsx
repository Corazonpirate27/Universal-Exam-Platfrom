import { examTemplates } from '../data/examTemplates';
import ThemeToggle from './ThemeToggle';

export default function SetupScreen({
  setup,
  setSetup,
  theme,
  setTheme,
  resumeSession,
  onResume,
  onStart,
  pdfFile,
  setPdfFile,
  audioFiles,
  setAudioFiles,
}) {
  const selectedTemplate = examTemplates[setup.templateId];

  const update = (field, value) => {
    const next = { ...setup, [field]: value };
    if (field === 'templateId') next.examTitle = examTemplates[value].title;
    setSetup(next);
  };

  return (
    <main className="min-h-screen bg-[#d7d7d7] text-slate-950 dark:bg-[#1f2328] dark:text-slate-100">
      <div className="border-b border-[#b6b6b6] bg-[#b30b00] px-4 py-3 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-white text-lg font-black text-[#b30b00] shadow-sm">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-white/75">Scalable Mock Exam Workspace</p>
              <h1 className="truncate text-xl font-extrabold sm:text-2xl">Universal Exam Platform</h1>
            </div>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} tone="red" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded bg-[#f4f4f4] shadow-xl ring-1 ring-slate-300 dark:bg-[#20252b] dark:ring-slate-700">
          <div className="border-b border-slate-300 bg-[#efefef] px-4 py-3 dark:border-slate-700 dark:bg-[#252a30]">
            <p className="text-sm font-bold">Prepare Document Session</p>
          </div>
          <div className="grid lg:grid-cols-[0.95fr_1.25fr]">
            <div className="border-b border-slate-300 bg-white p-5 lg:border-b-0 lg:border-r dark:border-slate-700 dark:bg-[#2b3036] sm:p-7">
              <div className="rounded bg-slate-100 p-4 ring-1 ring-slate-300 dark:bg-slate-800 dark:ring-slate-700">
                <h2 className="font-bold">Candidate Setup</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Start a timed session with your own legally usable PDFs, audio files, and original questions.
                </p>
              </div>

              {resumeSession && (
                <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
                  <p className="font-bold text-amber-900 dark:text-amber-100">Resume available</p>
                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                    Continue {resumeSession.examTitle} for {resumeSession.candidateName}. Local files must be reattached
                    after browser refresh.
                  </p>
                  <button type="button" className="acrobat-tool mt-3 border-amber-700" onClick={onResume}>
                    Resume session
                  </button>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Candidate name</span>
                  <input
                    className="field"
                    value={setup.candidateName}
                    onChange={(event) => update('candidateName', event.target.value)}
                    autoComplete="name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Exam title</span>
                  <input
                    className="field"
                    value={setup.examTitle}
                    onChange={(event) => update('examTitle', event.target.value)}
                  />
                </label>

                <fieldset>
                  <legend className="mb-2 text-sm font-bold">Practice mode</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {Object.values(examTemplates).map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        className={`acrobat-tool min-h-14 justify-start px-3 ${setup.templateId === template.id ? 'border-[#b30b00] bg-red-50 text-[#b30b00] shadow-sm dark:border-red-300 dark:bg-red-950/30 dark:text-red-100' : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'}`}
                        onClick={() => update('templateId', template.id)}
                        aria-pressed={setup.templateId === template.id}
                      >
                        {template.modeLabel}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Question paper PDF</span>
                  <input
                    className="field"
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => setPdfFile(event.target.files?.[0] || null)}
                    aria-describedby="pdfHelp"
                  />
                  <span id="pdfHelp" className="mt-1 block text-xs text-slate-500">
                    {pdfFile ? pdfFile.name : 'Optional. Attach user- or teacher-provided material only.'}
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Audio files</span>
                  <input
                    className="field"
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={(event) => setAudioFiles(Array.from(event.target.files || []).slice(0, 4))}
                    aria-describedby="audioHelp"
                  />
                  <span id="audioHelp" className="mt-1 block text-xs text-slate-500">
                    {audioFiles.length ? `${audioFiles.length} selected` : 'Optional. Up to 4 uploaded tracks.'}
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-[#f4f4f4] p-5 dark:bg-[#20252b] sm:p-7">
              <div className="rounded border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#2b3036]">
                <p className="font-bold">Content Notice</p>
                <p className="mt-1 text-sm leading-6">{selectedTemplate.contentNotice}</p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {selectedTemplate.sections.map((section) => (
                  <div className="rounded bg-white p-4 shadow-sm ring-1 ring-slate-300 dark:bg-[#2b3036] dark:ring-slate-700" key={section.id}>
                    <h3 className="font-bold">{section.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.description}</p>
                    <p className="mt-3 text-xs font-bold text-slate-500">{section.questions.length} questions</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#2b3036]">
                <div>
                  <p className="font-bold">Ready to begin</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Timer starts immediately. Answers autosave every 5 seconds.
                  </p>
                </div>
                <button type="button" className="acrobat-action acrobat-action-primary" onClick={onStart}>
                  Start exam
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
