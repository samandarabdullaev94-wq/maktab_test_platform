import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n/useI18n";
import api from "../utils/api";

function TestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tx } = useI18n();

  const [questions, setQuestions] = useState([]);
  const [testInfo, setTestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`tests/${id}/questions/`),
      api.get("tests/"),
    ])
      .then(([questionsRes, testsRes]) => {
        const sortedQuestions = [...questionsRes.data].sort((a, b) => a.order - b.order);
        setQuestions(sortedQuestions);

        const currentTest = testsRes.data.find((item) => item.id === Number(id));
        setTestInfo(currentTest || null);

        if (currentTest && currentTest.duration_minutes) {
          setTimeLeft(currentTest.duration_minutes * 60);
        } else {
          setTimeLeft(60 * 60);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);
    useEffect(() => {
    const savedStudentData = JSON.parse(localStorage.getItem("studentData") || "{}");

    if (
    !savedStudentData.full_name ||
    !savedStudentData.phone ||
    !savedStudentData.gender ||
    !savedStudentData.school_id ||
    !savedStudentData.school_class_id ||
    !savedStudentData.class_section_id
  ) {
    alert(tx("Avval ma'lumotlarni to'ldirib testni boshlang"));
    navigate("/");
  }
}, [navigate, tx]);
  useEffect(() => {
    if (loading) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  const handleSelectAnswer = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleGoToQuestion = (index) => {
    setCurrentIndex(index);
  };

  const handleFinish = useCallback(async () => {
    if (submitting) return;

    try {
      setSubmitting(true);



      const savedStudentData = JSON.parse(localStorage.getItem("studentData") || "{}");
      const payload = {
        full_name: savedStudentData.full_name || "Noma'lum",
        phone: savedStudentData.phone || "000000000",
        gender: savedStudentData.gender || "male",
        school_id: savedStudentData.school_id || 1,
        school_class_id: savedStudentData.school_class_id || 1,
        class_section_id: savedStudentData.class_section_id || 1,
        test_id: Number(id),
        answers: selectedAnswers,
      };

      const res = await api.post("submit-test/", payload);

      localStorage.removeItem("studentData");
        navigate("/result", {state: {
        score: res.data.score,
    total_questions: res.data.total_questions,
    percentage: res.data.percentage,
    certificate: res.data.certificate,
    test_id: Number(id),
  },
});
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.error || tx("Testni yuborishda xatolik yuz berdi");
      alert(message);
    } finally {
      setSubmitting(false);
    }
  }, [id, navigate, selectedAnswers, submitting, tx]);

  useEffect(() => {
    if (!loading && timeLeft === 0 && questions.length > 0) {
      alert(tx("Vaqt tugadi!"));
      handleFinish();
    }
  }, [timeLeft, loading, questions.length, handleFinish, tx]);

  const formatTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [timeLeft]);

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "40px" }}>
        {tx("Yuklanmoqda...")}
      </h2>
    );
  }
const savedStudentData = JSON.parse(localStorage.getItem("studentData") || "{}");

