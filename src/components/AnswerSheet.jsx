import { memo } from 'react';
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
          className="field min-h-56 resize-y border-0 bg-white text-base leading-7 shadow-inner ring-1 ring-slate-300 dark:bg-slate-950 dark:ring-slate-700"
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

  return (
    <input
      {...commonProps}
      className="field h-12 border-0 bg-white text-base font-semibold shadow-inner ring-1 ring-slate-300 dark:bg-slate-950 dark:ring-slate-700"
      placeholder={question.type === QUESTION_TYPES.FILL_BLANK ? 'Fill in the blank' : 'Enter your answer'}
    />
  );
}

function AnswerSheet({
  questions,
  sectionQuestions,
  sectionAnsweredCount,
  currentQuestion,
  currentQuestionIndex,
  answers,
  flags,
  status,
  onAnswer,
  onFlag,
  onGoToQuestion,
  onPrevious,
  onNext,
}) {
  const disabled = status === 'submitted';
  const isFirst = currentQuestionIndex <= 0;
  const isLast = currentQuestionIndex >= questions.length - 1;
  const flagged = Boolean(flags[currentQuestion.id]);

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#f4f4f4] dark:bg-[#20252b]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-[#2b3036]">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{currentQuestion.sectionTitle}</p>
          <h2 className="text-base font-extrabold">Question {currentQuestionIndex + 1} of {questions.length}</h2>
        </div>
        <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
          {flagged ? 'Flagged for review' : 'Not flagged'}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-3 pb-4 pt-3 sm:px-4">
        <div className="mb-3 rounded bg-white p-3 shadow-sm ring-1 ring-slate-300 dark:bg-[#2b3036] dark:ring-slate-700">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold">Answer Sheet</h3>
            <p className="text-xs font-bold text-slate-500">
              {sectionAnsweredCount}/{sectionQuestions.length} answered
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 xl:grid-cols-10">
            {sectionQuestions.map((question) => {
              const active = question.id === currentQuestion.id;
              const answered = isAnswered(answers[question.id]);
              const isFlagged = Boolean(flags[question.id]);

              return (
                <button
                  key={question.id}
                  type="button"
                  className={`relative flex aspect-square min-h-10 items-center justify-center rounded border text-sm font-extrabold transition ${
                    active
                      ? 'border-[#b30b00] bg-[#b30b00] text-white shadow-sm dark:border-red-300 dark:bg-red-300 dark:text-slate-950'
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
          className="animate-[fadeIn_160ms_ease-out] rounded bg-white p-4 shadow-sm ring-1 ring-slate-300 dark:bg-[#2b3036] dark:ring-slate-700 sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500">{currentQuestion.label}</p>
              <h3 id={`prompt-${currentQuestion.id}`} className="mt-1 text-lg font-extrabold">
                {currentQuestion.type === QUESTION_TYPES.FILL_BLANK ? 'Fill in the blank' : 'Question response'}
              </h3>
            </div>
            <button
              type="button"
              className={`acrobat-tool ${flagged ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200' : ''}`}
              onClick={() => onFlag(currentQuestion.id)}
              aria-pressed={flagged}
              disabled={disabled}
            >
              <span aria-hidden="true">⚑</span>
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
              value={answers[currentQuestion.id]}
              disabled={disabled}
              onAnswer={onAnswer}
            />
          </div>
        </article>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-[#2b3036]">
        <button type="button" className="acrobat-tool" onClick={onPrevious} disabled={disabled || isFirst}>
          <span aria-hidden="true">‹</span>
          Previous
        </button>
        <p className="text-sm font-extrabold text-slate-600 dark:text-slate-300" aria-live="polite">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <button type="button" className="acrobat-action acrobat-action-primary" onClick={onNext} disabled={disabled || isLast}>
          Next
          <span aria-hidden="true">›</span>
        </button>
      </footer>
    </section>
  );
}

export default memo(AnswerSheet);
