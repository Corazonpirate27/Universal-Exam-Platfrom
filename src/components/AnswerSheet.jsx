import { QUESTION_TYPES } from '../data/examTemplates';
import { countWords, isAnswered } from '../utils/exam';

function QuestionInput({ question, value, disabled, onAnswer }) {
  const commonProps = {
    id: `answer-${question.id}`,
    value: value || '',
    disabled,
    onChange: (event) => onAnswer(question.id, event.target.value),
  };

  if (question.type === QUESTION_TYPES.ESSAY) {
    return (
      <>
        <textarea
          {...commonProps}
          className="field min-h-64 resize-y text-base leading-7"
          placeholder={question.placeholder}
          spellCheck="false"
        />
        <p className="mt-2 text-xs font-bold text-slate-500">
          Words: {countWords(value)}
          {question.wordTarget ? ` | ${question.wordTarget}` : ''}
        </p>
      </>
    );
  }

  if (question.type === QUESTION_TYPES.MCQ) {
    return (
      <fieldset className="grid gap-2" aria-describedby={`prompt-${question.id}`}>
        <legend className="sr-only">Choices for {question.label}</legend>
        {question.choices.map((choice) => (
          <label
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm font-bold transition ${
              value === choice
                ? 'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-100'
                : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900'
            }`}
            key={choice}
          >
            <input
              type="radio"
              name={`answer-${question.id}`}
              value={choice}
              checked={value === choice}
              disabled={disabled}
              onChange={(event) => onAnswer(question.id, event.target.value)}
            />
            Option {choice}
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <input
      {...commonProps}
      className="field h-12 text-base font-semibold"
      placeholder={question.type === QUESTION_TYPES.FILL_BLANK ? 'Fill in the blank' : question.placeholder}
    />
  );
}

export default function AnswerSheet({
  questions,
  currentQuestion,
  currentQuestionIndex,
  session,
  onAnswer,
  onFlag,
  onGoToQuestion,
  onPrevious,
  onNext,
}) {
  const disabled = session.status === 'submitted';
  const isFirst = currentQuestionIndex <= 0;
  const isLast = currentQuestionIndex >= questions.length - 1;
  const flagged = Boolean(session.flags[currentQuestion.id]);
  const sectionQuestions = questions.filter((question) => question.sectionId === currentQuestion.sectionId);

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-white dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{currentQuestion.sectionTitle}</p>
          <h2 className="text-lg font-extrabold">Question {currentQuestionIndex + 1} of {questions.length}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {flagged ? 'Flagged for review' : 'Not flagged'}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="mx-auto mb-4 max-w-4xl rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold">{currentQuestion.sectionTitle} answer sheet</h3>
            <p className="text-xs font-bold text-slate-500">
              {sectionQuestions.filter((question) => isAnswered(session.answers[question.id])).length}/{sectionQuestions.length} answered
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 xl:grid-cols-10">
            {sectionQuestions.map((question) => {
              const active = question.id === currentQuestion.id;
              const answered = isAnswered(session.answers[question.id]);
              const isFlagged = Boolean(session.flags[question.id]);

              return (
                <button
                  key={question.id}
                  type="button"
                  className={`relative flex aspect-square min-h-10 items-center justify-center rounded-md border text-sm font-extrabold transition ${
                    active
                      ? 'border-blue-700 bg-blue-700 text-white shadow-sm dark:border-blue-300 dark:bg-blue-300 dark:text-slate-950'
                      : answered
                        ? 'border-green-500 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-400 dark:bg-green-950/40 dark:text-green-200'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => onGoToQuestion(question.id)}
                  aria-current={active ? 'true' : undefined}
                  aria-label={`${question.label}${answered ? ', answered' : ', unanswered'}${isFlagged ? ', flagged' : ''}`}
                >
                  {question.number}
                  {isFlagged && (
                    <span
                      className={`absolute right-1 top-1 h-2 w-2 rounded-full ${
                        active ? 'bg-amber-200' : 'bg-amber-500'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <article
          key={currentQuestion.id}
          className="mx-auto max-w-4xl animate-[fadeIn_160ms_ease-out] rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500">{currentQuestion.label}</p>
              <h3 id={`prompt-${currentQuestion.id}`} className="mt-1 text-xl font-extrabold">
                {currentQuestion.type === QUESTION_TYPES.FILL_BLANK ? 'Fill in the blank' : 'Question response'}
              </h3>
            </div>
            <button
              type="button"
              className={`btn ${flagged ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200' : ''}`}
              onClick={() => onFlag(currentQuestion.id)}
              aria-pressed={flagged}
              disabled={disabled}
            >
              {flagged ? 'Flagged' : 'Flag'}
            </button>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{currentQuestion.prompt}</p>
          <div className="mt-5">
            <label className="mb-2 block text-sm font-bold" htmlFor={`answer-${currentQuestion.id}`}>
              Your answer
            </label>
            <QuestionInput
              question={currentQuestion}
              value={session.answers[currentQuestion.id]}
              disabled={disabled}
              onAnswer={onAnswer}
            />
          </div>
        </article>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <button type="button" className="btn" onClick={onPrevious} disabled={disabled || isFirst}>
          Previous
        </button>
        <p className="text-sm font-extrabold text-slate-600 dark:text-slate-300" aria-live="polite">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <button type="button" className="btn btn-primary" onClick={onNext} disabled={disabled || isLast}>
          Next
        </button>
      </footer>
    </section>
  );
}
