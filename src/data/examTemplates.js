export const QUESTION_TYPES = {
  SHORT_ANSWER: 'short-answer',
  MCQ: 'mcq',
  ESSAY: 'essay',
  FILL_BLANK: 'fill-blank',
};

const buildQuestions = (sectionId, count, type, labelPrefix, options = {}) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${sectionId}-${(options.startNumber || 1) + index}`,
    number: (options.startNumber || 1) + index,
    sectionId,
    type,
    label: `${labelPrefix}${(options.startNumber || 1) + index}`,
    prompt: options.prompt || 'Use your uploaded question paper or teacher-provided material for this item.',
    choices: type === QUESTION_TYPES.MCQ ? ['A', 'B', 'C', 'D'] : undefined,
    placeholder: options.placeholder || 'Enter your answer',
    wordTarget: options.wordTarget,
  }));

const labelPrefixFrom = (label = '') => label.match(/^\D*/)?.[0] || '';

export const normalizeExam = (exam) => ({
  ...exam,
  sections: exam.sections.map((section) => ({
    ...section,
    questions: section.questions.map((question, index) => {
      const number = index + 1;
      const labelPrefix = labelPrefixFrom(question.label) || `${section.title} `;

      return {
        ...question,
        id: `${section.id}-${number}`,
        number,
        label: `${labelPrefix}${number}`,
      };
    }),
  })),
});

export const examTemplates = {
  ieltsStyle: {
    id: 'ieltsStyle',
    title: 'IELTS-style Practice Mode',
    modeLabel: 'IELTS-style practice mode',
    durationMinutes: 165,
    contentNotice: 'Teachers/users are responsible for uploading content they have rights to use.',
    sections: [
      {
        id: 'listening',
        title: 'Listening Practice',
        description: 'Short answer and fill-in-the-blank responses for uploaded listening material.',
        questions: [
          ...buildQuestions('listening', 20, QUESTION_TYPES.SHORT_ANSWER, 'L'),
          ...buildQuestions('listening', 20, QUESTION_TYPES.FILL_BLANK, 'L', { startNumber: 21 }),
        ],
      },
      {
        id: 'reading',
        title: 'Reading Practice',
        description: 'Mixed response types for uploaded reading passages.',
        questions: [
          ...buildQuestions('reading', 20, QUESTION_TYPES.MCQ, 'R'),
          ...buildQuestions('reading', 20, QUESTION_TYPES.SHORT_ANSWER, 'R', { startNumber: 21 }),
        ],
      },
      {
        id: 'writing',
        title: 'Writing Practice',
        description: 'Original writing prompts created by the teacher or user.',
        questions: buildQuestions('writing', 2, QUESTION_TYPES.ESSAY, 'Task ', {
          placeholder: 'Write your response here',
          wordTarget: 'Follow the word target provided by your teacher.',
        }),
      },
      {
        id: 'speaking',
        title: 'Speaking Notes',
        description: 'Optional notes area for self-practice or teacher-run sessions.',
        questions: buildQuestions('speaking', 3, QUESTION_TYPES.ESSAY, 'Part ', {
          placeholder: 'Add notes or speaking outline',
        }),
      },
    ],
  },
  greStyle: {
    id: 'greStyle',
    title: 'GRE-style Practice Mode',
    modeLabel: 'GRE-style practice mode',
    durationMinutes: 118,
    contentNotice: 'Teachers/users are responsible for uploading content they have rights to use.',
    sections: [
      {
        id: 'analytical-writing',
        title: 'Analytical Writing',
        description: 'Original essay prompt supplied by teacher or user.',
        questions: buildQuestions('analytical-writing', 1, QUESTION_TYPES.ESSAY, 'Issue ', {
          placeholder: 'Write your essay response',
        }),
      },
      {
        id: 'verbal',
        title: 'Verbal Reasoning',
        description: 'Mixed verbal practice with original or licensed material.',
        questions: [
          ...buildQuestions('verbal', 14, QUESTION_TYPES.MCQ, 'V'),
          ...buildQuestions('verbal', 13, QUESTION_TYPES.FILL_BLANK, 'V', { startNumber: 15 }),
        ],
      },
      {
        id: 'quantitative',
        title: 'Quantitative Reasoning',
        description: 'Short answer and MCQ responses for uploaded math material.',
        questions: [
          ...buildQuestions('quantitative', 14, QUESTION_TYPES.MCQ, 'Q'),
          ...buildQuestions('quantitative', 13, QUESTION_TYPES.SHORT_ANSWER, 'Q', { startNumber: 15 }),
        ],
      },
    ],
  },
  universalMock: {
    id: 'universalMock',
    title: 'Universal Mock Exam',
    modeLabel: 'Universal original mock mode',
    durationMinutes: 90,
    contentNotice: 'Teachers/users are responsible for uploading content they have rights to use.',
    sections: [
      {
        id: 'objective',
        title: 'Objective Questions',
        description: 'Reusable section for MCQ and short answer items.',
        questions: [
          ...buildQuestions('objective', 10, QUESTION_TYPES.MCQ, 'O'),
          ...buildQuestions('objective', 10, QUESTION_TYPES.SHORT_ANSWER, 'O', { startNumber: 11 }),
        ],
      },
      {
        id: 'constructed-response',
        title: 'Constructed Response',
        description: 'Reusable section for fill-in-the-blank and longer writing.',
        questions: [
          ...buildQuestions('constructed-response', 10, QUESTION_TYPES.FILL_BLANK, 'C'),
          ...buildQuestions('constructed-response', 2, QUESTION_TYPES.ESSAY, 'Essay ', { startNumber: 11 }),
        ],
      },
    ],
  },
};

export const getTemplate = (templateId) => examTemplates[templateId] || examTemplates.universalMock;

export const flattenQuestions = (exam) =>
  normalizeExam(exam).sections.flatMap((section) =>
    section.questions.map((question) => ({
      ...question,
      sectionTitle: section.title,
    })),
  );
