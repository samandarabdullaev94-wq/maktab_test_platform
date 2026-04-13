function TimerCircle({ timeLeft, formatTime, totalTimeSeconds }) {
  const isLowTime = timeLeft !== null && timeLeft <= 5 * 60;
  const isCriticalTime = timeLeft !== null && timeLeft <= 3 * 60;

  const timerMainColor = isCriticalTime
    ? "var(--app-danger-bg)"
    : isLowTime
    ? "var(--app-warning)"
    : "var(--app-primary-strong)";

  const timerBgColor = isCriticalTime
    ? "var(--app-danger-soft)"
    : isLowTime
    ? "var(--app-warning-soft)"
    : "var(--app-primary-soft)";
  const progress =
    totalTimeSeconds && timeLeft !== null
      ? Math.max(0, Math.min(1, timeLeft / totalTimeSeconds))
      : 1;
  const progressDegrees = Math.round(progress * 360);

  return (
    <div
      className="timer-circle"
      style={{
        width: "150px",
        height: "150px",
        margin: "0 auto 22px",
        borderRadius: "999px",
        background: `conic-gradient(${timerMainColor} ${progressDegrees}deg, var(--app-border) ${progressDegrees}deg 360deg)`,
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "0.25s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "999px",
          background: timerBgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: timerMainColor,
          fontWeight: "700",
          fontSize: "34px",
        }}
      >
        {formatTime(timeLeft)}
      </div>
    </div>
  );
}

export default TimerCircle;
