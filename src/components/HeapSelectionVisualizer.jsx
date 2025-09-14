import React, {useEffect, useState } from "react";
import ArrayDisplay from "./ArrayDisplay";
import HeapDisplay from "./HeapDisplay";
import Controls from "./Controls";
import LeftPanel from "./LeftPanel";
import BottomPanel from "./BottomPanel";

const defaultArray = [7, 10, 4, 3, 20, 15];
const defaultK = 3;

// Helper to maintain Max-Heap: Max-Heapify for array heap representation
function maxHeapify(heap, i, heapSize) {
  let largest = i;
  let left = 2*i + 1;
  let right = 2*i + 2;
  if (left < heapSize && heap[left] > heap[largest]) largest = left;
  if (right < heapSize && heap[right] > heap[largest]) largest = right;
  if (largest !== i) {
    [heap[i], heap[largest]] = [heap[largest], heap[i]];
    maxHeapify(heap, largest, heapSize);
  }
}
// function buildMaxHeap(heap) {
//   let heapSize = heap.length;
//   for (let i = Math.floor(heapSize/2)-1; i >= 0; i--) {
//     maxHeapify(heap, i, heapSize);
//   }
// }
function extractMax(heap) {
  if (heap.length === 0) return null;
  const max = heap[0];
  heap[0] = heap[heap.length-1];
  heap.pop();
  maxHeapify(heap, 0, heap.length);
  return max;
}
function insertMaxHeap(heap, val) {
  heap.push(val);
  let i = heap.length - 1;
  while (i > 0) {
    let parent = Math.floor((i - 1)/2);
    if (heap[parent] < heap[i]) {
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    } else break;
  }
}


function minHeapify(heap, i, heapSize) {
  let smallest = i;
  const left = 2*i + 1;
  const right = 2*i + 2;
  if (left < heapSize && heap[left] < heap[smallest]) smallest = left;
  if (right < heapSize && heap[right] < heap[smallest]) smallest = right;
  if (smallest !== i) {
    [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
    minHeapify(heap, smallest, heapSize);
  }
}
function insertMinHeap(heap, val) {
  heap.push(val);
  let i = heap.length - 1;
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (heap[parent] > heap[i]) {
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    } else break;
  }
}
function extractMin(heap) {
  if (heap.length === 0) return null;
  const min = heap[0];
  heap[0] = heap[heap.length - 1];
  heap.pop();
  minHeapify(heap, 0, heap.length);
  return min;
}

//Step geneartor function to visualize heap-based selection
function heapSelectionSteps(arr, kNum, userK, kType = "smallest") {
  const steps = [];
  let heap = [];

  if (kNum < 0 || kNum >= arr.length) {
    steps.push({
      heap: [],
      array: [...arr],
      idx: 0,
      action: `Invalid k: ${userK} exceeds array bounds.`,
      stage: "error"
    });
    return steps;
  }

  const isLargest = kType === "largest";

  // Step 1: Insert first k elements into max-heap
  for (let i = 0; i < kNum; i++) {
    if (isLargest) {
      insertMinHeap(heap, arr[i]);
    } else {
      insertMaxHeap(heap, arr[i]);
    }
    steps.push({
      heap: [...heap],
      array: [...arr],
      idx: i,
      action: `Inserted ${arr[i]} to heap`,
      root: heap[0],
      stage: "build"
    });
  }

  // Step 2: Process remaining elements
  for (let i = kNum; i < arr.length; i++) {
    steps.push({
      heap: [...heap],
      array: [...arr],
      idx: i,
      action: `Comparing ${arr[i]} with heap root ${heap[0]}`,
      root: heap[0],
      stage: "compare"
    });
    if(isLargest) {
      // For k-th largest, use min-heap and replace root if arr[i] > heap[0]
      if (arr[i] > heap[0]) {
        const removed = extractMin(heap);
        steps.push({
          heap: [...heap],
          array: [...arr],
          idx: i,
          action: `Removed root ${removed}`,
          root: heap[0],
          stage: "remove"
        });
        insertMinHeap(heap, arr[i]);
        steps.push({
          heap: [...heap],
          array: [...arr],
          idx: i,
          action: `Inserted ${arr[i]} to heap`,
          root: heap[0],
          stage: "insert"
        });
      }
    } else {
      // For k-th smallest, use max-heap and replace root if arr[i] < heap[0]
      if(arr[i] < heap[0]) {
        const removed = extractMax(heap);
        steps.push({
          heap: [...heap],
          array: [...arr],
          idx: i,
          action: `Removed root ${removed}`,
          root: heap[0],
          stage: "remove"
        });
        insertMaxHeap(heap, arr[i]);
        steps.push({
          heap: [...heap],
          array: [...arr],
          idx: i,
          action: `Inserted ${arr[i]} to heap`,
          root: heap[0],
          stage: "insert"
        });
      }
    }
  }
  // Final step: The root is the k-th smallest or largest
  let sortedArr = [...arr].sort((a, b) => a - b);
  let resultValue;
  let resultIndex;
  if (isLargest) {
    resultValue = heap[0];
    // k-th largest is at sortedArr[sortedArr.length - kNum]
    resultIndex = arr.indexOf(sortedArr[sortedArr.length - kNum]);
  } else {
    resultValue = heap[0];
    // k-th smallest is at sortedArr[kNum - 1]
    resultIndex = arr.indexOf(sortedArr[kNum - 1]);
  }

  steps.push({
    heap: [...heap],
    array: [...arr],
    idx: arr.length,
    action: isLargest
      ? `Heap root ${resultValue} is the k-th (${userK}) largest`
      : `Heap root ${resultValue} is the k-th (${userK}) smallest`,
    root: resultValue,
    stage: "found",
    foundValue: resultValue,
    k: resultIndex
  });

  return steps;
}


function HeapSelectionVisualizer() {
  const [array, setArray] = useState(defaultArray);
  const [k, setK] = useState(defaultK);
  const [steps, setSteps] = useState(() => heapSelectionSteps(array, k));
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [leftOpen, setLeftOpen] = useState(false);
  useEffect(() => { setLeftOpen(true); }, []);

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
      setK(1); //default k
      setSteps([]);
      setStepIdx(0);
      setIsPlaying(false);
  }
  
  const handleFindK = ({ k, kType }) => {
    const userK = k;
    let kNum = k;

    setK(userK);
    const steps = heapSelectionSteps(array, kNum, userK, kType);
    setSteps(steps);
    setStepIdx(0);
    setIsPlaying(true);
  };

  const toggleLeftPanel = () => setLeftOpen(o => !o);
  const currentStep = steps[stepIdx] || {};

//VISUALIZER
  return (
    <div>
      <h2>Heap-Based Selection Visualizer</h2>
      
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
        showPivotMode={false} // No pivot mode for heap selection
      />

      <div>
        {steps.length > 0 && currentStep.array ? (
            <ArrayDisplay {...currentStep} />
        ) : (
              <ArrayDisplay array={array} />
        )}
      </div>
       
      {steps.length > 0 && currentStep.heap ? (
         <HeapDisplay heap={currentStep.heap} />
      ) : (
          <div style={{ textAlign: "center", marginTop: "1em", color: "gray" }}>
              Heap will appear here after running the algorithm.
          </div>
        )}

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
      <div>
        <b>Step {stepIdx + 1} of {steps.length}:</b> {currentStep.action}
      </div>
    </div>
  );
}

export default HeapSelectionVisualizer;