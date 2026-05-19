import { isAnswered } from '../utils/exam';

export default function ReviewModal({
  open,
  session,
  questions,
  answeredCount,
  flaggedCount,
  onClose,
  onGoToQuestion,
  onSubmit,
  onExport,
}) {
  if (!open) return null;

  const unanswered = questions.filter((question) => !isAnswered(session.answers[question.id]));
  const submitted = session.status === 'submitted';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="reviewTitle">
      <section className="panel max-h-[88vh] w-full max-w-3xl overflow-auto rounded-lg">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div>
            <h2 id="reviewTitle" className="text-lg font-extrabold">
              Review Submission
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Check unanswered and flagged items before final submission.
            </p>
          </div>
          <button type="button" className="btn h-10 w-10 px-0" onClick={onClose} aria-label="Close review">
            X
          </button>
        </div>

        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="soft-panel rounded-md p-4">
              <p className="text-sm font-bold text-slate-500">Answered</p>
              <p className="mt-1 text-2xl font-extrabold">{answeredCount}/{questions.length}</p>
            </div>
            <div className="soft-panel rounded-md p-4">
              <p className="text-sm font-bold text-slate-500">Unanswered</p>
              <p className="mt-1 text-2xl font-extrabold">{unanswered.length}</p>
            </div>
            <div className="soft-panel rounded-md p-4">
              <p className="text-sm font-bold text-slate-500">Flagged</p>
              <p className="mt-1 text-2xl font-extrabold">{flaggedCount}</p>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="font-bold">Unanswered questions</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {unanswered.length ? (
                unanswered.map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    className="btn"
                    onClick={() => {
                      onGoToQuestion(question.id);
                      onClose();
                    }}
                  >
                    {question.label}
                  </button>
                ))
              ) : (
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">All questions are answered.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
          <button type="button" className="btn" onClick={onExport}>
            Export answers
          </button>
          {!submitted && (
            <button type="button" className="btn" onClick={onClose}>
              Return to exam
            </button>
          )}
          {!submitted && (
            <button type="button" className="btn btn-danger" onClick={onSubmit}>
              Confirm final submission
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
