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
    <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white/95 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/95 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-extrabold">{session.examTitle}</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  submitted
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-200'
                    : 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-200'
                }`}
              >
                {submitted ? 'Submitted' : 'In progress'}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
              {session.candidateName} | {exam.modeLabel} | Autosave every 5 seconds | {answeredCount}/{questions.length} answered | {flaggedCount} flagged
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {!submitted && <Timer secondsLeft={session.secondsLeft} />}
            <AudioPlayer files={audioFiles} />
            <button type="button" className="btn" onClick={onRoughWork}>
              Rough Work
            </button>
            <ThemeToggle theme={theme} setTheme={setTheme} compact />
            {submitted && (
              <button type="button" className="btn" onClick={onExport}>
                Export
              </button>
            )}
            <button type="button" className={`btn ${submitted ? '' : 'btn-primary'}`} onClick={onReview}>
              {submitted ? 'View Review' : 'Submit'}
            </button>
          </div>
        </div>
        {result && <p className="mt-2 text-xs font-bold text-green-700 dark:text-green-300">Submitted at {new Date(result.submittedAt).toLocaleString()}</p>}
      </header>

      <main className="flex min-h-0 flex-1 flex-col lg:h-[calc(100vh-57px)] lg:flex-row">
        <PDFViewer file={pdfFile} />
        <div className="flex min-h-0 flex-1 flex-col">
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
