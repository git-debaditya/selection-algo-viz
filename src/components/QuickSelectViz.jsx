import React, { useEffect, useState } from "react";
import ArrayDisplay from "./ArrayDisplay";
import LeftPanel from "./LeftPanel";
import BottomPanel from "./BottomPanel";
//import { quickSelectStepsInitialPivot } from "./stepGenerators";

const defaultArray = [9, 1, 8, 2, 7, 3, 6, 4, 5];
const defaultK = 3;

// Manual Pivot Selection: Helper: Generate steps for QuickSelect, taking an initial user pivot index
function quickSelectStepsInitialPivot(arr, k, userPivotIndex) {
  const steps = [];
  function partition(A, left, right, pivotIndex) {
    const pivotValue = A[pivotIndex];
    [A[pivotIndex], A[right]] = [A[right], A[pivotIndex]]; // Move pivot to end
    let storeIndex = left;
    //Step: pivot moved to end
    steps.push({
      array: [...A], left, right, k, pivotValue, pivotIndex: A.indexOf(pivotValue), stage: "partition", desc: `Pivot ${pivotValue} moved to end`
    });
    for (let i = left; i < right; i++) {
      //Step: comparing each element with pivot
      steps.push({
        array: [...A], left, right, k, pivotValue, pivotIndex: A.indexOf(pivotValue), currentCompare: i, storeIndex, stage: "compare", desc: `Compare ${A[i]} < ${pivotValue}`
      });
      if (A[i] < pivotValue) {
        [A[storeIndex], A[i]] = [A[i], A[storeIndex]];
        //Step: swap if less than pivot
        steps.push({
          array: [...A], left, right, k, pivotValue,pivotIndex: A.indexOf(pivotValue), currentCompare: i, storeIndex, stage: "swap", desc: `Swap ${A[storeIndex]} and ${A[i]}`
        });
        storeIndex++;
      }
    }
    [A[storeIndex], A[right]] = [A[right], A[storeIndex]];
    //Step: pivot placed in final position
    steps.push({
      array: [...A], left, right, k, pivotValue,pivotIndex: A.indexOf(pivotValue), stage: "pivotPlaced", desc: `Pivot placed at index ${storeIndex}`
    });
    return storeIndex;
  }

  function select(A, left, right, k, useUserPivot = true) {
    if (left === right) {
      steps.push({ array: [...A], left, right, k, pivotValue: A[left], pivotIndex: left, stage: "complete", desc: `Found kth element: ${A[left]}`, found: A[left] });
      return A[left];
    }
    // Use user-chosen pivot for the first partition; then use last element after
    const pivotIndex = useUserPivot ? userPivotIndex : right;
    const mid = partition(A, left, right, pivotIndex);
    if (k === mid) {
      steps.push({ array: [...A], left, right, k, pivotValue: A[mid], pivotIndex: mid, stage: "complete", desc: `Found kth element: ${A[k]}`, found: A[k] });
      return A[k];
    } else if (k < mid) {
      return select(A, left, mid - 1, k, false);
    } else {
      return select(A, mid + 1, right, k, false);
    }
  }
  select([...arr], 0, arr.length - 1, k, true);
  return steps;
}

function quickSelectStepsRandomPivot(arr, k) {
  const steps = [];
  function partition(A, left, right, pivotIndex) {
    const pivotValue = A[pivotIndex];
    [A[pivotIndex], A[right]] = [A[right], A[pivotIndex]];
    let storeIndex = left;
    steps.push({
      array: [...A], left, right, k,
      pivotValue, pivotIndex: A.indexOf(pivotValue),
      stage: "partition", desc: `Pivot ${pivotValue} moved to end (random)`
    });
    for (let i = left; i < right; i++) {
      steps.push({
        array: [...A], left, right, k, pivotValue,
        pivotIndex: A.indexOf(pivotValue),
        currentCompare: i, storeIndex,
        stage: "compare", desc: `Compare ${A[i]} < ${pivotValue}`
      });
      if (A[i] < pivotValue) {
        [A[storeIndex], A[i]] = [A[i], A[storeIndex]];
        steps.push({
          array: [...A], left, right, k, pivotValue,
          pivotIndex: A.indexOf(pivotValue),
          currentCompare: i, storeIndex,
          stage: "swap", desc: `Swap ${A[storeIndex]} and ${A[i]}`
        });
        storeIndex++;
      }
    }
    [A[storeIndex], A[right]] = [A[right], A[storeIndex]];
    steps.push({
      array: [...A], left, right, k,
      pivotValue, pivotIndex: A.indexOf(pivotValue),
      stage: "pivotPlaced", desc: `Pivot placed at index ${storeIndex}`
    });
    return storeIndex;
  }

  function select(A, left, right, k) {
    if (left === right) {
      steps.push({
        array: [...A], left, right, k,
        pivotValue: A[left], pivotIndex: left,
        stage: "complete", desc: `Found kth element: ${A[left]}`, found: A[left]
      });
      return A[left];
    }
    const pivotIndex = Math.floor(Math.random() * (right - left + 1)) + left; // RANDOM
    const mid = partition(A, left, right, pivotIndex);
    if (k === mid) {
      steps.push({
        array: [...A], left, right, k,
        pivotValue: A[mid], pivotIndex: mid,
        stage: "complete", desc: `Found kth element: ${A[k]}`, found: A[k]
      });
      return A[k];
    } else if (k < mid) {
      return select(A, left, mid - 1, k);
    } else {
      return select(A, mid + 1, right, k);
    }
  }

  select([...arr], 0, arr.length - 1, k);
  return steps;
}


