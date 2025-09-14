import React, {useEffect, useState} from "react";
import ArrayDisplay from "./ArrayDisplay";
import LeftPanel from "./LeftPanel";
import BottomPanel from "./BottomPanel";

//react component for visualization
const defaultArray = [12, 1, 5, 7, 11, 14, 8, 3, 9, 2, 6, 10, 13, 4];
const defaultK = 5; //default k-th smallest element to find

//MedianOfMedian Step Generator
function MedianOfMedians(arr, k, kType, userK, originalArray = arr){
    const steps = [];   //store steps for visualization
    if (k < 0 || k >= arr.length) {
    steps.push({
      idx: 0,
      stage: "error",
      desc: `Invalid k: ${userK} exceeds array bounds.`
    });
    return steps;
  }

    //k:k-th smallest element to find
    function select(arr, k, depth = 0) {
        if (arr.length === 0) return undefined; //base case for empty array
        
        if (arr.length <= 5) { //arrays of length 5 or less are sorted directly
            const sortedLocal = [...arr].sort((a, b) => a - b);  //creates a sorted copy
            const foundValue = sortedLocal[k];

            //records steps and returns k for small arrays
            steps.push ({
                array: [...arr], sorted: sortedLocal, k,
                found: foundValue, //found value
                stage: `baseCase`, depth,
                desc: `k = ${k + 1}, value=${foundValue}`
            });

            // Final sorted array
            const sortedGlobal = [...originalArray].sort((a, b) => a - b);
            
            // //Highlight position of k in sorted array
            // const highlightIdx = k; //sortedGlobal.findIndex(x => x === foundValue);

            // const description = (kType === "largest")
            //     ? `Final sorted array. k-th (${arr.length - highlightIdx}) largest element is ${foundValue}.`
            //     : `Final sorted array. k-th (${highlightIdx + 1}) smallest element is ${foundValue}.`;

            // Push final sorted array step
            steps.push({
                array: sortedGlobal, //k,
                highlightIdx: k,
                foundValue,
                stage: "finalSorted",
                desc: `Final sorted array. k-th (${userK}) ${kType} element is ${foundValue}.`, //`Final sorted array. k-th (${k + 1}) smallest element is ${foundValue}.`
            });
            return foundValue; //return pivot as k-th element
        }
    
        //Step 1: Partition the array into groups of 5 elements
        let groups = [];
        for(let i = 0; i < arr.length; i += 5) {
            groups.push(arr.slice(i, i+5));
        }
        //records the grouping step
        steps.push({
            array: [...arr], groups, k,
            stage: `grouping`, depth,
            desc: `Divided array into groups of 5 elements`
        });

        //Step 2: Find the median of each group
        let medians = groups.map(group => {     //transform each group -> median
            let g = [...group].sort((a, b) => a - b);   //copy and sorts each group
            return g[Math.floor(g.length / 2)];     //Math.floor ensure int idx
        });
        //records the median finding step
        steps.push({
            array: [...arr], groups, medians, k,
            stage: `medians`, depth,
            desc: `Found medians of each group`
        });

        //Step 3: Recursively find the median of medians as pivot
        let pivot;
        if (medians.length === 1) {
            pivot = medians[0]; //if only one median, it is the pivot
            steps.push({
                array: [...arr], groups, medians, pivot,
                k, stage: `pivotSelected`, depth,
                desc: `Only one median, selected as pivot: ${pivot}`
            });
        } else {
            pivot = select(medians, Math.floor(medians.length/2), depth + 1);   //depth for viz clarity
            //records the pivot finding step
            steps.push({
                array: [...arr], groups, medians, pivot, k,
                stage: `pivotSelected`, depth,
                desc: `Selected Median of Medians: ${pivot}`
            });
        }

        //Step 4: Partition the original array around the pivot
        const lows = arr.filter(x => x < pivot);   //elements less than pivot
        const highs = arr.filter(x => x > pivot); //elements greater than pivot
        const mids = arr.filter (x => x === pivot); //elements equal to pivot (duplicates)
        //records the partitioning step
        steps.push({
            array: [...arr], groups, medians, pivot,
            lows, highs, mids, k, stage: `partition`, depth,
            desc: `Partitioned around pivot: ${pivot}`
        });

        //Step 5: Determine k-th element based on pivot position
        if (k < lows.length) {
            return select(lows, k, depth + 1); //recurse partition if k in lows
        } else if (k < lows.length + mids.length) {
            const foundValue = pivot;
            //if k is in mids, return pivot
            steps.push({
                array: [...arr], pivot, k, found: pivot,
                stage: `found`, depth,
                desc: `Found k-th element: ${pivot}`
            });
            
            // After found, push final sorted array
            const sortedGlobal = [...originalArray].sort((a, b) => a - b);
            
            //const highlightIdx = k;
            
            steps.push({
                array: sortedGlobal,
                highlightIdx: k,
                foundValue,
                stage: "finalSorted",
                desc: `Final sorted array. k-th (${userK}) ${kType} element is ${foundValue}.`
            });
            return pivot;
        } else {
            return select(highs, k - lows.length - mids.length, depth + 1);
            //recurse partition if k in highs, as (lows & mids) are discarded
        }
    }
    select([...arr], k, 0); //initial call with depth 0
    return steps; //return all recorded steps for visualization
}

function MedianOfMediansVisualizer() {
    const [array, setArray] = useState(defaultArray);   //initial array
    const [k, setK] = useState(defaultK);   //k-th smallest element to find
    const [kType, setKType] = useState("smallest"); //type of k (smallest/largest)
    const [steps, setSteps] = useState(() => MedianOfMedians(array, k));    //initial steps
    const [stepIdx, setStepIdx] = useState(0);    //current step index for visualization
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
        setK(0); //default k
        setSteps([]);
        setStepIdx(0);
        setIsPlaying(false);
    }

    const handleFindK = ({ k:userK, kType }) => {
        let kNum = userK - 1;
        if (kType === "largest") kNum = array.length - userK;
        setK(kNum);
        setKType(kType);
        const steps = MedianOfMedians(array, kNum, kType, userK);
        setSteps(steps);
        setStepIdx(0);
        setIsPlaying(true);
    };      

    const toggleLeftPanel = () => setLeftOpen((o) => !o); //toggle left panel visibility

    const currentStep = steps[stepIdx] || {}; //get current step for visualization

//VISUALIZER
    return (
        <div>
            <h2>Median of Medians Visualizer</h2>

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
                showPivotMode={false} // No pivot mode for median of medians
            />
            
            <div>
                {steps.length > 0 && currentStep.array ? (
                    <ArrayDisplay {...currentStep} />
                ) : (
                    <ArrayDisplay array={array} />
                )}
            </div>
            
            <div>
                {steps.length > 0 ? (
                    <>
                        <b>Step {stepIdx + 1} of {steps.length}: </b>{currentStep.desc}
                    </>
                ) : (
                    <b>Please click "Find" to start the visualizer.</b>
                )}
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

export default MedianOfMediansVisualizer;