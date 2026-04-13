import TimerCircle from "./TimerCircle";

function SessionSidebar({
  timeLeft,
  formatTime,
  totalTimeSeconds,
  answeredCount,
  totalQuestionsCount,
  filteredQuestions,
  currentQuestionIndex,
  answers,
  onQuestionJump,
  onFinish,
  submitting,
  tx,
}) {
  return (
    <div
      className="test-session-sidebar"
      style={{
        background: "var(--app-surface)",
        border: "1px solid var(--app-border)",
        borderRadius: "var(--app-radius-lg)",
        padding: "22px 18px",
        boxShadow: "var(--app-card-shadow)",
        minHeight: "700px",
      }}
    >
      <TimerCircle
        timeLeft={timeLeft}
        formatTime={formatTime}
        totalTimeSeconds={totalTimeSeconds}
      />

      <div
        style={{
          textAlign: "center",
          marginBottom: "18px",
          color: "var(--app-muted-text)",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        {tx("Javob berilgan")}: <strong>{answeredCount}</strong> /{" "}
        {totalQuestionsCount}
      </div>

      <div
        style={{
          height: "1px",
          background: "var(--app-border)",
          margin: "14px 0 18px",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {filteredQuestions.map((q, index) => {
          const isActive = currentQuestionIndex === index;
          const isAnswered = !!answers[q.id];

          return (
            <button
              key={q.id}
              onClick={() => onQuestionJump(index)}
              style={{
                height: "40px",
                borderRadius: "var(--app-radius-md)",
                border: "none",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                background: isActive
                  ? "var(--app-danger-bg)"
                  : isAnswered
                  ? "var(--app-success)"
                  : "var(--app-surface)",
                color:
                  isActive || isAnswered
                    ? "var(--app-text-inverse)"
                    : "var(--app-text)",
                boxShadow: "var(--app-card-shadow)",
              }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onFinish(false)}
        disabled={submitting}
        style={{
          width: "100%",
          background: "var(--app-primary-strong)",
          color: "var(--app-text-inverse)",
          border: "none",
          borderRadius: "var(--app-radius-md)",
          padding: "15px 16px",
          fontSize: "18px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "var(--app-card-shadow)",
        }}
      >
        {submitting ? tx("Yuborilmoqda...") : tx("Yakunlash")}
      </button>
    </div>
  );
}

export default SessionSidebar;
