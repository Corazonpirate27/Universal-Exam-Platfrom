import { getTemplate, normalizeExam } from '../data/examTemplates';

const SESSION_KEY = 'uep_active_session';
const RESULT_PREFIX = 'uep_result_';

const readJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const nowIso = () => new Date().toISOString();

export const examService = {
  async fetchExam(templateId) {
    const template = getTemplate(templateId);
    const exam = typeof structuredClone === 'function' ? structuredClone(template) : JSON.parse(JSON.stringify(template));
    return normalizeExam(exam);
  },

  async createExamSession({ candidateName, examTitle, templateId }) {
    const exam = await this.fetchExam(templateId);
    const session = {
      id: crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`,
      candidateName: candidateName?.trim() || 'Candidate',
      examTitle: examTitle?.trim() || exam.title,
      templateId,
      startedAt: nowIso(),
      updatedAt: nowIso(),
      submittedAt: null,
      status: 'in-progress',
      secondsLeft: exam.durationMinutes * 60,
      currentQuestionId: exam.sections[0]?.questions[0]?.id || '',
      answers: {},
      flags: {},
    };
    writeJson(SESSION_KEY, session);
    return session;
  },

  async getActiveSession() {
    return readJson(SESSION_KEY);
  },

  async saveSession(session) {
    const next = { ...session, updatedAt: nowIso() };
    writeJson(SESSION_KEY, next);
    return next;
  },

  async saveAnswer(sessionId, questionId, value) {
    const session = readJson(SESSION_KEY);
    if (!session || session.id !== sessionId || session.status === 'submitted') return session;
    const next = {
      ...session,
      updatedAt: nowIso(),
      answers: {
        ...session.answers,
        [questionId]: value,
      },
    };
    writeJson(SESSION_KEY, next);
    return next;
  },

  async submitExam(session) {
    const result = {
      id: `result-${session.id}`,
      sessionId: session.id,
      candidateName: session.candidateName,
      examTitle: session.examTitle,
      submittedAt: nowIso(),
      answers: session.answers,
      flags: session.flags,
      status: 'submitted',
    };
    const submittedSession = {
      ...session,
      status: 'submitted',
      submittedAt: result.submittedAt,
      updatedAt: result.submittedAt,
    };
    writeJson(SESSION_KEY, submittedSession);
    writeJson(`${RESULT_PREFIX}${session.id}`, result);
    return result;
  },

  async getResult(sessionId) {
    return readJson(`${RESULT_PREFIX}${sessionId}`);
  },

  async clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },
};
