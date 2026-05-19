import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SetupScreen from './components/SetupScreen';
import ExamLayout from './components/ExamLayout';
import ReviewModal from './components/ReviewModal';
import RoughWorkCanvas from './components/RoughWorkCanvas';
import { examService } from './services/examService';
import { flattenQuestions } from './data/examTemplates';
import { buildAnswerExport, isAnswered, safeFileName } from './utils/exam';

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
  const foundQuestionIndex = questions.findIndex((question) => question.id === session?.currentQuestionId);
  const currentQuestionIndex = foundQuestionIndex >= 0 ? foundQuestionIndex : 0;
  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const answeredCount = questions.filter((question) => isAnswered(session?.answers?.[question.id])).length;
  const flaggedCount = Object.values(session?.flags || {}).filter(Boolean).length;

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
  }, [session]);

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

  const startExam = async () => {
    const createdSession = await examService.createExamSession(setup);
    const loadedExam = await examService.fetchExam(setup.templateId);
    setExam(loadedExam);
    setSession(createdSession);
    setResult(null);
    setResumeSession(null);
  };

  const updateSession = (updater) => {
    setSession((current) => {
      if (!current || current.status === 'submitted') return current;
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...next, updatedAt: new Date().toISOString() };
    });
  };

  const saveAnswer = (questionId, value) => {
    updateSession((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [questionId]: value,
      },
    }));
    if (session?.id) examService.saveAnswer(session.id, questionId, value);
  };

  const toggleFlag = (questionId) => {
    updateSession((current) => ({
      ...current,
      flags: {
        ...current.flags,
        [questionId]: !current.flags?.[questionId],
      },
    }));
  };

  const goToQuestion = (questionId) => {
    updateSession((current) => ({ ...current, currentQuestionId: questionId }));
  };

  const goToOffset = (offset) => {
    const nextQuestion = questions[currentQuestionIndex + offset];
    if (nextQuestion) goToQuestion(nextQuestion.id);
  };

  const submitExam = async () => {
    const submittedResult = await examService.submitExam(session);
    const submittedSession = await examService.getActiveSession();
    setSession(submittedSession);
    setResult(submittedResult);
    setReviewOpen(false);
  };

  const exportAnswers = () => {
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
  };

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
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        theme={theme}
        setTheme={setTheme}
        pdfFile={pdfFile}
        audioFiles={audioFiles}
        onAnswer={saveAnswer}
        onFlag={toggleFlag}
        onGoToQuestion={goToQuestion}
        onPrevious={() => goToOffset(-1)}
        onNext={() => goToOffset(1)}
        onReview={() => setReviewOpen(true)}
        onRoughWork={() => setRoughOpen(true)}
        onExport={exportAnswers}
        result={result}
      />
      <ReviewModal
        open={reviewOpen}
        session={session}
        questions={questions}
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        onClose={() => setReviewOpen(false)}
        onGoToQuestion={goToQuestion}
        onSubmit={submitExam}
        onExport={exportAnswers}
      />
      <RoughWorkCanvas open={roughOpen} onClose={() => setRoughOpen(false)} />
    </>
  );
}
