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
  const [expandedNodes, setExpandedNodes] = useState({
    directions: {},
    subjects: {},
    tests: {},
    questions: {},
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

  const isExpanded = (level, id) => Boolean(expandedNodes[level]?.[id]);

  const setNodeExpanded = (level, id, expanded = true) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        [id]: expanded,
      },
    }));
  };

  const toggleNode = (level, id) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        [id]: !prev[level]?.[id],
      },
    }));
  };

  const handleTreeKeyDown = (event, level, id) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleNode(level, id);
    }
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
      () =>
        setDirections((prev) =>
          prev.filter((direction) => direction.id !== item.id)
        )
    );
  };

  const handleDeleteSubject = (item) => {
    handleDelete(
      `admin/subjects/${item.id}/`,
      "Fanni o'chirishni tasdiqlaysizmi?",
      () => setSubjects((prev) => prev.filter((subject) => subject.id !== item.id))
    );
  };

  const handleDeleteTest = (item) => {
    handleDelete(
      `admin/tests/${item.id}/`,
      "Testni o'chirishni tasdiqlaysizmi?",
      () => setTests((prev) => prev.filter((test) => test.id !== item.id))
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

  if (loading) {
    return (
      <div className="admin-card">
        <p>{tx("Yuklanmoqda...")}</p>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-content-list-head">
        <div>
          <h2 className="admin-card-title">{tx("Yo'nalish / Fan / Test / Savol / Javob")}</h2>
          <p>{tx("Kontent ota-ona bog'lanishlari bo'yicha tartiblangan")}</p>
        </div>
        <button type="button" className="admin-primary-btn" onClick={() => toggleAddForm("direction")}>+ {tx("Yo'nalish qo'shish")}</button>
      </div>

      {openAddForm.direction && (
        <div className="admin-tree-add-form admin-tree-add-root">
          <input className="admin-input" value={newDirection.name_uz} onChange={(event) => setNewDirection((prev) => ({ ...prev, name_uz: event.target.value }))} placeholder={tx("Yo'nalish nomi (UZ)")} />
          <input className="admin-input" value={newDirection.name_ru} onChange={(event) => setNewDirection((prev) => ({ ...prev, name_ru: event.target.value }))} placeholder={tx("Yo'nalish nomi (RU)")} />
          <label className="admin-check-field"><input type="checkbox" checked={newDirection.is_active} onChange={(event) => setNewDirection((prev) => ({ ...prev, is_active: event.target.checked }))} />{tx("Faol")}</label>
          <button type="button" className="admin-primary-btn" onClick={handleCreateDirection}>+ {tx("Yo'nalish")}</button>
        </div>
      )}

      {directions.length === 0 ? (
        <div className="admin-table-empty">{tx("Yo'nalishlar topilmadi")}</div>
      ) : (
        <div className="admin-content-tree">
          {directions.map((direction) => {
            const directionSubjects = subjectsByDirection[direction.id] || [];
            const directionOpen = isExpanded("directions", direction.id);

            return (
              <section className="admin-tree-node admin-tree-node-direction" key={direction.id}>
                <div className="admin-tree-row" role="button" tabIndex={0} onClick={() => toggleNode("directions", direction.id)} onKeyDown={(event) => handleTreeKeyDown(event, "directions", direction.id)}>
                  <span className="admin-tree-toggle">{directionOpen ? "-" : "+"}</span>
                  <div className="admin-tree-summary"><strong>{direction.name_uz || direction.name_ru || tx("Yo'nalish")}</strong><span>{directionSubjects.length} {tx("fan")}</span></div>
                  <div className="admin-tree-fields admin-tree-fields-compact" onClick={(event) => event.stopPropagation()}>
                    <input className="admin-input" value={direction.name_uz} onChange={(event) => handleDirectionFieldChange(direction.id, "name_uz", event.target.value)} placeholder={tx("UZ nomi")} />
                    <input className="admin-input" value={direction.name_ru} onChange={(event) => handleDirectionFieldChange(direction.id, "name_ru", event.target.value)} placeholder={tx("RU nomi")} />
                    <label className="admin-check-field"><input type="checkbox" checked={direction.is_active} onChange={(event) => handleDirectionFieldChange(direction.id, "is_active", event.target.checked)} />{tx("Faol")}</label>
                  </div>
                  <div className="admin-table-actions" onClick={(event) => event.stopPropagation()}>
                    <button type="button" className="admin-primary-btn" onClick={() => { setNodeExpanded("directions", direction.id); toggleAddForm("subject", direction.id); }}>+ {tx("Fan")}</button>
                    <button type="button" className="admin-primary-btn" disabled={savingId === `direction-${direction.id}`} onClick={() => handleSaveDirection(direction)}>{savingId === `direction-${direction.id}` ? tx("Saqlanmoqda...") : tx("Saqlash")}</button>
                    <button type="button" className="admin-danger-btn" onClick={() => handleDeleteDirection(direction)}>{tx("O'chirish")}</button>
                  </div>
                </div>

                {directionOpen && (
                  <div className="admin-tree-children">
                    {openAddForm.subject === direction.id && (
                      <div className="admin-tree-add-form">
                        <input className="admin-input" value={newSubject.name_uz} onChange={(event) => setNewSubject((prev) => ({ ...prev, name_uz: event.target.value }))} placeholder={tx("Fan nomi (UZ)")} />
                        <input className="admin-input" value={newSubject.name_ru} onChange={(event) => setNewSubject((prev) => ({ ...prev, name_ru: event.target.value }))} placeholder={tx("Fan nomi (RU)")} />
                        <label className="admin-check-field"><input type="checkbox" checked={newSubject.is_active} onChange={(event) => setNewSubject((prev) => ({ ...prev, is_active: event.target.checked }))} />{tx("Faol")}</label>
                        <button type="button" className="admin-primary-btn" onClick={() => handleCreateSubject({ direction: direction.id })}>+ {tx("Fan")}</button>
                      </div>
                    )}

                    {directionSubjects.length === 0 ? <div className="admin-tree-empty">{tx("Fanlar topilmadi")}</div> : directionSubjects.map((subject) => {
                      const subjectTests = testsBySubject[subject.id] || [];
                      const subjectOpen = isExpanded("subjects", subject.id);

                      return (
                        <section className="admin-tree-node admin-tree-node-subject" key={subject.id}>
                          <div className="admin-tree-row" role="button" tabIndex={0} onClick={() => toggleNode("subjects", subject.id)} onKeyDown={(event) => handleTreeKeyDown(event, "subjects", subject.id)}>
                            <span className="admin-tree-toggle">{subjectOpen ? "-" : "+"}</span>
                            <div className="admin-tree-summary"><strong>{subject.name_uz || subject.name_ru || tx("Fan")}</strong><span>{subjectTests.length} {tx("test")}</span></div>
                            <div className="admin-tree-fields admin-tree-fields-wide" onClick={(event) => event.stopPropagation()}>
                              <input className="admin-input" value={subject.name_uz} onChange={(event) => handleSubjectFieldChange(subject.id, "name_uz", event.target.value)} placeholder={tx("UZ nomi")} />
                              <input className="admin-input" value={subject.name_ru} onChange={(event) => handleSubjectFieldChange(subject.id, "name_ru", event.target.value)} placeholder={tx("RU nomi")} />
                              <CustomSelect value={subject.direction} onChange={(value) => handleSubjectFieldChange(subject.id, "direction", value)} options={directions} placeholder={tx("Yo'nalish tanlang")} getOptionLabel={(item) => item.name_uz || item.name_ru || `#${item.id}`} getOptionValue={(item) => item.id} />
                              <label className="admin-check-field"><input type="checkbox" checked={subject.is_active} onChange={(event) => handleSubjectFieldChange(subject.id, "is_active", event.target.checked)} />{tx("Faol")}</label>
                            </div>
                            <div className="admin-table-actions" onClick={(event) => event.stopPropagation()}>
                              <button type="button" className="admin-primary-btn" onClick={() => { setNodeExpanded("subjects", subject.id); toggleAddForm("test", subject.id); }}>+ {tx("Test")}</button>
                              <button type="button" className="admin-primary-btn" disabled={savingId === `subject-${subject.id}`} onClick={() => handleSaveSubject(subject)}>{savingId === `subject-${subject.id}` ? tx("Saqlanmoqda...") : tx("Saqlash")}</button>
                              <button type="button" className="admin-danger-btn" onClick={() => handleDeleteSubject(subject)}>{tx("O'chirish")}</button>
                            </div>
                          </div>

                          {subjectOpen && (
                            <div className="admin-tree-children">
                              {openAddForm.test === subject.id && (
                                <div className="admin-tree-add-form">
                                  <input className="admin-input" value={newTest.title} onChange={(event) => setNewTest((prev) => ({ ...prev, title: event.target.value }))} placeholder={tx("Test nomi")} />
                                  <CustomSelect value={newTest.school_class} onChange={(value) => setNewTest((prev) => ({ ...prev, school_class: value }))} options={classOptions} placeholder={classLoading ? tx("Sinflar yuklanmoqda...") : tx("Sinf tanlang")} disabled={classLoading} getOptionLabel={(item) => item.label} getOptionValue={(item) => item.id} />
                                  <input className="admin-input" type="number" value={newTest.duration_minutes} onChange={(event) => setNewTest((prev) => ({ ...prev, duration_minutes: event.target.value }))} placeholder={tx("Davomiylik")} />
                                  <label className="admin-check-field"><input type="checkbox" checked={newTest.is_active} onChange={(event) => setNewTest((prev) => ({ ...prev, is_active: event.target.checked }))} />{tx("Faol")}</label>
                                  <button type="button" className="admin-primary-btn" onClick={() => handleCreateTest({ subject: subject.id })}>+ {tx("Test")}</button>
                                </div>
                              )}

                              {subjectTests.length === 0 ? <div className="admin-tree-empty">{tx("Testlar topilmadi")}</div> : subjectTests.map((test) => {
                                const testQuestions = questionsByTest[test.id] || [];
                                const testOpen = isExpanded("tests", test.id);
                                const selectedClass = classOptions.find(
                                  (item) =>
                                    Number(item.id) === Number(test.school_class)
                                );

                                return (
                                  <section className="admin-tree-node admin-tree-node-test" key={test.id}>
                                    <div className="admin-tree-row" role="button" tabIndex={0} onClick={() => toggleNode("tests", test.id)} onKeyDown={(event) => handleTreeKeyDown(event, "tests", test.id)}>
                                      <span className="admin-tree-toggle">{testOpen ? "-" : "+"}</span>
                                      <div className="admin-tree-summary"><strong>{test.title || tx("Test")}</strong><span>{selectedClass?.label || test.class_name || tx("Sinf biriktirilmagan")} - {testQuestions.length} {tx("savol")}</span></div>
                                      <div className="admin-tree-fields admin-tree-test-fields" onClick={(event) => event.stopPropagation()}>
                                        <div className="admin-tree-class-info">
                                          <span>{tx("Sinf")}</span>
                                          <strong>{selectedClass?.label || test.class_name || tx("Sinf biriktirilmagan")}</strong>
                                        </div>
                                        <CustomSelect
                                          value={test.school_class || ""}
                                          onChange={(value) =>
                                            handleTestFieldChange(
                                              test.id,
                                              "school_class",
                                              value
                                            )
                                          }
                                          options={classOptions}
                                          placeholder={
                                            classLoading
                                              ? tx("Sinflar yuklanmoqda...")
                                              : tx("Sinf tanlang")
                                          }
                                          disabled={classLoading}
                                          getOptionLabel={(item) => item.label}
                                          getOptionValue={(item) => item.id}
                                        />
                                      </div>
                                      <div className="admin-tree-meta">{test.is_active ? tx("Faol") : tx("Nofaol")}</div>
                                      <div className="admin-table-actions" onClick={(event) => event.stopPropagation()}>
                                        <button type="button" className="admin-primary-btn" onClick={() => { setNodeExpanded("tests", test.id); toggleAddForm("question", test.id); }}>+ {tx("Savol")}</button>
                                        <button type="button" className="admin-primary-btn" disabled={savingId === `test-${test.id}`} onClick={() => handleSaveTest(test)}>{savingId === `test-${test.id}` ? tx("Saqlanmoqda...") : tx("Saqlash")}</button>
                                        <button type="button" className="admin-danger-btn" onClick={() => handleDeleteTest(test)}>{tx("O'chirish")}</button>
                                      </div>
                                    </div>

                                    {testOpen && (
                                      <div className="admin-tree-children">
                                        {openAddForm.question === test.id && (
                                          <div className="admin-tree-add-form admin-tree-add-form-question">
                                            <input className="admin-input" type="number" value={newQuestion.order} onChange={(event) => setNewQuestion((prev) => ({ ...prev, order: event.target.value }))} placeholder={tx("Tartib")} />
                                            <textarea className="admin-textarea" value={newQuestion.text} onChange={(event) => setNewQuestion((prev) => ({ ...prev, text: event.target.value }))} placeholder={tx("Savol matni")} />
                                            <input className="admin-input" type="file" accept="image/*" onChange={(event) => setNewQuestion((prev) => ({ ...prev, image: event.target.files?.[0] || null }))} />
                                            <button type="button" className="admin-primary-btn" onClick={() => handleCreateQuestion({ test: test.id })}>+ {tx("Savol")}</button>
                                          </div>
                                        )}

                                        {testQuestions.length === 0 ? <div className="admin-tree-empty">{tx("Savollar topilmadi")}</div> : testQuestions.map((question) => {
                                          const questionAnswers = answersByQuestion[question.id] || [];
                                          const questionOpen = isExpanded("questions", question.id);

                                          return (
                                            <section className="admin-tree-node admin-tree-node-question" key={question.id}>
                                              <div className="admin-tree-row" role="button" tabIndex={0} onClick={() => toggleNode("questions", question.id)} onKeyDown={(event) => handleTreeKeyDown(event, "questions", question.id)}>
                                                <span className="admin-tree-toggle">{questionOpen ? "-" : "+"}</span>
                                                <div className="admin-tree-summary"><strong>{tx("Savol")} #{question.id}</strong><span>{questionAnswers.length} {tx("javob")}</span></div>
                                                <div className="admin-tree-fields admin-tree-question-fields" onClick={(event) => event.stopPropagation()}>
                                                  <CustomSelect value={question.test} onChange={(value) => handleQuestionFieldChange(question.id, "test", value)} options={testOptions} placeholder={tx("Test tanlang")} getOptionLabel={(item) => item.label} getOptionValue={(item) => item.id} />
                                                  <input className="admin-input" type="number" value={question.order} onChange={(event) => handleQuestionFieldChange(question.id, "order", event.target.value)} placeholder={tx("Tartib")} />
                                                  <textarea className="admin-textarea" value={question.text} onChange={(event) => handleQuestionFieldChange(question.id, "text", event.target.value)} />
                                                  <div className="admin-question-image-cell">
                                                    {question.image && <img src={question.image} alt={tx("Savol rasmi")} className="admin-question-image-preview" />}
                                                    <input className="admin-input" type="file" accept="image/*" onChange={(event) => handleQuestionFieldChange(question.id, "imageFile", event.target.files?.[0] || null)} />
                                                  </div>
                                                </div>
                                                <div className="admin-table-actions" onClick={(event) => event.stopPropagation()}>
                                                  <button type="button" className="admin-primary-btn" onClick={() => { setNodeExpanded("questions", question.id); toggleAddForm("answer", question.id); }}>+ {tx("Javob")}</button>
                                                  <button type="button" className="admin-primary-btn" disabled={savingId === `question-${question.id}`} onClick={() => handleSaveQuestion(question)}>{savingId === `question-${question.id}` ? tx("Saqlanmoqda...") : tx("Saqlash")}</button>
                                                  <button type="button" className="admin-danger-btn" onClick={() => handleDeleteQuestion(question)}>{tx("O'chirish")}</button>
                                                </div>
                                              </div>

                                              {questionOpen && (
                                                <div className="admin-tree-children admin-tree-answer-children">
                                                  {openAddForm.answer === question.id && (
                                                    <div className="admin-tree-add-form">
                                                      <input className="admin-input" value={newAnswer.text} onChange={(event) => setNewAnswer((prev) => ({ ...prev, text: event.target.value }))} placeholder={tx("Javob matni")} />
                                                      <label className="admin-check-field"><input type="checkbox" checked={newAnswer.is_correct} onChange={(event) => setNewAnswer((prev) => ({ ...prev, is_correct: event.target.checked }))} />{tx("To'g'ri javob")}</label>
                                                      <button type="button" className="admin-primary-btn" onClick={() => handleCreateAnswer({ question: question.id })}>+ {tx("Javob")}</button>
                                                    </div>
                                                  )}

                                                  {questionAnswers.length === 0 ? <div className="admin-tree-empty">{tx("Javoblar topilmadi")}</div> : (
                                                    <div className="admin-answer-list">
                                                      {questionAnswers.map((answer, index) => (
                                                        <div className="admin-answer-row admin-tree-answer-row" key={answer.id}>
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
                                              )}
                                            </section>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </section>
                                );
                              })}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TestContentManager;


