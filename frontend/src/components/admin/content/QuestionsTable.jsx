import { useMemo } from "react";
import CustomSelect from "../../CustomSelect";
import { useI18n } from "../../../i18n/useI18n";

function QuestionsTable({
  questions,
  answers,
  tests,
  savingId,
  onQuestionFieldChange,
  onSaveQuestion,
  onAnswerFieldChange,
  onSaveAnswer,
  onDeleteQuestion,
  onDeleteAnswer,
}) {
  const { tx } = useI18n();
  const answersByQuestion = useMemo(() => {
    return answers.reduce((groups, answer) => {
      const key = Number(answer.question);
      return {
        ...groups,
        [key]: [...(groups[key] || []), answer],
      };
    }, {});
  }, [answers]);

  return (
    <div className="admin-card">
      <div className="admin-content-list-head">
        <div>
          <h2 className="admin-card-title">{tx("Savollar va javoblar")}</h2>
          <p>{tx("Har bir savol ostida unga tegishli javoblar ko'rsatiladi")}</p>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="admin-table-empty">{tx("Savollar yo'q")}</div>
      ) : (
        <div className="admin-question-stack">
          {questions.map((item, index) => {
            const questionAnswers = answersByQuestion[Number(item.id)] || [];

            return (
              <article className="admin-question-card" key={item.id}>
                <div className="admin-question-card-head">
                  <div>
                    <span className="admin-question-kicker">
                      {tx("Savol")} #{index + 1} / ID {item.id}
                    </span>
                    <h3>
                      {item.text
                        ? item.text.slice(0, 90)
                        : tx("Savol matni")}
                    </h3>
                  </div>
                  <div className="admin-table-actions">
                    <button
                      className="admin-primary-btn"
                      onClick={() => onSaveQuestion(item)}
                      disabled={savingId === `question-${item.id}`}
                    >
                      {savingId === `question-${item.id}`
                        ? tx("Saqlanmoqda...")
                        : tx("Savolni saqlash")}
                    </button>
                    <button
                      className="admin-danger-btn"
                      onClick={() => onDeleteQuestion(item)}
                    >
                      {tx("O'chirish")}
                    </button>
                  </div>
                </div>

                <div className="admin-question-edit-grid">
                  <div className="admin-field">
                    <label>{tx("Test")}</label>
                    <CustomSelect
                      value={item.test}
                      onChange={(value) =>
                        onQuestionFieldChange(item.id, "test", value)
                      }
                      options={tests}
                      placeholder={tx("Testni tanlang")}
                      getOptionLabel={(opt) => opt.title}
                      getOptionValue={(opt) => opt.id}
                    />
                  </div>

                  <div className="admin-field">
                    <label>{tx("Tartib raqami")}</label>
                    <input
                      className="admin-mini-input"
                      type="number"
                      value={item.order}
                      onChange={(e) =>
                        onQuestionFieldChange(item.id, "order", e.target.value)
                      }
                    />
                  </div>

                  <div className="admin-field admin-question-text-field">
                    <label>{tx("Savol matni")}</label>
                    <textarea
                      className="admin-textarea"
                      rows={3}
                      value={item.text || ""}
                      onChange={(e) =>
                        onQuestionFieldChange(item.id, "text", e.target.value)
                      }
                    />
                  </div>

                  <div className="admin-field">
                    <label>{tx("Savol rasmi")}</label>
                    <div className="admin-question-image-cell">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={tx("Savol rasmi")}
                          className="admin-question-image-preview"
                        />
                      )}
                      <input
                        className="admin-file-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          onQuestionFieldChange(
                            item.id,
                            "imageFile",
                            e.target.files?.[0] || null
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-answer-group">
                  <div className="admin-answer-group-title">
                    <h4>{tx("Ushbu savol javoblari")}</h4>
                    <span>
                      {questionAnswers.length} {tx("ta javob")}
                    </span>
                  </div>

                  {questionAnswers.length === 0 ? (
                    <p className="admin-empty-note">{tx("Javoblar yo'q")}</p>
                  ) : (
                    <div className="admin-answer-list">
                      {questionAnswers.map((answer, answerIndex) => (
                        <div className="admin-answer-row" key={answer.id}>
                          <span className="admin-answer-index">
                            {String.fromCharCode(65 + answerIndex)}
                          </span>
                          <input
                            className="admin-input"
                            value={answer.text}
                            onChange={(e) =>
                              onAnswerFieldChange(
                                answer.id,
                                "text",
                                e.target.value
                              )
                            }
                          />
                          <CustomSelect
                            value={answer.question}
                            onChange={(value) =>
                              onAnswerFieldChange(answer.id, "question", value)
                            }
                            options={questions}
                            placeholder={tx("Savolni tanlang")}
                            getOptionLabel={(opt) =>
                              opt.text?.length > 60
                                ? `${opt.text.slice(0, 60)}...`
                                : opt.text || `ID ${opt.id}`
                            }
                            getOptionValue={(opt) => opt.id}
                          />
                          <label className="admin-status-check">
                            <input
                              type="checkbox"
                              checked={answer.is_correct}
                              onChange={(e) =>
                                onAnswerFieldChange(
                                  answer.id,
                                  "is_correct",
                                  e.target.checked
                                )
                              }
                            />
                            {answer.is_correct ? tx("To'g'ri") : tx("Noto'g'ri")}
                          </label>
                          <button
                            className="admin-primary-btn"
                            onClick={() => onSaveAnswer(answer)}
                            disabled={savingId === `answer-${answer.id}`}
                          >
                            {savingId === `answer-${answer.id}`
                              ? tx("Saqlanmoqda...")
                              : tx("Saqlash")}
                          </button>
                          <button
                            className="admin-danger-btn"
                            onClick={() => onDeleteAnswer(answer)}
                          >
                            {tx("O'chirish")}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QuestionsTable;
