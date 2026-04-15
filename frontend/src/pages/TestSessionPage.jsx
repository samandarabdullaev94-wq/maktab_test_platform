import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import SessionQuestionPanel from "../components/test-session/SessionQuestionPanel";
import SessionSidebar from "../components/test-session/SessionSidebar";
import SubjectTabs from "../components/test-session/SubjectTabs";
import { useI18n } from "../i18n/useI18n";
import api from "../utils/api";

function TestSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { tx } = useI18n();

  const [sessionData, setSessionData] = useState(null);
  const [testsMap, setTestsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const storageKey = `test_session_state_${sessionId}`;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const [sessionRes, testsRes] = await Promise.all([
          api.get(`test-session/${sessionId}/`),
          api.get("tests/"),
        ]);

        const testsObject = {};
        testsRes.data.forEach((test) => {
          testsObject[test.id] = test;
        });

        const session = sessionRes.data;

        if (session.finished_at) {
          setError("Bu test sessiyasi yakunlangan");
          return;
        }

        setTestsMap(testsObject);
        setSessionData(session);

        const savedStateRaw = localStorage.getItem(storageKey);
        const serverAnswers = (session.saved_answers || []).reduce(
          (acc, item) => {
            if (item.question_id && item.answer_id) {
              acc[item.question_id] = item.answer_id;
            }
            return acc;
          },
          {}
        );
        let savedState = {};

        if (savedStateRaw) {
          try {
            savedState = JSON.parse(savedStateRaw) || {};
          } catch (parseError) {
            console.error(parseError);
          }
        }

        setAnswers({
          ...serverAnswers,
          ...(savedState.answers || {}),
        });
        setCurrentQuestionIndex(savedState.currentQuestionIndex || 0);
        setActiveSubjectId(
          savedState.activeSubjectId || session.selected_test_ids?.[0] || null
        );
      } catch (err) {
        console.error(err);
        setError("Session ma'lumotlarini olishda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, storageKey]);

  const allQuestions = useMemo(() => sessionData?.questions || [], [sessionData]);

  const subjectTabs = useMemo(() => {
    if (!sessionData) return [];

    return sessionData.selected_test_ids.map((id) => ({
      id,
      title: testsMap[id]?.title || `Fan ${id}`,
    }));
  }, [sessionData, testsMap]);

  const filteredQuestions = useMemo(() => {
    if (!activeSubjectId) return allQuestions;
    return allQuestions.filter(
      (question) => Number(question.test_id) === Number(activeSubjectId)
    );
  }, [allQuestions, activeSubjectId]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const endTimestamp = useMemo(() => {
    if (typeof sessionData?.remaining_time_seconds === "number") {
      return Date.now() + sessionData.remaining_time_seconds * 1000;
    }

    if (!sessionData?.started_at || !sessionData?.total_time_seconds) return null;
    const started = new Date(sessionData.started_at).getTime();
    return started + sessionData.total_time_seconds * 1000;
  }, [sessionData]);

  useEffect(() => {
    if (!endTimestamp) return;

    const updateTime = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((endTimestamp - now) / 1000));
      setTimeLeft(diff);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [endTimestamp]);

  useEffect(() => {
    if (!sessionData) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        answers,
        currentQuestionIndex,
        activeSubjectId,
      })
    );
  }, [answers, currentQuestionIndex, activeSubjectId, sessionData, storageKey]);

  useEffect(() => {
    const preventCopy = (e) => e.preventDefault();
    const preventKey = (e) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCopy);
    document.addEventListener("contextmenu", preventCopy);
    window.addEventListener("keydown", preventKey);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCopy);
      document.removeEventListener("contextmenu", preventCopy);
      window.removeEventListener("keydown", preventKey);
    };
  }, []);

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSelectAnswer = (answerId) => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));

    api
      .post(`test-session/${sessionId}/answer/`, {
        question_id: questionId,
        answer_id: answerId,
      })
      .catch((err) => {
        console.error(err);

        if (err.response?.status === 400 || err.response?.status === 404) {
          setError(err.response?.data?.error || "Test javobini saqlashda xatolik yuz berdi");
        }
      });
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleChangeSubject = (subjectId) => {
    setActiveSubjectId(subjectId);
    setCurrentQuestionIndex(0);
  };

  const handleFinish = useCallback(async (autoSubmit = false) => {
    if (submitting) return;

    if (!autoSubmit) {
      const ok = window.confirm(tx("Testni yakunlashni tasdiqlaysizmi?"));
      if (!ok) return;
    }

    try {
      setSubmitting(true);

      const payload = {
        answers: Object.entries(answers).map(([questionId, answerId]) => ({
          question_id: Number(questionId),
          answer_id: Number(answerId),
        })),
      };

      const res = await api.post(`test-session/${sessionId}/submit/`, payload);

      localStorage.removeItem(storageKey);
      localStorage.setItem("sessionResult", JSON.stringify(res.data));

      navigate("/result", {
        state: {
          score: res.data.score,
          total_questions: res.data.total_questions,
          percentage: res.data.percentage,
          certificate: res.data.certificate,
          test_id: null,
          is_session_result: true,
        },
      });
    } catch (err) {
      console.error(err);
      alert(tx("Testni yuborishda xatolik yuz berdi"));
    } finally {
      setSubmitting(false);
    }
  }, [answers, navigate, sessionId, storageKey, submitting, tx]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft === 0 && sessionData && !loading) {
      handleFinish(true);
    }
  }, [timeLeft, sessionData, loading, handleFinish]);

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ padding: "40px", textAlign: "center" }}>
          {tx("Yuklanmoqda...")}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--app-danger)",
          }}
        >
          {tx(error)}
        </div>
      </>
    );
  }

  if (!currentQuestion) {
    return (
      <>
        <Header />
        <div style={{ padding: "40px", textAlign: "center" }}>
          {tx("Savollar topilmadi")}
        </div>
      </>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestionsCount = allQuestions.length;

  return (
    <>
      <Header />

      <div
        className="test-session-page"
        style={{
          minHeight: "calc(100vh - 72px)",
          background: "var(--app-bg-soft)",
          color: "var(--app-text)",
          padding: "24px 20px 36px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
          <SubjectTabs
            subjectTabs={subjectTabs}
            activeSubjectId={activeSubjectId}
            onChangeSubject={handleChangeSubject}
          />

          <div
            className="test-session-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <SessionSidebar
              timeLeft={timeLeft}
              formatTime={formatTime}
              totalTimeSeconds={sessionData?.total_time_seconds}
              answeredCount={answeredCount}
              totalQuestionsCount={totalQuestionsCount}
              filteredQuestions={filteredQuestions}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              onQuestionJump={handleQuestionJump}
              onFinish={handleFinish}
              submitting={submitting}
              tx={tx}
            />

            <SessionQuestionPanel
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              filteredQuestions={filteredQuestions}
              answers={answers}
              onSelectAnswer={handleSelectAnswer}
              onPrev={handlePrev}
              onNext={handleNext}
              tx={tx}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default TestSessionPage;