function QuickSelectVisualizer() {
  const [array, setArray] = useState(defaultArray);
  const [k, setK] = useState(defaultK);
  
  const [userPivotIndex, setUserPivotIndex] = useState(null);
  
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [leftOpen, setLeftOpen] = useState(false);
  useEffect(() => { setLeftOpen(true); }, []);
  const [pivotChosen, setPivotChosen] = useState(false);
  const [pivotMode, setPivotMode] = useState(null); // 'manual' | 'random' | null
  const [inputSet, setInputSet] = useState(false);  // becomes true after Set Input

  
  // User picks pivot before AV starts
  const choosePivot = (pivotIdx) => {
    setUserPivotIndex(pivotIdx);
    setPivotChosen(true);
    const steps = quickSelectStepsInitialPivot(array, k, pivotIdx);
    setSteps(steps);
    setStepIdx(0);
  };

  const handleSetArray = ({N, arrayInput, pattern}) => {
    let arr;

    if (arrayInput && arrayInput.trim() !== "") {
      arr = arrayInput.split(",").map(Number).filter(x => !isNaN(x));
    } else {
      // otherwise generate based on N and pattern
      switch (pattern) {
        case "random":
          arr = Array.from({ length: N }, () => Math.floor(Math.random() * 100));
          break;
        case "duplicate":
          const val = Math.floor(Math.random() * 50);
          arr = Array(N).fill(val);
          break;
        default:
          arr = Array.from({ length: N }, () => Math.floor(Math.random() * 100));
      }
    }

    setArray(arr);
    setK(0); //default k
    setSteps([]);
    setStepIdx(0);
    setIsPlaying(false);

    setUserPivotIndex(null);
    setPivotChosen(false);
    setInputSet(true);
  }

  const handleFindK = ({ k, kType }) => {
    let kNum = k - 1;
    if(kType === "largest") kNum = array.length - k

    setK(kNum);
    if (pivotMode === "manual") {
      // Do NOT generate steps yet; first show "select pivot" step
      setSteps([]);            // no steps; ArrayDisplay will show select mode
      setStepIdx(0);
      setIsPlaying(false);
      setPivotChosen(false);   // stays false until user clicks a pivot
      setLeftOpen(false);      // close panel as you do today
      return;
    }

    // Random mode: run immediately
    const steps = quickSelectStepsRandomPivot(array, kNum);
    setSteps(steps);
    setStepIdx(0);
    setIsPlaying(true);
    setLeftOpen(false);
  };

  const toggleLeftPanel = () => setLeftOpen((o) => !o);

  // Current step fallback
  const currentStep = steps[stepIdx] || { array, left: 0, right: array.length - 1, k} // stage: "selectPivot" };

  //VISUALIZER
  return (
    <div>
      <h2>QuickSelect Visualizer</h2>

      <button
        style={{
          position: "fixed",
          left: "0", top: "50%", zIndex: 1100,
          transform: "translateY(-50%)",
          background: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "0 4px 4px 0",
          padding: "0.5em",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          transition: "all 1s ease"
        }}
        onClick={toggleLeftPanel}
      >
        {leftOpen ? "⮜" : "⮞"}
      </button>

      <LeftPanel
        isOpen={leftOpen}
        collapsePanel={() => setLeftOpen(false)}
        onSetArray={handleSetArray}
        onFindK={handleFindK}
        showPivotMode={true}
        onPivotModeChange={setPivotMode}
      />

      <ArrayDisplay
        array={currentStep.array}
        left={currentStep.left}
        right={currentStep.right}
        k={currentStep.k}
        foundValue={currentStep.found}
        pivotIndex={currentStep.pivotIndex}
        stage={pivotChosen ? currentStep.stage : "selectPivot"}
        onPivotSelect={!pivotChosen && pivotMode === "manual" ? choosePivot : undefined}
        pivotValue={currentStep.pivotValue}
        currentCompare={currentStep.currentCompare}
        storeIndex={currentStep.storeIndex}
      />

      <div>
        <b>Step {stepIdx + 1} / {steps.length}:</b> {currentStep.desc}
      </div>

      <BottomPanel
        stepIdx={stepIdx}
        setStepIdx={setStepIdx}
        stepsLength={steps.length}
        nextStep={() => setStepIdx(Math.min(stepIdx + 1, steps.length - 1))}
        prevStep={() => setStepIdx(Math.max(stepIdx - 1, 0))}
        reset={() => setStepIdx(0)}
        goToFirst={() => setStepIdx(0)}
        goToLast={() => setStepIdx(steps.length - 1)}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
      />
    </div>
  );
}

export default QuickSelectVisualizer;