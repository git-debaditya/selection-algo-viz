import React, { useState } from "react";

const randInt = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;

function LeftPanel({
  onSetArray,
  onFindK,
  collapsePanel,
  isOpen,
  // show pivot mode only when QuickSelect uses this panel
  showPivotMode = false,
  // optional: lift pivotMode up if you want parent (QuickSelectViz) to know it
  onPivotModeChange,
}) {
  const [section, setSection] = useState("create"); // "create" | "find"
  const [N, setN] = useState(10);
  const [arrayInput, setArrayInput] = useState("");
  const [k, setK] = useState(1);
  const [kType, setKType] = useState("smallest");

  // becomes true after "Set Input"
  const [canProceed, setCanProceed] = useState(false);

  // require explicit choice; keeps Next disabled until picked
  const [pivotMode, setPivotMode] = useState(null); // "manual" | "random" | null

  const requiresPivotMode = !!showPivotMode;
  const hasChosenPivotMode = pivotMode === "manual" || pivotMode === "random";
  const canProceedNext = requiresPivotMode ? (canProceed && hasChosenPivotMode) : canProceed;
  
  if (!isOpen) return null;

  // --- helpers to populate textbox ---
  const generateRandomIntoTextbox = () => {
    const len = Math.max(1, Number(N) || 0);
    const vals = Array.from({ length: len }, () => Math.floor(Math.random() * 100));
    setArrayInput(vals.join(","));
  };

  const generateDuplicateIntoTextbox = () => {
    const len = Math.max(1, Number(N) || 0);
    const dupVal = Math.floor(Math.random() * 100);
    const minDup = Math.max(2, Math.floor(len * 0.30));
    const maxDup = Math.max(minDup, Math.floor(len * 0.70));
    const dupCount = randInt(minDup, maxDup);

    const arr = Array.from({ length: len }, () => {
      let v = Math.floor(Math.random() * 100);
      if (v === dupVal) v = (v + 1) % 100;
      return v;
    });

    // scatter duplicates
    const indices = Array.from({ length: len }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    indices.slice(0, dupCount).forEach(idx => (arr[idx] = dupVal));
    setArrayInput(arr.join(","));
  };

  // commit array to the viz
  const handleSetInput = () => {
    onSetArray({ N, arrayInput, pattern: null }); // pattern unused
    setCanProceed(true); // unlock Next
  };

  const handleNextToFind = () => {
    if (!canProceedNext) return; // guard
    setSection("find");
  };

  const handleFind = () => {
    // If you want the parent to know which pivot mode was chosen,
    // you can include it here: onFindK({ k: Number(k), kType, pivotMode })
    onFindK({ k: Number(k), kType });
    collapsePanel();
  };

  const handlePivotMode = (value) => {
    setPivotMode(value);
    if (onPivotModeChange) onPivotModeChange(value); // notify parent if needed
  };

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: "68px", // below navbar
        bottom: 0,
        width: "250px",
        background: "#e3f2fd",
        borderRight: "8px solid #1976d2",
        padding: "1em",
        overflowY: "auto",
        zIndex: 1000,
        boxShadow: "2px 0 10px rgba(0,0,0,0.07)",
      }}
    >
      <button
        onClick={collapsePanel}
        style={{
          position: "absolute",
          right: "-30px",
          top: "20px",
          zIndex: 1100,
          background: "#1976d2",
          color: "#fff",            // fixed
          border: "none",
          borderRadius: "0 6px 6px 0",
          padding: "0.5em",
          cursor: "pointer",
        }}
        title="Close"
      >
        ⮜
      </button>

      {section === "create" && (
        <div>
          <h4>Create New</h4>

          <label>N:&nbsp;</label>
          <input
            type="number"
            min={1}
            value={N}
            onChange={(e) => setN(+e.target.value || 1)}
            style={{ width: "80px" }}
          />
          <br />

          <label style={{ display: "block", marginTop: "0.6em" }}>Custom Array:</label>
          <input
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            placeholder="comma separated"
            style={{ width: "100%" }}
          />

          {/* Utility buttons */}
          <div style={{ marginTop: "0.6em", display: "flex", gap: "0.5em" }}>
            <button onClick={generateRandomIntoTextbox}>Random</button>
            <button onClick={generateDuplicateIntoTextbox}>Duplicate</button>
          </div>

          {/* Pivot mode (QuickSelect only) */}
          {showPivotMode && (
            <div style={{ marginTop: "0.8em" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.4em" }}>
                Pivot selection mode
              </div>
              <label style={{ marginRight: "0.8em" }}>
                <input
                  type="radio"
                  name="pivotMode"
                  value="manual"
                  checked={pivotMode === "manual"}
                  onChange={(e) => handlePivotMode(e.target.value)}
                />{" "}
                Manual
              </label>
              <label>
                <input
                  type="radio"
                  name="pivotMode"
                  value="random"
                  checked={pivotMode === "random"}
                  onChange={(e) => handlePivotMode(e.target.value)}
                />{" "}
                Random
              </label>
            </div>
          )}

          {/* Commit + proceed controls */}
          <div style={{ marginTop: "0.8em", display: "flex", gap: "0.5em" }}>
            <button onClick={handleSetInput}>Set Input</button>
            <button
              onClick={handleNextToFind}
              disabled={!canProceedNext}
              title={!canProceedNext ? (requiresPivotMode ? "Set Input and choose pivot mode" : "Click Set Input first") : "Go to Find"}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {section === "find" && (
        <div>
          <h4>Find k</h4>

          <label>k:&nbsp;</label>
          <input
            type="number"
            min={1}
            value={k}
            onChange={(e) => setK(+e.target.value || 1)}
            style={{ width: "80px" }}
          />

          <div style={{ marginTop: "0.6em" }}>
            <label style={{ marginRight: "0.6em" }}>
              <input
                type="radio"
                value="smallest"
                checked={kType === "smallest"}
                onChange={(e) => setKType(e.target.value)}
              />
              &nbsp;Smallest
            </label>
            <label>
              <input
                type="radio"
                value="largest"
                checked={kType === "largest"}
                onChange={(e) => setKType(e.target.value)}
              />
              &nbsp;Largest
            </label>
          </div>

          <div style={{ marginTop: "0.8em", display: "flex", gap: "0.5em" }}>
            <button onClick={handleFind}>Find</button>
            <button onClick={() => setSection("create")}>⮜ Return</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeftPanel;
