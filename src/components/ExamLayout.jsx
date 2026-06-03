import AnswerSheet from './AnswerSheet';
import AudioPlayer from './AudioPlayer';
import PDFViewer from './PDFViewer';
import SectionTabs from './SectionTabs';
import ThemeToggle from './ThemeToggle';
import Timer from './Timer';

export default function ExamLayout({
  exam,
  session,
  questions,
  currentQuestion,
  currentQuestionIndex,
  answeredCount,
  flaggedCount,
  theme,
  setTheme,
  pdfFile,
  audioFiles,
  onAnswer,
  onFlag,
  onGoToQuestion,
  onPrevious,
  onNext,
  onReview,
  onRoughWork,
  onExport,
  result,
}) {
  const submitted = session.status === 'submitted';

  return (
    <div className="flex min-h-screen flex-col bg-[#d7d7d7] text-slate-950 dark:bg-[#1f2328] dark:text-slate-100">
      <header className="shrink-0 border-b border-[#b6b6b6] bg-[#f7f7f7] shadow-sm dark:border-slate-700 dark:bg-[#2b3036]">
        <div className="flex min-h-14 items-center justify-between gap-3 bg-[#b30b00] px-3 text-white sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded bg-white text-lg font-black text-[#b30b00] shadow-sm">
              A
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-sm font-bold sm:text-base">{session.examTitle}</h1>
                <span className="hidden rounded bg-white/15 px-2 py-0.5 text-[11px] font-bold sm:inline">
                  {submitted ? 'Submitted' : 'In progress'}
                </span>
              </div>
              <p className="truncate text-[11px] font-semibold text-white/80">
                {session.candidateName} | {exam.modeLabel}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!submitted && <Timer secondsLeft={session.secondsLeft} />}
            <button type="button" className={`acrobat-action ${submitted ? 'bg-white/15 hover:bg-white/25' : 'acrobat-action-primary'}`} onClick={onReview}>
              {submitted ? 'Review' : 'Submit'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <button type="button" className="acrobat-tool" onClick={onRoughWork} title="Rough work">
              <span aria-hidden="true">✎</span>
              <span>Rough Work</span>
            </button>
            <ThemeToggle theme={theme} setTheme={setTheme} compact />
            {submitted && (
              <button type="button" className="acrobat-tool" onClick={onExport} title="Export answers">
                <span aria-hidden="true">⇩</span>
                <span>Export</span>
              </button>
            )}
            <AudioPlayer files={audioFiles} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="rounded bg-white px-2 py-1 ring-1 ring-slate-300 dark:bg-slate-800 dark:ring-slate-700">{answeredCount}/{questions.length} answered</span>
            <span className="rounded bg-white px-2 py-1 ring-1 ring-slate-300 dark:bg-slate-800 dark:ring-slate-700">{flaggedCount} flagged</span>
            <span className="hidden sm:inline">Autosave on</span>
          </div>
        </div>
        {result && <p className="border-t border-slate-200 px-4 py-1.5 text-xs font-bold text-green-700 dark:border-slate-700 dark:text-green-300">Submitted at {new Date(result.submittedAt).toLocaleString()}</p>}
      </header>

      <main className="flex min-h-0 flex-1 flex-col lg:h-[calc(100vh-105px)] lg:flex-row">
        <aside className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-[#b6b6b6] bg-[#ececec] py-3 dark:border-slate-700 dark:bg-[#252a30] lg:flex">
          {['▦', '▤', '⌕', '☰'].map((item, index) => (
            <button
              key={item}
              type="button"
              className={`grid h-10 w-10 place-items-center rounded text-lg font-bold ${
                index === 0
                  ? 'bg-white text-[#b30b00] shadow-sm ring-1 ring-slate-300 dark:bg-slate-800 dark:ring-slate-700'
                  : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              aria-label={`Document tool ${index + 1}`}
            >
              {item}
            </button>
          ))}
        </aside>
        <PDFViewer file={pdfFile} />
        <div className="flex min-h-0 flex-1 flex-col border-l border-[#b6b6b6] bg-[#f4f4f4] dark:border-slate-700 dark:bg-[#20252b]">
          <SectionTabs
            exam={exam}
            currentQuestionId={session.currentQuestionId}
            answers={session.answers}
            flags={session.flags}
            onGoToQuestion={onGoToQuestion}
          />
          <AnswerSheet
            questions={questions}
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            session={session}
            onAnswer={onAnswer}
            onFlag={onFlag}
            onGoToQuestion={onGoToQuestion}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </div>
      </main>
    </div>
  );
}
