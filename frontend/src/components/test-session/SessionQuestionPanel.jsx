function SessionQuestionPanel({
  currentQuestion,
  currentQuestionIndex,
  filteredQuestions,
  answers,
  onSelectAnswer,
  onPrev,
  onNext,
  tx,
}) {
  return (
    <div
      className="test-session-question-panel"
      style={{
        background: "var(--app-surface)",
        border: "1px solid var(--app-border)",
        borderRadius: "var(--app-radius-lg)",
        padding: "22px 20px 18px",
        boxShadow: "var(--app-card-shadow)",
        minHeight: "700px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          border: "1px solid var(--app-border-strong)",
          borderRadius: "var(--app-radius-md)",
          minHeight: "280px",
          maxHeight: "280px",
          overflowY: "auto",
          padding: "18px",
          marginBottom: "18px",
          color: "var(--app-text)",
        }}
      >
        {currentQuestion.image && (
          <div style={{ marginBottom: "16px" }}>
            <img
              src={currentQuestion.image}
              alt={tx("Savol rasmi")}
              style={{
                maxWidth: "100%",
                maxHeight: "220px",
                height: "auto",
                display: "block",
                borderRadius: "var(--app-radius-md)",
                objectFit: "contain",
                marginBottom: "12px",
              }}
            />
          </div>
        )}

        <div
          style={{
            fontSize: "22px",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {currentQuestion.text}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: "12px",
          marginBottom: "18px",
          flex: 1,
          minHeight: 0,
          maxHeight: "300px",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {currentQuestion.answers.map((answer, idx) => {
          const selected = answers[currentQuestion.id] === answer.id;
          const optionLabel = String.fromCharCode(65 + idx);

          return (
            <button
              key={answer.id}
              onClick={() => onSelectAnswer(answer.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "18px 20px",
                borderRadius: "var(--app-radius-lg)",
                border: selected
                  ? "2px solid var(--app-primary-strong)"
                  : "1px solid var(--app-border)",
                background: selected
                  ? "var(--app-primary-soft)"
                  : "var(--app-surface)",
                color: "var(--app-text)",
                fontSize: "18px",
                cursor: "pointer",
                boxShadow: "var(--app-card-shadow)",
                flexShrink: 0,
              }}
            >
              <strong style={{ marginRight: "10px" }}>{optionLabel}</strong>
              {answer.text}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "14px",
        }}
      >
        <button
          onClick={onPrev}
          disabled={currentQuestionIndex === 0}
          style={{
            background:
              currentQuestionIndex === 0
                ? "var(--app-surface)"
                : "var(--app-primary-strong)",
            color:
              currentQuestionIndex === 0
                ? "var(--app-text)"
                : "var(--app-text-inverse)",
            border:
              currentQuestionIndex === 0
                ? "1px solid var(--app-border)"
                : "none",
            borderRadius: "var(--app-radius-md)",
            padding: "12px 30px",
            fontSize: "16px",
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
            boxShadow:
              currentQuestionIndex === 0
                ? "var(--app-card-shadow)"
                : "var(--app-card-shadow-strong)",
          }}
        >
          {tx("Oldingi")}
        </button>

        <button
          onClick={onNext}
          disabled={currentQuestionIndex === filteredQuestions.length - 1}
          style={{
            background:
              currentQuestionIndex === filteredQuestions.length - 1
                ? "var(--app-control-disabled-bg)"
                : "var(--app-primary-strong)",
            color:
              currentQuestionIndex === filteredQuestions.length - 1
                ? "var(--app-muted-text)"
                : "var(--app-text-inverse)",
            border: "none",
            borderRadius: "var(--app-radius-md)",
            padding: "12px 30px",
            fontSize: "16px",
            cursor:
              currentQuestionIndex === filteredQuestions.length - 1
                ? "not-allowed"
                : "pointer",
            boxShadow:
              currentQuestionIndex === filteredQuestions.length - 1
                ? "none"
                : "var(--app-card-shadow-strong)",
          }}
        >
          {tx("Keyingisi")}
        </button>
      </div>
    </div>
  );
}

export default SessionQuestionPanel;
