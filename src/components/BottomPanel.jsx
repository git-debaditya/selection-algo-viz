import React, { useEffect, useRef } from "react";

const speeds = [0.25, 0.5, 1, 1.5, 2, 2.5, 3];

function BottomPanel({
  stepIdx, setStepIdx, stepsLength,
  nextStep, prevStep, reset, goToFirst, goToLast,
  isPlaying, setIsPlaying, playbackSpeed, setPlaybackSpeed
}) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIdx((idx) => {
          if (idx < stepsLength - 1) return idx + 1;
          clearInterval(timerRef.current);
          setIsPlaying(false);
          return idx;
        });
      }, 1000 / playbackSpeed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, playbackSpeed, stepsLength, setStepIdx]);

  const handleSpeedChange = (e) => {
    setPlaybackSpeed(parseFloat(e.target.value));
  };

  const handleSliderChange = (e) => {
    setStepIdx(Number(e.target.value));
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (stepIdx >= stepsLength - 1) goToFirst();
      setIsPlaying(true);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        maxWidth: "100vw",
        background: "#111",
        color: "#fff",
        padding: "0.5em 1em",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 1000,
        overflowX: "hidden"
      }}
    >
      <div>
        <button onClick={goToFirst} disabled={stepIdx === 0}>&#124;&lt;</button>
        <button onClick={prevStep} disabled={stepIdx === 0}>&lt;&lt;</button>
        <button onClick={togglePlay}>{isPlaying ? "⏸" : "▶"}</button>
        <button onClick={nextStep} disabled={stepIdx >= stepsLength - 1}>&gt;&gt;</button>
        <button onClick={goToLast} disabled={stepIdx >= stepsLength - 1}>&gt;&#124;</button>
        <button onClick={reset}>Reset</button>
      </div>

      <div style={{ flexGrow: 1, margin: "0 1em" }}>
        <input
          type="range"
          min="0"
          max={stepsLength - 1}
          value={stepIdx}
          onChange={handleSliderChange}
          style={{ width: "100%" }}
        />
        <div style={{ textAlign: "center", fontSize: "0.8em" }}>
          Step {stepIdx + 1} / {stepsLength}
        </div>
      </div>

      <div>
        <label>Speed: </label>
        <select value={playbackSpeed} onChange={handleSpeedChange}>
          {speeds.map((s) => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default BottomPanel;