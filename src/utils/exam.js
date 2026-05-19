export const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

export const isAnswered = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  return String(value || '').trim().length > 0;
};

export const formatDuration = (seconds) => {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const safeFileName = (value) =>
  String(value || 'exam')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'exam';

export const buildAnswerExport = ({ exam, session, questions }) => {
  const answeredCount = questions.filter((question) => isAnswered(session.answers[question.id])).length;
  const lines = [
    session.examTitle,
    `Candidate: ${session.candidateName}`,
    `Mode: ${exam.modeLabel}`,
    `Exported: ${new Date().toLocaleString()}`,
    `Status: ${session.status}`,
    `Answered: ${answeredCount}/${questions.length}`,
    '',
    'Content notice: Teachers/users are responsible for uploading content they have rights to use.',
    '',
  ];

  exam.sections.forEach((section) => {
    lines.push(section.title);
    lines.push('-'.repeat(section.title.length));
    section.questions.forEach((question) => {
      const answer = session.answers[question.id];
      lines.push(`${question.label}: ${isAnswered(answer) ? answer : '[blank]'}`);
      if (question.type === 'essay') lines.push(`Word count: ${countWords(answer)}`);
      lines.push('');
    });
  });

  return lines.join('\n');
};
