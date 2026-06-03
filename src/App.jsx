import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SetupScreen from './components/SetupScreen';
import ExamLayout from './components/ExamLayout';
import { examService } from './services/examService';
import { flattenQuestions } from './data/examTemplates';
import { buildAnswerExport, isAnswered, safeFileName } from './utils/exam';

const ReviewModal = lazy(() => import('./components/ReviewModal'));
const RoughWorkCanvas = lazy(() => import('./components/RoughWorkCanvas'));

const themeFromStorage = () => localStorage.getItem('uep_theme') || 'light';

export default function App() {
  const [theme, setTheme] = useState(themeFromStorage);
  const [exam, setExam] = useState(null);
  const [session, setSession] = useState(null);
  const [setup, setSetup] = useState({
    candidateName: 'Candidate',
    examTitle: 'Universal Mock Exam',
    templateId: 'universalMock',
  });
  const [resumeSession, setResumeSession] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [roughOpen, setRoughOpen] = useState(false);
  const [result, setResult] = useState(null);
  const sessionRef = useRef(null);

  const questions = useMemo(() => (exam ? flattenQuestions(exam) : []), [exam]);
  const questionIndexById = useMemo(
    () => new Map(questions.map((question, index) => [question.id, index])),
    [questions],
  );
  const questionsBySection = useMemo(() => {
    const grouped = new Map();
    questions.forEach((question) => {
      if (!grouped.has(question.sectionId)) grouped.set(question.sectionId, []);
      grouped.get(question.sectionId).push(question);
    });
    return grouped;
  }, [questions]);
  const foundQuestionIndex = questionIndexById.get(session?.currentQuestionId) ?? -1;
  const currentQuestionIndex = foundQuestionIndex >= 0 ? foundQuestionIndex : 0;
  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const answeredCount = useMemo(
    () => questions.filter((question) => isAnswered(session?.answers?.[question.id])).length,
    [questions, session?.answers],
  );
  const flaggedCount = useMemo(
    () => Object.values(session?.flags || {}).filter(Boolean).length,
    [session?.flags],
  );
  const sectionQuestions = useMemo(
    () => (currentQuestion ? questionsBySection.get(currentQuestion.sectionId) || [] : []),
    [currentQuestion, questionsBySection],
  );
  const sectionAnsweredCount = useMemo(
    () => sectionQuestions.filter((question) => isAnswered(session?.answers?.[question.id])).length,
    [sectionQuestions, session?.answers],
  );
  const sectionStats = useMemo(() => {
    if (!exam) return [];
    return exam.sections.map((section) => {
      const sectionItems = questionsBySection.get(section.id) || [];
      return {
        id: section.id,
        title: section.title,
        firstQuestionId: sectionItems[0]?.id || '',
        questionCount: sectionItems.length,
        answeredCount: sectionItems.filter((question) => isAnswered(session?.answers?.[question.id])).length,
        flaggedCount: sectionItems.filter((question) => session?.flags?.[question.id]).length,
        active: sectionItems.some((question) => question.id === session?.currentQuestionId),
      };
    });
  }, [exam, questionsBySection, session?.answers, session?.currentQuestionId, session?.flags]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('uep_theme', theme);
  }, [theme]);

  useEffect(() => {
    examService.getActiveSession().then((saved) => {
      if (saved && saved.status !== 'submitted') setResumeSession(saved);
    });
  }, []);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== 'in-progress') return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [session?.status]);

  useEffect(() => {
    if (!session || session.status !== 'in-progress') return undefined;
    const timer = window.setInterval(() => {
      setSession((current) => {
        if (!current || current.status !== 'in-progress') return current;
        const nextSeconds = Math.max(0, current.secondsLeft - 1);
        const next = { ...current, secondsLeft: nextSeconds };
        if (nextSeconds === 0) setReviewOpen(true);
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [session?.id, session?.status]);

  useEffect(() => {
    if (!session?.id) return undefined;
    const autosave = window.setInterval(() => {
      if (sessionRef.current) examService.saveSession(sessionRef.current);
    }, 5000);
    return () => window.clearInterval(autosave);
  }, [session?.id]);

  const loadSession = useCallback(async (savedSession) => {
    const loadedExam = await examService.fetchExam(savedSession.templateId);
    setExam(loadedExam);
    setSession(savedSession);
    setSetup({
      candidateName: savedSession.candidateName,
      examTitle: savedSession.examTitle,
      templateId: savedSession.templateId,
    });
    setResumeSession(null);
    const savedResult = await examService.getResult(savedSession.id);
    setResult(savedResult);
  }, []);

  const startExam = useCallback(async () => {
    const createdSession = await examService.createExamSession(setup);
    const loadedExam = await examService.fetchExam(setup.templateId);
    setExam(loadedExam);
    setSession(createdSession);
    setResult(null);
    setResumeSession(null);
  }, [setup]);

  const updateSession = useCallback((updater) => {
    setSession((current) => {
      if (!current || current.status === 'submitted') return current;
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...next, updatedAt: new Date().toISOString() };
    });
  }, []);

  const saveAnswer = useCallback((questionId, value) => {
    updateSession((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [questionId]: value,
      },
    }));
    if (sessionRef.current?.id) examService.saveAnswer(sessionRef.current.id, questionId, value);
  }, [updateSession]);

  const toggleFlag = useCallback((questionId) => {
    updateSession((current) => ({
      ...current,
      flags: {
        ...current.flags,
        [questionId]: !current.flags?.[questionId],
      },
    }));
  }, [updateSession]);

  const goToQuestion = useCallback((questionId) => {
    updateSession((current) => ({ ...current, currentQuestionId: questionId }));
  }, [updateSession]);

  const goToOffset = useCallback((offset) => {
    const nextQuestion = questions[currentQuestionIndex + offset];
    if (nextQuestion) goToQuestion(nextQuestion.id);
  }, [currentQuestionIndex, goToQuestion, questions]);

  const goToPrevious = useCallback(() => goToOffset(-1), [goToOffset]);
  const goToNext = useCallback(() => goToOffset(1), [goToOffset]);
  const openReview = useCallback(() => setReviewOpen(true), []);
  const closeReview = useCallback(() => setReviewOpen(false), []);
  const openRoughWork = useCallback(() => setRoughOpen(true), []);
  const closeRoughWork = useCallback(() => setRoughOpen(false), []);

  const submitExam = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (!currentSession) return;
    const submittedResult = await examService.submitExam(currentSession);
    const submittedSession = await examService.getActiveSession();
    setSession(submittedSession);
    setResult(submittedResult);
    setReviewOpen(false);
  }, []);

  const exportAnswers = useCallback(() => {
    if (!exam || !sessionRef.current) return;
    const session = sessionRef.current;
    const text = buildAnswerExport({ exam, session, questions });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFileName(session.candidateName)}-${safeFileName(session.examTitle)}-answers.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [exam, questions]);

  if (!session || !exam) {
    return (
      <SetupScreen
        setup={setup}
        setSetup={setSetup}
        theme={theme}
        setTheme={setTheme}
        resumeSession={resumeSession}
        onResume={() => loadSession(resumeSession)}
        onStart={startExam}
        pdfFile={pdfFile}
        setPdfFile={setPdfFile}
        audioFiles={audioFiles}
        setAudioFiles={setAudioFiles}
      />
    );
  }

  return (
    <>
      <ExamLayout
        exam={exam}
        session={session}
        questions={questions}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        sectionQuestions={sectionQuestions}
        sectionAnsweredCount={sectionAnsweredCount}
        sectionStats={sectionStats}
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        theme={theme}
        setTheme={setTheme}
        pdfFile={pdfFile}
        audioFiles={audioFiles}
        onAnswer={saveAnswer}
        onFlag={toggleFlag}
        onGoToQuestion={goToQuestion}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onReview={openReview}
        onRoughWork={openRoughWork}
        onExport={exportAnswers}
        result={result}
      />
      {reviewOpen && (
        <Suspense fallback={null}>
          <ReviewModal
            open={reviewOpen}
            session={session}
            questions={questions}
            answeredCount={answeredCount}
            flaggedCount={flaggedCount}
            onClose={closeReview}
            onGoToQuestion={goToQuestion}
            onSubmit={submitExam}
            onExport={exportAnswers}
          />
        </Suspense>
      )}
      {roughOpen && (
        <Suspense fallback={null}>
          <RoughWorkCanvas open={roughOpen} onClose={closeRoughWork} />
        </Suspense>
      )}
    </>
  );
}