if (
  !savedStudentData.full_name ||
  !savedStudentData.phone ||
  !savedStudentData.gender ||
  !savedStudentData.school_id ||
  !savedStudentData.school_class_id ||
  !savedStudentData.class_section_id
) {
  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>{tx("Avval ma'lumotlarni to'ldirib testni boshlang")}</h2>
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "16px",
          background: "var(--app-primary-strong)",
          color: "var(--app-text-inverse)",
          border: "none",
          borderRadius: "8px",
          padding: "12px 20px",
          cursor: "pointer",
        }}
      >
        {tx("Bosh sahifaga qaytish")}
      </button>
    </div>
  );
}
  if (questions.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h2>{tx("Savollar yo'q")}</h2>
        <button onClick={() => navigate("/")}>{tx("Orqaga")}</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--app-bg-soft)",
        color: "var(--app-text)",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              background: "var(--app-surface-muted)",
              color: "var(--app-text)",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            {tx("Orqaga")}
          </button>

          <h1 style={{ margin: 0, color: "var(--app-text)" }}>
            {tx("Test sahifasi")}
          </h1>

          <div
            style={{
              background: "var(--app-surface)",
              borderRadius: "8px",
              padding: "12px 18px",
              border: "1px solid var(--app-border-strong)",
              fontWeight: "bold",
              color: timeLeft < 60 ? "var(--app-danger)" : "var(--app-text)",
              minWidth: "110px",
              textAlign: "center",
            }}
          >
            {formatTime}
          </div>
        </div>

        {testInfo && (
          <p style={{ marginBottom: "16px", color: "var(--app-muted-text)" }}>
            {tx("Test vaqti: {minutes} daqiqa", {
              minutes: testInfo.duration_minutes,
            })}
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "var(--app-card-shadow)",
              height: "fit-content",
            }}
          >
            <h3 style={{ marginTop: 0 }}>{tx("Savollar")}</h3>

            <p style={{ color: "var(--app-muted-text)", marginBottom: "16px" }}>
              {tx("Javob berilgan: {answered} / {total}", {
                answered: answeredCount,
                total: questions.length,
              })}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "10px",
              }}
            >
              {questions.map((q, index) => {
                const isCurrent = index === currentIndex;
                const isAnswered = selectedAnswers[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => handleGoToQuestion(index)}
                    style={{
                      padding: "12px 0",
                      borderRadius: "8px",
                      border: isCurrent
                        ? "2px solid var(--app-primary-strong)"
                        : "1px solid var(--app-border-strong)",
                      background: isCurrent
                        ? "var(--app-primary-soft)"
                        : isAnswered
                        ? "var(--app-success)"
                        : "var(--app-surface)",
                      color: isAnswered && !isCurrent
                        ? "var(--app-text-inverse)"
                        : "var(--app-text)",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleFinish}
              disabled={submitting}
              style={{
                width: "100%",
                marginTop: "20px",
                background: "var(--app-primary-strong)",
                color: "var(--app-text-inverse)",
                border: "none",
                borderRadius: "8px",
                padding: "14px",
                fontSize: "16px",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? tx("Yuborilmoqda...") : tx("Yakunlash")}
            </button>
          </div>

          <div
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              padding: "28px",
              borderRadius: "8px",
              boxShadow: "var(--app-card-shadow)",
            }}
          >
            <p style={{ color: "var(--app-muted-text)", marginTop: 0 }}>
              {tx("Savol {current} / {total}", {
                current: currentIndex + 1,
                total: questions.length,
              })}
            </p>

            <h2 style={{ marginBottom: "24px", color: "var(--app-text)" }}>
              {currentIndex + 1}. {currentQuestion.text}
            </h2>

            {currentQuestion.image && (
              <img
                src={currentQuestion.image}
                alt={tx("Savol rasmi")}
                style={{
                  maxWidth: "100%",
                  maxHeight: "260px",
                  objectFit: "contain",
                  display: "block",
                  marginBottom: "20px",
                  borderRadius: "var(--app-radius-md)",
                  border: "1px solid var(--app-border)",
                }}
              />
            )}

            <div style={{ display: "grid", gap: "14px" }}>
              {currentQuestion.answers.map((answer) => {
                const isSelected = selectedAnswers[currentQuestion.id] === answer.id;

                return (
                  <button
                    key={answer.id}
                    onClick={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                    style={{
                      textAlign: "left",
                      padding: "16px 18px",
                      borderRadius: "8px",
                      border: isSelected
                        ? "2px solid var(--app-primary-strong)"
                        : "1px solid var(--app-border-strong)",
                      background: isSelected
                        ? "var(--app-primary-soft)"
                        : "var(--app-surface)",
                      color: "var(--app-text)",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    {answer.text}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "28px",
                gap: "12px",
              }}
            >
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                style={{
                  background:
                    currentIndex === 0
                      ? "var(--app-control-disabled-bg)"
                      : "var(--app-surface-muted)",
                  color: "var(--app-text)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                  fontSize: "15px",
                }}
              >
                {tx("Oldingi")}
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                style={{
                  background:
                    currentIndex === questions.length - 1
                      ? "var(--app-control-disabled-bg)"
                      : "var(--app-primary-strong)",
                  color:
                    currentIndex === questions.length - 1
                      ? "var(--app-muted-text)"
                      : "var(--app-text-inverse)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  cursor:
                    currentIndex === questions.length - 1 ? "not-allowed" : "pointer",
                  fontSize: "15px",
                }}
              >
                {tx("Keyingi")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestDetail;
