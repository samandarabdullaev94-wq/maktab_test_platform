import { useEffect, useMemo, useState } from "react";
import CustomSelect from "./CustomSelect";
import { useI18n } from "../i18n/useI18n";
import api from "../utils/api";

const groupByParent = (items, getParentId) =>
  items.reduce((groups, item) => {
    const key = Number(getParentId(item));

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(item);
    return groups;
  }, {});

function TestContentManager({ classes = [], classLoading = false }) {
  const { tx } = useI18n();

  const [directions, setDirections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [newDirection, setNewDirection] = useState({
    name_uz: "",
    name_ru: "",
    is_active: true,
  });

  const [newSubject, setNewSubject] = useState({
    direction: "",
    name_uz: "",
    name_ru: "",
    is_active: true,
  });

  const [newTest, setNewTest] = useState({
    school_class: "",
    subject: "",
    title: "",
    duration_minutes: 20,
    is_active: true,
  });

  const [newQuestion, setNewQuestion] = useState({
    test: "",
    text: "",
    order: 1,
    image: null,
  });

  const [newAnswer, setNewAnswer] = useState({
    question: "",
    text: "",
    is_correct: false,
  });

  const [savingId, setSavingId] = useState(null);
  const [managerPath, setManagerPath] = useState({
    directionId: null,
    subjectId: null,
    testId: null,
    questionId: null,
  });
  const [openAddForm, setOpenAddForm] = useState({
    direction: false,
    subject: null,
    test: null,
    question: null,
    answer: null,
  });

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [directionsRes, subjectsRes, testsRes, questionsRes, answersRes] =
        await Promise.all([
          api.get("admin/directions/"),
          api.get("admin/subjects/"),
          api.get("admin/tests/"),
          api.get("admin/questions/"),
          api.get("admin/answers/"),
        ]);

      setDirections(directionsRes.data);
      setSubjects(subjectsRes.data);
      setTests(testsRes.data);
      setQuestions(questionsRes.data);
      setAnswers(answersRes.data);
    } catch (error) {
      console.error("Test content manager yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const setNodeExpanded = (level, id) => {
    const numericId = Number(id);

    setManagerPath((prev) => {
      if (level === "directions") {
        return {
          directionId: numericId,
          subjectId: null,
          testId: null,
          questionId: null,
        };
      }

      if (level === "subjects") {
        return {
          ...prev,
          subjectId: numericId,
          testId: null,
          questionId: null,
        };
      }

      if (level === "tests") {
        return {
          ...prev,
          testId: numericId,
          questionId: null,
        };
      }

      if (level === "questions") {
        return {
          ...prev,
          questionId: numericId,
        };
      }

      return prev;
    });
  };

  const toggleAddForm = (level, id = true) => {
    setOpenAddForm((prev) => ({
      ...prev,
      [level]: prev[level] === id ? null : id,
    }));
  };

  const handleDirectionFieldChange = (id, field, value) => {
    setDirections((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubjectFieldChange = (id, field, value) => {
    setSubjects((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleTestFieldChange = (id, field, value) => {
    setTests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleQuestionFieldChange = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAnswerFieldChange = (id, field, value) => {
    setAnswers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const getDeleteErrorMessage = (error) =>
    error.response?.data?.error || tx("O'chirishda xatolik yuz berdi");

  const handleDelete = async (endpoint, confirmMessage, onSuccess) => {
    if (!window.confirm(tx(confirmMessage))) {
      return;
    }

    try {
      await api.delete(endpoint);
      onSuccess();
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
      alert(getDeleteErrorMessage(error));
    }
  };

  const handleCreateDirection = async () => {
    try {
      const res = await api.post("admin/directions/", {
        ...newDirection,
      });
      setDirections((prev) => [...prev, res.data]);
      setNodeExpanded("directions", res.data.id);
      setNewDirection({
        name_uz: "",
        name_ru: "",
        is_active: true,
      });
    } catch (error) {
      console.error(error);
      alert(tx("Yo'nalish qo'shishda xatolik"));
    }
  };

  const handleCreateSubject = async (overrides = {}) => {
    const subjectData = { ...newSubject, ...overrides };

    try {
      const res = await api.post("admin/subjects/", {
        ...subjectData,
        direction: Number(subjectData.direction),
      });
      setSubjects((prev) => [...prev, res.data]);
      setNodeExpanded("directions", res.data.direction ?? subjectData.direction);
      setNodeExpanded("subjects", res.data.id);
      setNewSubject({
        direction: "",
        name_uz: "",
        name_ru: "",
        is_active: true,
      });
    } catch (error) {
      console.error(error);
      alert(tx("Fan qo'shishda xatolik"));
    }
  };

  const handleCreateTest = async (overrides = {}) => {
    const testData = { ...newTest, ...overrides };

    try {
      const res = await api.post("admin/tests/", {
        ...testData,
        school_class: Number(testData.school_class),
        subject: Number(testData.subject),
        duration_minutes: Number(testData.duration_minutes),
      });
      setTests((prev) => [res.data, ...prev]);
      setNodeExpanded("subjects", res.data.subject ?? testData.subject);
      setNodeExpanded("tests", res.data.id);
      setNewTest({
        school_class: "",
        subject: "",
        title: "",
        duration_minutes: 20,
        is_active: true,
      });
    } catch (error) {
      console.error(error);
      alert(tx("Test qo'shishda xatolik"));
    }
  };

  const handleCreateQuestion = async (overrides = {}) => {
    const questionData = { ...newQuestion, ...overrides };

    try {
      const payload = new FormData();
      payload.append("test", Number(questionData.test));
      payload.append("text", questionData.text);
      payload.append("order", Number(questionData.order));

      if (questionData.image) {
        payload.append("image", questionData.image);
      }

      const res = await api.post("admin/questions/", payload);
      setQuestions((prev) => [res.data, ...prev]);
      setNodeExpanded("tests", res.data.test ?? questionData.test);
      setNodeExpanded("questions", res.data.id);
      setNewQuestion({
        test: "",
        text: "",
        order: 1,
        image: null,
      });
    } catch (error) {
      console.error(error);
      alert(tx("Savol qo'shishda xatolik"));
    }
  };

  const handleCreateAnswer = async (overrides = {}) => {
    const answerData = { ...newAnswer, ...overrides };

    try {
      const res = await api.post("admin/answers/", {
        ...answerData,
        question: Number(answerData.question),
      });
      setAnswers((prev) => [res.data, ...prev]);
      setNodeExpanded("questions", res.data.question ?? answerData.question);
      setNewAnswer({
        question: "",
        text: "",
        is_correct: false,
      });
    } catch (error) {
      console.error(error);
      alert(tx("Javob qo'shishda xatolik"));
    }
  };

  const handleSaveDirection = async (item) => {
    try {
      setSavingId(`direction-${item.id}`);
      const res = await api.patch(`admin/directions/${item.id}/`, {
        name_uz: item.name_uz,
        name_ru: item.name_ru,
        is_active: item.is_active,
      });
      setDirections((prev) =>
        prev.map((direction) =>
          direction.id === item.id ? res.data : direction
        )
      );
    } catch (error) {
      console.error(error);
      alert(tx("Yo'nalishni saqlashda xatolik"));
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveSubject = async (item) => {
    try {
      setSavingId(`subject-${item.id}`);
      const res = await api.patch(`admin/subjects/${item.id}/`, {
        direction: Number(item.direction),
        name_uz: item.name_uz,
        name_ru: item.name_ru,
        is_active: item.is_active,
      });
      setSubjects((prev) =>
        prev.map((subject) => (subject.id === item.id ? res.data : subject))
      );
    } catch (error) {
      console.error(error);
      alert(tx("Fanni saqlashda xatolik"));
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveTest = async (item) => {
    try {
      setSavingId(`test-${item.id}`);
      const res = await api.patch(`admin/tests/${item.id}/`, {
        school_class: Number(item.school_class),
      });
      setTests((prev) =>
        prev.map((test) => (test.id === item.id ? res.data : test))
      );
    } catch (error) {
      console.error(error);
      alert(tx("Testni saqlashda xatolik yuz berdi"));
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveQuestion = async (item) => {
    try {
      setSavingId(`question-${item.id}`);

      let res;
      if (item.imageFile) {
        const payload = new FormData();
        payload.append("test", Number(item.test));
        payload.append("text", item.text);
        payload.append("order", Number(item.order));
        payload.append("image", item.imageFile);
        res = await api.patch(`admin/questions/${item.id}/`, payload);
      } else {
        res = await api.patch(`admin/questions/${item.id}/`, {
          test: Number(item.test),
          text: item.text,
          order: Number(item.order),
        });
      }

      setQuestions((prev) =>
        prev.map((question) => (question.id === item.id ? res.data : question))
      );
    } catch (error) {
      console.error(error);
      alert(tx("Savolni saqlashda xatolik"));
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAnswer = async (item) => {
    try {
      setSavingId(`answer-${item.id}`);
      const res = await api.patch(`admin/answers/${item.id}/`, {
        question: Number(item.question),
        text: item.text,
        is_correct: item.is_correct,
      });
      setAnswers((prev) =>
        prev.map((answer) => (answer.id === item.id ? res.data : answer))
      );
    } catch (error) {
      console.error(error);
      alert(tx("Javobni saqlashda xatolik"));
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteDirection = (item) => {
    handleDelete(
      `admin/directions/${item.id}/`,
      "Yo'nalishni o'chirishni tasdiqlaysizmi?",
      () => {
        setDirections((prev) =>
          prev.filter((direction) => direction.id !== item.id)
        );

        if (Number(managerPath.directionId) === Number(item.id)) {
          setManagerPath({
            directionId: null,
            subjectId: null,
            testId: null,
            questionId: null,
          });
        }
      }
    );
  };

  const handleDeleteSubject = (item) => {
    handleDelete(
      `admin/subjects/${item.id}/`,
      "Fanni o'chirishni tasdiqlaysizmi?",
      () => {
        setSubjects((prev) =>
          prev.filter((subject) => subject.id !== item.id)
        );

        if (Number(managerPath.subjectId) === Number(item.id)) {
          setManagerPath((prev) => ({
            ...prev,
            subjectId: null,
            testId: null,
            questionId: null,
          }));
        }
      }
    );
  };

  const handleDeleteTest = (item) => {
    handleDelete(
      `admin/tests/${item.id}/`,
      "Testni o'chirishni tasdiqlaysizmi?",
      () => {
        setTests((prev) => prev.filter((test) => test.id !== item.id));

        if (Number(managerPath.testId) === Number(item.id)) {
          setManagerPath((prev) => ({
            ...prev,
            testId: null,
            questionId: null,
          }));
        }
      }
    );
  };

  const handleDeleteQuestion = (item) => {
    handleDelete(
      `admin/questions/${item.id}/`,
      "Savolni o'chirishni tasdiqlaysizmi?",
      () => {
        setQuestions((prev) =>
          prev.filter((question) => question.id !== item.id)
        );
        setAnswers((prev) =>
          prev.filter((answer) => Number(answer.question) !== Number(item.id))
        );

        if (Number(managerPath.questionId) === Number(item.id)) {
          setManagerPath((prev) => ({
            ...prev,
            questionId: null,
          }));
        }
      }
    );
  };

  const handleDeleteAnswer = (item) => {
    handleDelete(
      `admin/answers/${item.id}/`,
      "Javobni o'chirishni tasdiqlaysizmi?",
      () => setAnswers((prev) => prev.filter((answer) => answer.id !== item.id))
    );
  };

  const classOptions = useMemo(
    () =>
      classes.map((item) => ({
        id: item.id,
        label: `${item.school_name} - ${item.name}-sinf`,
      })),
    [classes]
  );

  const subjectsByDirection = useMemo(
    () => groupByParent(subjects, (subject) => subject.direction),
    [subjects]
  );

  const testsBySubject = useMemo(
    () => groupByParent(tests, (test) => test.subject),
    [tests]
  );

  const questionsByTest = useMemo(
    () => groupByParent(questions, (question) => question.test),
    [questions]
  );

  const answersByQuestion = useMemo(
    () => groupByParent(answers, (answer) => answer.question),
    [answers]
  );

  const testOptions = useMemo(
    () =>
      tests.map((test) => ({
        id: test.id,
        label: `${test.title} (${test.class_name || tx("Sinf")})`,
      })),
    [tests, tx]
  );

  const questionOptions = useMemo(
    () =>
      questions.map((question) => ({
        id: question.id,
        label: `#${question.id} - ${question.text}`,
      })),
    [questions]
  );

  const selectedDirection = directions.find(
    (direction) => Number(direction.id) === Number(managerPath.directionId)
  );
  const selectedSubject = subjects.find(
    (subject) => Number(subject.id) === Number(managerPath.subjectId)
  );
  const selectedTest = tests.find(
    (test) => Number(test.id) === Number(managerPath.testId)
  );
  const selectedQuestion = questions.find(
    (question) => Number(question.id) === Number(managerPath.questionId)
  );

  const currentSubjects = selectedDirection
    ? subjectsByDirection[selectedDirection.id] || []
    : [];
  const currentTests = selectedSubject
    ? testsBySubject[selectedSubject.id] || []
    : [];
  const currentQuestions = selectedTest
    ? questionsByTest[selectedTest.id] || []
    : [];
  const currentAnswers = selectedQuestion
    ? answersByQuestion[selectedQuestion.id] || []
    : [];

  const getClassLabel = (test) => {
    const selectedClass = classOptions.find(
      (item) => Number(item.id) === Number(test?.school_class)
    );

    return selectedClass?.label || test?.class_name || tx("Sinf biriktirilmagan");
  };

  const getQuestionPreview = (question) => {
    const text = question.text || tx("Savol matni yo'q");
    return text.length > 120 ? `${text.slice(0, 120)}...` : text;
  };

  const goToDirections = () =>
    setManagerPath({
      directionId: null,
      subjectId: null,
      testId: null,
      questionId: null,
    });

  const goToDirection = (directionId) =>
    setManagerPath({
      directionId: Number(directionId),
      subjectId: null,
      testId: null,
      questionId: null,
    });

  const goToSubject = (subjectId) =>
    setManagerPath((prev) => ({
      ...prev,
      subjectId: Number(subjectId),
      testId: null,
      questionId: null,
    }));

  const goToTest = (testId) =>
    setManagerPath((prev) => ({
      ...prev,
      testId: Number(testId),
      questionId: null,
    }));

  const goToQuestion = (questionId) =>
    setManagerPath((prev) => ({
      ...prev,
      questionId: Number(questionId),
    }));

  const breadcrumbItems = [
    {
      label: tx("Yo'nalishlar"),
      onClick: goToDirections,
      active: !selectedDirection,
    },
  ];

  if (selectedDirection) {
    breadcrumbItems.push({
      label: selectedDirection.name_uz || selectedDirection.name_ru || tx("Yo'nalish"),
      onClick: () => goToDirection(selectedDirection.id),
      active: !selectedSubject,
    });
  }

  if (selectedSubject) {
    breadcrumbItems.push({
      label: selectedSubject.name_uz || selectedSubject.name_ru || tx("Fan"),
      onClick: () => goToSubject(selectedSubject.id),
      active: !selectedTest,
    });
  }

  if (selectedTest) {
    breadcrumbItems.push({
      label: selectedTest.title || tx("Test"),
      onClick: () => goToTest(selectedTest.id),
      active: !selectedQuestion,
    });
  }

  if (selectedQuestion) {
    breadcrumbItems.push({
      label: `${tx("Savol")} #${selectedQuestion.order || selectedQuestion.id}`,
      active: true,
    });
  }

  const renderDrillShell = (content) => (
    <div className="admin-card admin-drill-card">
      <div className="admin-content-list-head admin-drill-head">
        <div>
          <h2 className="admin-card-title">{tx("Yo'nalish / Fan / Test / Savol / Javob")}</h2>
          <p>{tx("Har bir bosqich alohida ochiladi va faqat tanlangan kontent ko'rsatiladi")}</p>
          <nav className="admin-drill-breadcrumb" aria-label={tx("Kontent yo'li")}>
            {breadcrumbItems.map((item, index) => (
              <span className="admin-drill-breadcrumb-item" key={`${item.label}-${index}`}>
                {index > 0 && <span className="admin-drill-breadcrumb-separator">/</span>}
                {item.onClick && !item.active ? (
                  <button type="button" onClick={item.onClick}>{item.label}</button>
                ) : (
                  <strong>{item.label}</strong>
                )}
              </span>
            ))}
          </nav>
        </div>
        {!selectedDirection && <button type="button" className="admin-primary-btn" onClick={() => toggleAddForm("direction")}>+ {tx("Yo'nalish qo'shish")}</button>}
        {selectedDirection && !selectedSubject && <button type="button" className="admin-primary-btn" onClick={() => toggleAddForm("subject", selectedDirection.id)}>+ {tx("Fan qo'shish")}</button>}
        {selectedSubject && !selectedTest && <button type="button" className="admin-primary-btn" onClick={() => toggleAddForm("test", selectedSubject.id)}>+ {tx("Test qo'shish")}</button>}
        {selectedTest && !selectedQuestion && <button type="button" className="admin-primary-btn" onClick={() => toggleAddForm("question", selectedTest.id)}>+ {tx("Savol qo'shish")}</button>}
        {selectedQuestion && <button type="button" className="admin-primary-btn" onClick={() => toggleAddForm("answer", selectedQuestion.id)}>+ {tx("Javob qo'shish")}</button>}
      </div>
      {content}
    </div>
  );

  if (loading) {
    return (
      <div className="admin-card">
        <p>{tx("Yuklanmoqda...")}</p>
      </div>
    );
  }

  if (!selectedDirection) {
    return renderDrillShell(
      <section className="admin-drill-screen">
        {openAddForm.direction && (
          <div className="admin-drill-add-form">
            <input className="admin-input" value={newDirection.name_uz} onChange={(event) => setNewDirection((prev) => ({ ...prev, name_uz: event.target.value }))} placeholder={tx("Yo'nalish nomi (UZ)")} />
            <input className="admin-input" value={newDirection.name_ru} onChange={(event) => setNewDirection((prev) => ({ ...prev, name_ru: event.target.value }))} placeholder={tx("Yo'nalish nomi (RU)")} />
            <label className="admin-check-field"><input type="checkbox" checked={newDirection.is_active} onChange={(event) => setNewDirection((prev) => ({ ...prev, is_active: event.target.checked }))} />{tx("Faol")}</label>
            <button type="button" className="admin-primary-btn" onClick={handleCreateDirection}>+ {tx("Yo'nalish")}</button>
          </div>
        )}

        {directions.length === 0 ? (
          <div className="admin-table-empty">{tx("Yo'nalishlar topilmadi")}</div>
        ) : (
          <div className="admin-drill-list">
            {directions.map((direction) => {
              const directionSubjects = subjectsByDirection[direction.id] || [];

              return (
                <article className="admin-drill-row" key={direction.id}>
                  <div className="admin-drill-row-main">
                    <div className="admin-drill-row-title">
                      <strong>{direction.name_uz || direction.name_ru || tx("Yo'nalish")}</strong>
                      <span>{directionSubjects.length} {tx("fan")}</span>
                    </div>
                    <span className={direction.is_active ? "admin-status-pill active" : "admin-status-pill"}>
                      {direction.is_active ? tx("Faol") : tx("Nofaol")}
                    </span>
                  </div>
                  <div className="admin-drill-edit-grid admin-drill-edit-grid-3">
                    <input className="admin-input" value={direction.name_uz} onChange={(event) => handleDirectionFieldChange(direction.id, "name_uz", event.target.value)} placeholder={tx("UZ nomi")} />
                    <input className="admin-input" value={direction.name_ru} onChange={(event) => handleDirectionFieldChange(direction.id, "name_ru", event.target.value)} placeholder={tx("RU nomi")} />
                    <label className="admin-check-field"><input type="checkbox" checked={direction.is_active} onChange={(event) => handleDirectionFieldChange(direction.id, "is_active", event.target.checked)} />{tx("Faol")}</label>
                  </div>
                  <div className="admin-table-actions admin-drill-actions">
                    <button type="button" className="admin-primary-btn" disabled={savingId === `direction-${direction.id}`} onClick={() => handleSaveDirection(direction)}>{savingId === `direction-${direction.id}` ? tx("Saqlanmoqda...") : tx("Saqlash")}</button>
                    <button type="button" className="admin-danger-btn" onClick={() => handleDeleteDirection(direction)}>{tx("O'chirish")}</button>
                    <button type="button" className="admin-secondary-btn" onClick={() => goToDirection(direction.id)}>{tx("Ochish")} -&gt;</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  if (selectedDirection && !selectedSubject) {
    return renderDrillShell(
      <section className="admin-drill-screen">
        {openAddForm.subject === selectedDirection.id && (
          <div className="admin-drill-add-form">
            <input className="admin-input" value={newSubject.name_uz} onChange={(event) => setNewSubject((prev) => ({ ...prev, name_uz: event.target.value }))} placeholder={tx("Fan nomi (UZ)")} />
            <input className="admin-input" value={newSubject.name_ru} onChange={(event) => setNewSubject((prev) => ({ ...prev, name_ru: event.target.value }))} placeholder={tx("Fan nomi (RU)")} />
            <label className="admin-check-field"><input type="checkbox" checked={newSubject.is_active} onChange={(event) => setNewSubject((prev) => ({ ...prev, is_active: event.target.checked }))} />{tx("Faol")}</label>
            <button type="button" className="admin-primary-btn" onClick={() => handleCreateSubject({ direction: selectedDirection.id })}>+ {tx("Fan")}</button>
          </div>
        )}

        {currentSubjects.length === 0 ? (
          <div className="admin-table-empty">{tx("Fanlar topilmadi")}</div>
        ) : (
          <div className="admin-drill-list">
            {currentSubjects.map((subject) => {
              const subjectTests = testsBySubject[subject.id] || [];

              return (
                <article className="admin-drill-row" key={subject.id}>
                  <div className="admin-drill-row-main">
                    <div className="admin-drill-row-title">
                      <strong>{subject.name_uz || subject.name_ru || tx("Fan")}</strong>
                      <span>{subjectTests.length} {tx("test")}</span>
                    </div>
                    <span className={subject.is_active ? "admin-status-pill active" : "admin-status-pill"}>
                      {subject.is_active ? tx("Faol") : tx("Nofaol")}
                    </span>
                  </div>
                  <div className="admin-drill-edit-grid admin-drill-edit-grid-4">
                    <input className="admin-input" value={subject.name_uz} onChange={(event) => handleSubjectFieldChange(subject.id, "name_uz", event.target.value)} placeholder={tx("UZ nomi")} />
                    <input className="admin-input" value={subject.name_ru} onChange={(event) => handleSubjectFieldChange(subject.id, "name_ru", event.target.value)} placeholder={tx("RU nomi")} />
                    <CustomSelect value={subject.direction} onChange={(value) => handleSubjectFieldChange(subject.id, "direction", value)} options={directions} placeholder={tx("Yo'nalish tanlang")} getOptionLabel={(item) => item.name_uz || item.name_ru || `#${item.id}`} getOptionValue={(item) => item.id} />
                    <label className="admin-check-field"><input type="checkbox" checked={subject.is_active} onChange={(event) => handleSubjectFieldChange(subject.id, "is_active", event.target.checked)} />{tx("Faol")}</label>
                  </div>
                  <div className="admin-table-actions admin-drill-actions">
                    <button type="button" className="admin-primary-btn" disabled={savingId === `subject-${subject.id}`} onClick={() => handleSaveSubject(subject)}>{savingId === `subject-${subject.id}` ? tx("Saqlanmoqda...") : tx("Saqlash")}</button>
                    <button type="button" className="admin-danger-btn" onClick={() => handleDeleteSubject(subject)}>{tx("O'chirish")}</button>
                    <button type="button" className="admin-secondary-btn" onClick={() => goToSubject(subject.id)}>{tx("Ochish")} -&gt;</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  if (selectedSubject && !selectedTest) {
    return renderDrillShell(
      <section className="admin-drill-screen">
        {openAddForm.test === selectedSubject.id && (
          <div className="admin-drill-add-form admin-drill-add-form-test">
            <input className="admin-input" value={newTest.title} onChange={(event) => setNewTest((prev) => ({ ...prev, title: event.target.value }))} placeholder={tx("Test nomi")} />
            <CustomSelect value={newTest.school_class} onChange={(value) => setNewTest((prev) => ({ ...prev, school_class: value }))} options={classOptions} placeholder={classLoading ? tx("Sinflar yuklanmoqda...") : tx("Sinf tanlang")} disabled={classLoading} getOptionLabel={(item) => item.label} getOptionValue={(item) => item.id} />
            <input className="admin-input" type="number" value={newTest.duration_minutes} onChange={(event) => setNewTest((prev) => ({ ...prev, duration_minutes: event.target.value }))} placeholder={tx("Davomiylik")} />
            <label className="admin-check-field"><input type="checkbox" checked={newTest.is_active} onChange={(event) => setNewTest((prev) => ({ ...prev, is_active: event.target.checked }))} />{tx("Faol")}</label>
            <button type="button" className="admin-primary-btn" onClick={() => handleCreateTest({ subject: selectedSubject.id })}>+ {tx("Test")}</button>
          </div>
        )}

        {currentTests.length === 0 ? (
          <div className="admin-table-empty">{tx("Testlar topilmadi")}</div>
        ) : (
          <div className="admin-drill-list">
            {currentTests.map((test) => {
              const testQuestions = questionsByTest[test.id] || [];

              return (
                <article className="admin-drill-row admin-drill-row-test" key={test.id}>
                  <div className="admin-drill-row-main">
                    <div className="admin-drill-row-title">
                      <strong>{test.title || tx("Test")}</strong>
                      <span>{getClassLabel(test)}</span>
                    </div>
                    <div className="admin-drill-badges">
                      <span className={test.is_active ? "admin-status-pill active" : "admin-status-pill"}>
                        {test.is_active ? tx("Faol") : tx("Nofaol")}
                      </span>
                      <span>{testQuestions.length} {tx("savol")}</span>
                    </div>
                  </div>
                  <div className="admin-test-assignment-panel">
                    <div>
                      <span>{tx("Biriktirilgan sinf")}</span>
                      <strong>{getClassLabel(test)}</strong>
                    </div>
                    <CustomSelect
                      value={test.school_class || ""}
                      onChange={(value) => handleTestFieldChange(test.id, "school_class", value)}
                      options={classOptions}
                      placeholder={classLoading ? tx("Sinflar yuklanmoqda...") : tx("Sinf tanlang")}
                      disabled={classLoading}
                      getOptionLabel={(item) => item.label}
                      getOptionValue={(item) => item.id}
                    />
                  </div>
                  <div className="admin-table-actions admin-drill-actions">
                    <button type="button" className="admin-primary-btn" disabled={savingId === `test-${test.id}`} onClick={() => handleSaveTest(test)}>{savingId === `test-${test.id}` ? tx("Saqlanmoqda...") : tx("Saqlash")}</button>
                    <button type="button" className="admin-danger-btn" onClick={() => handleDeleteTest(test)}>{tx("O'chirish")}</button>
                    <button type="button" className="admin-secondary-btn" onClick={() => goToTest(test.id)}>{tx("Ochish")} -&gt;</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  if (selectedTest && !selectedQuestion) {
    return renderDrillShell(
      <section className="admin-drill-screen">
        <div className="admin-test-focus-panel">
          <div>
            <span>{tx("Test")}</span>
            <strong>{selectedTest.title || tx("Test")}</strong>
          </div>
          <div>
            <span>{tx("Sinf")}</span>
            <strong>{getClassLabel(selectedTest)}</strong>
          </div>
          <div>
            <span>{tx("Holat")}</span>
            <strong>{selectedTest.is_active ? tx("Faol") : tx("Nofaol")}</strong>
          </div>
        </div>

        {openAddForm.question === selectedTest.id && (
          <div className="admin-drill-add-form admin-question-create-form">
            <input className="admin-input" type="number" value={newQuestion.order} onChange={(event) => setNewQuestion((prev) => ({ ...prev, order: event.target.value }))} placeholder={tx("Tartib")} />
            <textarea className="admin-textarea" value={newQuestion.text} onChange={(event) => setNewQuestion((prev) => ({ ...prev, text: event.target.value }))} placeholder={tx("Savol matni")} />
            <input className="admin-input" type="file" accept="image/*" onChange={(event) => setNewQuestion((prev) => ({ ...prev, image: event.target.files?.[0] || null }))} />
            <button type="button" className="admin-primary-btn" onClick={() => handleCreateQuestion({ test: selectedTest.id })}>+ {tx("Savol")}</button>
          </div>
        )}

        {currentQuestions.length === 0 ? (
          <div className="admin-table-empty">{tx("Savollar topilmadi")}</div>
        ) : (
          <div className="admin-question-drill-list">
            {currentQuestions.map((question) => {
              const questionAnswers = answersByQuestion[question.id] || [];

              return (
                <article className="admin-question-drill-row" key={question.id}>
                  <span className="admin-answer-index">{question.order || question.id}</span>
                  <div className="admin-question-drill-copy">
                    <strong>{getQuestionPreview(question)}</strong>
                    <span>
                      {question.image ? tx("Rasm mavjud") : tx("Rasm yo'q")} - {questionAnswers.length} {tx("javob")}
                    </span>
                  </div>
                  <div className="admin-table-actions admin-drill-actions">
                    <button type="button" className="admin-primary-btn" onClick={() => goToQuestion(question.id)}>{tx("Tahrirlash")}</button>
                    <button type="button" className="admin-danger-btn" onClick={() => handleDeleteQuestion(question)}>{tx("O'chirish")}</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  if (selectedQuestion) {
    return renderDrillShell(
      <section className="admin-drill-screen admin-question-editor-screen">
        <div className="admin-question-editor-panel">
          <div className="admin-question-editor-grid">
            <CustomSelect value={selectedQuestion.test} onChange={(value) => handleQuestionFieldChange(selectedQuestion.id, "test", value)} options={testOptions} placeholder={tx("Test tanlang")} getOptionLabel={(item) => item.label} getOptionValue={(item) => item.id} />
            <input className="admin-input" type="number" value={selectedQuestion.order} onChange={(event) => handleQuestionFieldChange(selectedQuestion.id, "order", event.target.value)} placeholder={tx("Tartib")} />
            <textarea className="admin-textarea admin-question-editor-text" value={selectedQuestion.text} onChange={(event) => handleQuestionFieldChange(selectedQuestion.id, "text", event.target.value)} placeholder={tx("Savol matni")} />
            <div className="admin-question-image-editor">
              <span>{tx("Savol rasmi")}</span>
              {selectedQuestion.image ? (
                <img src={selectedQuestion.image} alt={tx("Savol rasmi")} className="admin-question-image-preview-large" />
              ) : (
                <div className="admin-question-image-placeholder">{tx("Rasm yo'q")}</div>
              )}
              <input className="admin-input" type="file" accept="image/*" onChange={(event) => handleQuestionFieldChange(selectedQuestion.id, "imageFile", event.target.files?.[0] || null)} />
            </div>
          </div>
          <div className="admin-table-actions admin-drill-actions">
            <button type="button" className="admin-primary-btn" disabled={savingId === `question-${selectedQuestion.id}`} onClick={() => handleSaveQuestion(selectedQuestion)}>{savingId === `question-${selectedQuestion.id}` ? tx("Saqlanmoqda...") : tx("Saqlash")}</button>
            <button type="button" className="admin-danger-btn" onClick={() => handleDeleteQuestion(selectedQuestion)}>{tx("O'chirish")}</button>
          </div>
        </div>

        <div className="admin-answer-editor-panel">
          <div className="admin-answer-group-title">
            <h4>{tx("Javoblar")}</h4>
            <span>{currentAnswers.length} {tx("javob")}</span>
          </div>

          {openAddForm.answer === selectedQuestion.id && (
            <div className="admin-drill-add-form admin-answer-create-form">
              <input className="admin-input" value={newAnswer.text} onChange={(event) => setNewAnswer((prev) => ({ ...prev, text: event.target.value }))} placeholder={tx("Javob matni")} />
              <label className="admin-check-field"><input type="checkbox" checked={newAnswer.is_correct} onChange={(event) => setNewAnswer((prev) => ({ ...prev, is_correct: event.target.checked }))} />{tx("To'g'ri javob")}</label>
              <button type="button" className="admin-primary-btn" onClick={() => handleCreateAnswer({ question: selectedQuestion.id })}>+ {tx("Javob")}</button>
            </div>
          )}

          {currentAnswers.length === 0 ? (
            <div className="admin-table-empty">{tx("Javoblar topilmadi")}</div>
          ) : (
            <div className="admin-answer-list">
              {currentAnswers.map((answer, index) => (
                <div className="admin-answer-row admin-answer-drill-row" key={answer.id}>
                  <span className="admin-answer-index">{index + 1}</span>
                  <input className="admin-input" value={answer.text} onChange={(event) => handleAnswerFieldChange(answer.id, "text", event.target.value)} />
                  <CustomSelect value={answer.question} onChange={(value) => handleAnswerFieldChange(answer.id, "question", value)} options={questionOptions} placeholder={tx("Savol tanlang")} getOptionLabel={(item) => item.label} getOptionValue={(item) => item.id} />
                  <label className="admin-check-field"><input type="checkbox" checked={answer.is_correct} onChange={(event) => handleAnswerFieldChange(answer.id, "is_correct", event.target.checked)} />{tx("To'g'ri")}</label>
                  <button type="button" className="admin-primary-btn" disabled={savingId === `answer-${answer.id}`} onClick={() => handleSaveAnswer(answer)}>{savingId === `answer-${answer.id}` ? tx("Saqlanmoqda...") : tx("Saqlash")}</button>
                  <button type="button" className="admin-danger-btn" onClick={() => handleDeleteAnswer(answer)}>{tx("O'chirish")}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return renderDrillShell(
    <div className="admin-table-empty">{tx("Kontent topilmadi")}</div>
  );
}

export default TestContentManager;


