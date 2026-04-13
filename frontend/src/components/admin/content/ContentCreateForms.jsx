import CustomSelect from "../../CustomSelect";
import { useI18n } from "../../../i18n/useI18n";

function ContentCreateForms({
  directions,
  subjects,
  tests,
  questions,
  classOptions,
  classLoading,
  newDirection,
  setNewDirection,
  newSubject,
  setNewSubject,
  newTest,
  setNewTest,
  newQuestion,
  setNewQuestion,
  newAnswer,
  setNewAnswer,
  onCreateDirection,
  onCreateSubject,
  onCreateTest,
  onCreateQuestion,
  onCreateAnswer,
}) {
  const { tx } = useI18n();

  return (
    <div className="admin-card">
      <h2 className="admin-card-title">
        {tx("Yo'nalish / Fan / Test / Savol / Javob qo'shish")}
      </h2>

      <div className="admin-content-create">
        <div className="admin-content-step">
          <div className="admin-content-step-head">
            <span>1</span>
            <h3>{tx("Yo'nalish")}</h3>
          </div>
          <div className="admin-field">
            <label>{tx("Yo'nalish nomi (UZ)")}</label>
            <input
              className="admin-input"
              value={newDirection.name_uz}
              onChange={(e) =>
                setNewDirection((p) => ({ ...p, name_uz: e.target.value }))
              }
            />
          </div>
          <div className="admin-field">
            <label>{tx("Yo'nalish nomi (RU)")}</label>
            <input
              className="admin-input"
              value={newDirection.name_ru}
              onChange={(e) =>
                setNewDirection((p) => ({ ...p, name_ru: e.target.value }))
              }
            />
          </div>
          <button className="admin-primary-btn" onClick={onCreateDirection}>
            {tx("Yo'nalish qo'shish")}
          </button>
        </div>

        <div className="admin-content-step">
          <div className="admin-content-step-head">
            <span>2</span>
            <h3>{tx("Fan")}</h3>
          </div>
          <div className="admin-field">
            <label>{tx("Yo'nalish")}</label>
            <CustomSelect
              value={newSubject.direction}
              onChange={(value) =>
                setNewSubject((p) => ({ ...p, direction: value }))
              }
              options={directions}
              placeholder={tx("Yo'nalishni tanlang")}
              getOptionLabel={(item) => item.name_uz}
              getOptionValue={(item) => item.id}
            />
          </div>
          <div className="admin-field">
            <label>{tx("Fan nomi (UZ)")}</label>
            <input
              className="admin-input"
              value={newSubject.name_uz}
              onChange={(e) =>
                setNewSubject((p) => ({ ...p, name_uz: e.target.value }))
              }
            />
          </div>
          <button className="admin-primary-btn" onClick={onCreateSubject}>
            {tx("Fan qo'shish")}
          </button>
        </div>

        <div className="admin-content-step admin-content-step-wide">
          <div className="admin-content-step-head">
            <span>3</span>
            <h3>{tx("Test")}</h3>
          </div>
          <div className="admin-field">
            <label>{tx("Sinf")}</label>
            <CustomSelect
              value={newTest.school_class}
              onChange={(value) =>
                setNewTest((p) => ({ ...p, school_class: value }))
              }
              options={classOptions}
              placeholder={
                classLoading ? tx("Yuklanmoqda...") : tx("Sinfni tanlang")
              }
              getOptionLabel={(item) => item.label}
              getOptionValue={(item) => item.id}
            />
          </div>
          <div className="admin-field">
            <label>{tx("Fan")}</label>
            <CustomSelect
              value={newTest.subject}
              onChange={(value) =>
                setNewTest((p) => ({ ...p, subject: value }))
              }
              options={subjects}
              placeholder={tx("Fanni tanlang")}
              getOptionLabel={(item) => item.name_uz}
              getOptionValue={(item) => item.id}
            />
          </div>
          <div className="admin-field">
            <label>{tx("Test nomi")}</label>
            <input
              className="admin-input"
              value={newTest.title}
              onChange={(e) =>
                setNewTest((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>
          <div className="admin-field">
            <label>{tx("Vaqt (min)")}</label>
            <input
              className="admin-input"
              type="number"
              value={newTest.duration_minutes}
              onChange={(e) =>
                setNewTest((p) => ({
                  ...p,
                  duration_minutes: e.target.value,
                }))
              }
            />
          </div>
          <button className="admin-primary-btn" onClick={onCreateTest}>
            {tx("Test qo'shish")}
          </button>
        </div>

        <div className="admin-content-step admin-content-step-wide">
          <div className="admin-content-step-head">
            <span>4</span>
            <h3>{tx("Savol")}</h3>
          </div>
          <div className="admin-field">
            <label>{tx("Test")}</label>
            <CustomSelect
              value={newQuestion.test}
              onChange={(value) =>
                setNewQuestion((p) => ({ ...p, test: value }))
              }
              options={tests}
              placeholder={tx("Testni tanlang")}
              getOptionLabel={(item) => item.title}
              getOptionValue={(item) => item.id}
            />
          </div>
          <div className="admin-field">
            <label>{tx("Savol matni")}</label>
            <textarea
              className="admin-textarea"
              rows={4}
              value={newQuestion.text}
              onChange={(e) =>
                setNewQuestion((p) => ({ ...p, text: e.target.value }))
              }
            />
          </div>
          <div className="admin-field">
            <label>{tx("Tartib raqami")}</label>
            <input
              className="admin-input"
              type="number"
              value={newQuestion.order}
              onChange={(e) =>
                setNewQuestion((p) => ({ ...p, order: e.target.value }))
              }
            />
          </div>
          <div className="admin-field">
            <label>{tx("Savol rasmi")}</label>
            <input
              key={newQuestion.image ? "question-image-selected" : "question-image-empty"}
              className="admin-input"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewQuestion((p) => ({
                  ...p,
                  image: e.target.files?.[0] || null,
                }))
              }
            />
          </div>
          <button className="admin-primary-btn" onClick={onCreateQuestion}>
            {tx("Savol qo'shish")}
          </button>
        </div>

        <div className="admin-content-step admin-content-step-wide">
          <div className="admin-content-step-head">
            <span>5</span>
            <h3>{tx("Javoblar")}</h3>
          </div>
          <div className="admin-field">
            <label>{tx("Savol")}</label>
            <CustomSelect
              value={newAnswer.question}
              onChange={(value) =>
                setNewAnswer((p) => ({ ...p, question: value }))
              }
              options={questions}
              placeholder={tx("Savolni tanlang")}
              getOptionLabel={(item) =>
                item.text?.length > 70
                  ? `${item.text.slice(0, 70)}...`
                  : item.text
              }
              getOptionValue={(item) => item.id}
            />
          </div>
          <div className="admin-field">
            <label>{tx("Javob matni")}</label>
            <input
              className="admin-input"
              value={newAnswer.text}
              onChange={(e) =>
                setNewAnswer((p) => ({ ...p, text: e.target.value }))
              }
            />
          </div>
          <div className="admin-check-row">
            <label className="admin-check-label">
              <input
                type="checkbox"
                checked={newAnswer.is_correct}
                onChange={(e) =>
                  setNewAnswer((p) => ({
                    ...p,
                    is_correct: e.target.checked,
                  }))
                }
              />
              {tx("To'g'ri javob")}
            </label>
          </div>
          <button className="admin-primary-btn" onClick={onCreateAnswer}>
            {tx("Javob qo'shish")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentCreateForms;
