  import React, { useState, useEffect, useRef } from "react";
  import Button from "@mui/material/Button";

  function Controls({
    nextStep, prevStep, reset, stepIdx, stepsLength,
    onInputChange, currentArray, currentK, onKChange,
    waitingForPivot, goToFirst, goToLast
  }) {
    const [inputArr, setInputArr] = useState(currentArray.join(","));
    const [inputK, setInputK] = useState(currentK);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x speed
    const timerRef = useRef(null);

    useEffect(() => {
      if (isPlaying) {
        timerRef.current = setInterval(() => {
          nextStep();
        }, 1000 / playbackSpeed);
      } else {
        clearInterval(timerRef.current);
      }
      return () => clearInterval(timerRef.current);
    }, [isPlaying, playbackSpeed, nextStep]);

    useEffect(() => {
      if (stepIdx >= stepsLength) {
        stepIdx(stepsLength - 1);
      }
    }, [stepsLength,stepIdx]);

    const handleUpdate = () => {
      onInputChange(inputArr, inputK);
    };

    const handleKInputChange = (e) => {
      const value = Number(e.target.value);
      setInputK(value);
      if (onKChange) onKChange(value);
    };

    const togglePlay = () => {
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        if (stepIdx >= stepsLength - 1) {
          goToFirst();
        }
        setIsPlaying(true);
      }
    };

    const handleSpeedChange = (e) => {
      setPlaybackSpeed(parseFloat(e.target.value));
    };

    return (
      <div style={{ margin: "1em 0" }}>
        <div style={{ marginBottom: "0.5em" }}>
          <Button onClick={goToFirst} disabled={waitingForPivot}>|&lt;</Button>
          <Button onClick={prevStep} disabled={waitingForPivot}>&lt;&lt;</Button>
          <Button onClick={togglePlay} disabled={waitingForPivot}>
            {isPlaying ? "⏸" : "▶"}
          </Button>
          <Button onClick={nextStep} disabled={waitingForPivot}>&gt;&gt;</Button>
          <Button onClick={goToLast} disabled={waitingForPivot}>&gt;|</Button>
          <Button onClick={reset}>Reset</Button>
        </div>

        <div style={{ marginBottom: "0.5em" }}>
          <label>Speed: </label>
          <select value={playbackSpeed} onChange={handleSpeedChange}>
            {[0.5,1,1.5,2,2.5,3].map(s => (
              <option key={s} value={s}>{s}x</option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="range"
            min="0"
            max={stepsLength - 1}
            value={stepIdx}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val < stepIdx) prevStep();
              else nextStep();
            }}
            style={{ width: "100%" }}
          />
          <div>
            Step {stepIdx + 1} / {stepsLength}
          </div>
        </div>

        <div style={{ marginTop: "1em" }}>
          <input
            value={inputArr}
            onChange={e => setInputArr(e.target.value)}
            placeholder="Enter array (comma-separated)"
            aria-label="Input array"
            style={{ width: "220px" }}
          />
          <input
            value={inputK}
            type="number"
            min={1}
            max={Number.isFinite(currentArray.length) && currentArray.length > 0 ? currentArray.length : 1}
            onChange={handleKInputChange}
            placeholder="k"
            aria-label="Input k"
            style={{ width: "50px", marginLeft: "1em" }}
          />
          <Button onClick={handleUpdate} style={{ marginLeft: "1em" }}>Set Input</Button>
        </div>

        {waitingForPivot && (
          <div style={{ marginTop: "1em", color: "#f57c00" }}>
            Please select the **initial pivot** in the array above (yellow-highlighted) to begin.
          </div>
        )}
      </div>
    );
  }

  export default Controls;