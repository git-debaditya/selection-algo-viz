import React from "react";

const groupColors = [
  "#ffe082", "#b3e5fc", "#c8e6c9", "#ffccbc", "#e1bee7", "#dcedc8"
];

function ArrayDisplay({
  array, left, 
  desc, right, k,
  pivotIndex, pivotValue, // For QuickSelect
  medianOfMedians,        // For MeMeViz
  groups,                 // For MeMeViz
  highlightIdx,
  stage,                  // current stage (e.g. "grouping", "medians", "partition", "pivotSelected", etc)
  onPivotSelect,          // QuickSelect pivot picking
  onKChange,              // Click-to-set-k for both algorithms
  currentCompare, storeIndex, // For highlighting
  lows, highs, mids       // For partition coloring in MeMeViz
}) {
  // For partition coloring (for MeMeViz "partition" step)
  const getPartitionColor = idx => {
    if (!lows && !highs && !mids) return "#e0f7fa";
    const val = array[idx];
    if (lows && lows.includes(val)) return "#b3e5fc";
    if (highs && highs.includes(val)) return "#ffcdd2";
    if (mids && mids.includes(val)) return "#c8e6c9";
    return "#e0f7fa";
  };

let foundHighlighted = false;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "20px", maxWidth: "800px", textAlign: "center", margin: "20px auto" }}>
      {(array || []).map((val, idx) => {
        let color = "#ddd";
        let border = "1px solid #aaa";
        let pointer = "default";

        // Default for subarray
        if (typeof left === "number" && typeof right === "number" && idx >= left && idx <= right) {
          color = "#e0f7fa";
        }

        // For median-of-medians grouping
        if ((stage === "grouping" || stage === "medians") && groups) {
          // find which group this idx is in
          let groupIdx = 0, pos = 0;
          for (let g = 0; g < groups.length; g++) {
            if (idx >= pos && idx < pos + groups[g].length) {
              groupIdx = g;
              break;
            }
            pos += groups[g].length;
          }
          color = groupColors[groupIdx % groupColors.length];
          // Dotted right border for end of group (not last element)
          const isLastInGroup = groups[groupIdx] && (idx === (pos + groups[groupIdx].length - 1));
          if (isLastInGroup && idx !== array.length - 1) {
            border = "2px dotted #999";
          }
        }

        // For MeMeViz partitioning, show partition colors
        if ((stage === "partition" || stage === "found") && (lows || highs || mids)) {
          color = getPartitionColor(idx);
        }

        if (stage === "finalSorted") {// && idx === highlightIdx) {
          if (typeof highlightIdx !== "undefined" && idx === highlightIdx) {
            color = "#b39ddb"; // Highlight only the correct box
            border = "2px solid purple";
          } else {
            color = "#ffa726"; // orange for the rest of sorted array
            border = "1px solid #aaa";
          }
        }

        // Highlight current pivot index (for QuickSelect only)
        if (typeof pivotIndex === "number" && idx === pivotIndex && !medianOfMedians && stage !== "selectPivot") {
          color = "orange";
          border = "2px solid orange";
        }

        // Highlight median of medians (for MeMeViz only)
        if (typeof medianOfMedians !== "undefined" && val === medianOfMedians && (stage === "pivotSelected" || stage === "partition" || stage === "found")) {
          color = "#e57373";
          border = "2.5px solid #d32f2f";
        }

        // Highlight compare/swapping
        if (idx === currentCompare) border = "2px dashed red";
        if (idx === storeIndex && stage === "swap") border = "2px dashed green";

        // For pivot selection (QuickSelect only)
        let isSelectable = onPivotSelect && stage === "selectPivot";
        if (isSelectable) {
          pointer = "pointer";
          color = "#fff176";
        }

        if (stage === "error") {
          return (
            <div style={{ color: "red", fontWeight: "bold" }}>
              {desc || "Error: Invalid k"}
            </div>
          );
        }


        return (
          <div
            key={idx}
            style={{
              width: "40px",
              height: "40px",
              background: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border,
              borderRadius: "6px",
              fontWeight: idx === k ? "bold" : "normal",
              cursor: pointer,
              position: "relative"
            }}
            onClick={isSelectable ? () => onPivotSelect(idx) : undefined}
          >
            {val}            
              {/* k label */}
              {typeof k === "number" &&
                <span
                onClick={onKChange ? () => onKChange(idx + 1) : undefined}
                style={{
                  position: "absolute", top: "-1.5em", left: 0,
                  fontSize: "0.8em", color: "#512da8", cursor: onKChange ? "pointer" : "default",
                  textDecoration: k === idx ? "underline" : "none",
                  fontWeight: k === idx ? "bold" : "normal"
                }}
                title={onKChange ? `Click to set k = ${idx}` : undefined}
                >
                {idx + 1}
              </span>
              }

              {/* "select" label for pivot selection */}
              {isSelectable &&
                <span style={{
                  position: "absolute", bottom: "-1.75em", left: 0,
                  fontSize: "0.7em", color: "#f57c00"
                }}>select</span>
              }

              {/* "pivot" label for QuickSelect */}
              {pivotValue !== undefined && stage !== "selectPivot" && array[idx] === pivotValue && !medianOfMedians &&
                <span style={{
                  position: "absolute", bottom: "-1.75em", right: 0,
                  fontSize: "0.7em", color: "orange"
                }}>pivot</span>
              }

              {/* "med. medians" label for MeMeViz */}
              {medianOfMedians !== undefined && stage !== "selectPivot" && val === medianOfMedians &&
                <span style={{
                  position: "absolute", bottom: "-1.2em", right: 0,
                  fontSize: "0.7em", color: "#d32f2f"
                }}>med.med</span>
              }
          </div>
        );
      })}
    </div>
  );
}

export default ArrayDisplay;
