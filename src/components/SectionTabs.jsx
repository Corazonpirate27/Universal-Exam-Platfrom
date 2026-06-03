import { isAnswered } from '../utils/exam';

export default function SectionTabs({ exam, currentQuestionId, answers, flags, onGoToQuestion }) {
  return (
    <nav className="border-b border-slate-300 bg-[#e8e8e8] px-3 py-2 dark:border-slate-700 dark:bg-[#252a30]" aria-label="Exam sections">
      <div className="flex gap-1.5 overflow-x-auto">
        {exam.sections.map((section) => {
          const active = section.questions.some((question) => question.id === currentQuestionId);
          const answered = section.questions.filter((question) => isAnswered(answers[question.id])).length;
          const flagged = section.questions.filter((question) => flags[question.id]).length;
          return (
            <button
              key={section.id}
              type="button"
              className={`acrobat-tool h-9 min-h-9 shrink-0 px-3 text-xs ${active ? 'border-[#b30b00] bg-white text-[#b30b00] shadow-sm dark:border-red-300 dark:bg-slate-800 dark:text-red-200' : ''}`}
              onClick={() => onGoToQuestion(section.questions[0].id)}
              aria-current={active ? 'true' : undefined}
            >
              {section.title}
              <span className="hidden text-xs opacity-80 sm:inline">
                {answered}/{section.questions.length}
                {flagged ? `, ${flagged} flagged` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
