import { useEffect, useMemo, useState } from "react";
import ContentCreateForms from "./admin/content/ContentCreateForms";
import DirectionsTable from "./admin/content/DirectionsTable";
import QuestionsTable from "./admin/content/QuestionsTable";
import SubjectsTable from "./admin/content/SubjectsTable";
import { useI18n } from "../i18n/useI18n";
import api from "../utils/api";

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

  const handleDelete = async (endpoint, confirmMessage) => {
    if (!window.confirm(tx(confirmMessage))) {
      return;
    }

    try {
      await api.delete(endpoint);
      await fetchAll();
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
      alert(getDeleteErrorMessage(error));
    }
  };

  const handleCreateDirection = async () => {
    try {
      await api.post("admin/directions/", {
        ...newDirection,
      });
      setNewDirection({
        name_uz: "",
        name_ru: "",
        is_active: true,
      });
      fetchAll();
    } catch (error) {
      console.error(error);
      alert(tx("Yo'nalish qo'shishda xatolik"));
    }
  };

  const handleCreateSubject = async () => {
    try {
      await api.post("admin/subjects/", {
        ...newSubject,
        direction: Number(newSubject.direction),
      });
      setNewSubject({
        direction: "",
        name_uz: "",
        name_ru: "",
        is_active: true,
      });
      fetchAll();
    } catch (error) {
      console.error(error);
      alert(tx("Fan qo'shishda xatolik"));
    }
  };

  const handleCreateTest = async () => {
    try {
      await api.post("admin/tests/", {
        ...newTest,
        school_class: Number(newTest.school_class),
        subject: Number(newTest.subject),
        duration_minutes: Number(newTest.duration_minutes),
      });
      setNewTest({
        school_class: "",
        subject: "",
        title: "",
        duration_minutes: 20,
        is_active: true,
      });
      fetchAll();
    } catch (error) {
      console.error(error);
      alert(tx("Test qo'shishda xatolik"));
    }
  };

  const handleCreateQuestion = async () => {
    try {
      const payload = new FormData();
      payload.append("test", Number(newQuestion.test));
      payload.append("text", newQuestion.text);
      payload.append("order", Number(newQuestion.order));

      if (newQuestion.image) {
        payload.append("image", newQuestion.image);
      }

      await api.post("admin/questions/", payload);
      setNewQuestion({
        test: "",
        text: "",
        order: 1,
        image: null,
      });
      fetchAll();
    } catch (error) {
      console.error(error);
      alert(tx("Savol qo'shishda xatolik"));
    }
  };

  const handleCreateAnswer = async () => {
    try {
      await api.post("admin/answers/", {
        ...newAnswer,
        question: Number(newAnswer.question),
      });
      setNewAnswer({
        question: "",
        text: "",
        is_correct: false,
      });
      fetchAll();
    } catch (error) {
      console.error(error);
      alert(tx("Javob qo'shishda xatolik"));
    }
  };

  const handleSaveDirection = async (item) => {
    try {
      setSavingId(`direction-${item.id}`);
      await api.patch(`admin/directions/${item.id}/`, {
        name_uz: item.name_uz,
        name_ru: item.name_ru,
        is_active: item.is_active,
      });
      fetchAll();
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
      await api.patch(`admin/subjects/${item.id}/`, {
        direction: Number(item.direction),
        name_uz: item.name_uz,
        name_ru: item.name_ru,
        is_active: item.is_active,
      });
      fetchAll();
    } catch (error) {
      console.error(error);
      alert(tx("Fanni saqlashda xatolik"));
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveQuestion = async (item) => {
    try {
      setSavingId(`question-${item.id}`);

      if (item.imageFile) {
        const payload = new FormData();
        payload.append("test", Number(item.test));
        payload.append("text", item.text);
        payload.append("order", Number(item.order));
        payload.append("image", item.imageFile);
        await api.patch(`admin/questions/${item.id}/`, payload);
      } else {
        await api.patch(`admin/questions/${item.id}/`, {
          test: Number(item.test),
          text: item.text,
          order: Number(item.order),
        });
      }

      fetchAll();
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
      await api.patch(`admin/answers/${item.id}/`, {
        question: Number(item.question),
        text: item.text,
        is_correct: item.is_correct,
      });
      fetchAll();
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
      "Yo'nalishni o'chirishni tasdiqlaysizmi?"
    );
  };

  const handleDeleteSubject = (item) => {
    handleDelete(`admin/subjects/${item.id}/`, "Fanni o'chirishni tasdiqlaysizmi?");
  };

  const handleDeleteTest = (item) => {
    handleDelete(`admin/tests/${item.id}/`, "Testni o'chirishni tasdiqlaysizmi?");
  };

  const handleDeleteQuestion = (item) => {
    handleDelete(`admin/questions/${item.id}/`, "Savolni o'chirishni tasdiqlaysizmi?");
  };

  const handleDeleteAnswer = (item) => {
    handleDelete(`admin/answers/${item.id}/`, "Javobni o'chirishni tasdiqlaysizmi?");
  };

  const classOptions = useMemo(
    () =>
      classes.map((item) => ({
        id: item.id,
        label: `${item.school_name} - ${item.name}-sinf`,
      })),
    [classes]
  );

  if (loading) {
    return (
      <div className="admin-card">
        <p>{tx("Yuklanmoqda...")}</p>
      </div>
    );
  }

  return (
    <>
      <ContentCreateForms
        directions={directions}
        subjects={subjects}
        tests={tests}
        questions={questions}
        classOptions={classOptions}
        classLoading={classLoading}
        newDirection={newDirection}
        setNewDirection={setNewDirection}
        newSubject={newSubject}
        setNewSubject={setNewSubject}
        newTest={newTest}
        setNewTest={setNewTest}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        newAnswer={newAnswer}
        setNewAnswer={setNewAnswer}
        onCreateDirection={handleCreateDirection}
        onCreateSubject={handleCreateSubject}
        onCreateTest={handleCreateTest}
        onCreateQuestion={handleCreateQuestion}
        onCreateAnswer={handleCreateAnswer}
      />

      <DirectionsTable
        directions={directions}
        savingId={savingId}
        onDirectionFieldChange={handleDirectionFieldChange}
        onSaveDirection={handleSaveDirection}
        onDeleteDirection={handleDeleteDirection}
      />

      <SubjectsTable
        subjects={subjects}
        directions={directions}
        savingId={savingId}
        onSubjectFieldChange={handleSubjectFieldChange}
        onSaveSubject={handleSaveSubject}
        onDeleteSubject={handleDeleteSubject}
      />

      <div className="admin-card">
        <h2 className="admin-card-title">{tx("Testlar")}</h2>
        {tests.length === 0 ? (
          <div className="admin-table-empty">{tx("Testlar topilmadi")}</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{tx("Test nomi")}</th>
                  <th>{tx("Sinf")}</th>
                  <th>{tx("Fan")}</th>
                  <th>{tx("Holati")}</th>
                  <th>{tx("Amal")}</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.id}</td>
                    <td>{test.title}</td>
                    <td>{test.class_name}</td>
                    <td>{test.subject_name}</td>
                    <td>{test.is_active ? tx("Faol") : tx("Nofaol")}</td>
                    <td>
                      <button
                        className="admin-danger-btn"
                        onClick={() => handleDeleteTest(test)}
                      >
                        {tx("O'chirish")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QuestionsTable
        questions={questions}
        answers={answers}
        tests={tests}
        savingId={savingId}
        onQuestionFieldChange={handleQuestionFieldChange}
        onSaveQuestion={handleSaveQuestion}
        onAnswerFieldChange={handleAnswerFieldChange}
        onSaveAnswer={handleSaveAnswer}
        onDeleteQuestion={handleDeleteQuestion}
        onDeleteAnswer={handleDeleteAnswer}
      />
    </>
  );
}

export default TestContentManager;
