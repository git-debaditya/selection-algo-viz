import React from "react";

function HeapDisplay({ heap = [] }) {
    return (
        <div style={{ display: "flex", gap: "8px", margin: "1em 0", justifyContent: "center" }}>
            {heap.map((val, idx) => (
                <div
                    key={idx}
                    style={{
                        width: "40px",
                        height: "40px",
                        background: idx === 0 ? "#ffe082" : "#e1bee7",
                        borderRadius: "50%",
                        display: "flex", alignContent: "center", justifyContent: "center",
                        fontWeight: idx === 0 ? "bold" : "normal"
                    }}
                >
                    {val}
                </div>
            ))}
        </div>
    );
}

export default HeapDisplay;