function SubjectTabs({ subjectTabs, activeSubjectId, onChangeSubject }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "18px",
      }}
    >
      {subjectTabs.map((subject) => {
        const active = Number(activeSubjectId) === Number(subject.id);

        return (
          <button
            key={subject.id}
            onClick={() => onChangeSubject(subject.id)}
            style={{
              border: "none",
              cursor: "pointer",
              padding: active ? "12px 20px" : "10px 12px",
              borderRadius: "var(--app-radius-md)",
              background: active ? "var(--app-primary-strong)" : "transparent",
              color: active ? "var(--app-text-inverse)" : "var(--app-text)",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: active
                ? "var(--app-card-shadow)"
                : "none",
            }}
          >
            {subject.title}
          </button>
        );
      })}
    </div>
  );
}

export default SubjectTabs;
