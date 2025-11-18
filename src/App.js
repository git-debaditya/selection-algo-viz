import React from "react";
import {HashRouter as Router, Routes, Route} from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

import Navbar from "./components/Navbar";
import QuickSelectVisualizer from "./components/QuickSelectViz";
import MedianOfMediansVisualizer from "./components/MedianOfMediansViz";
import HeapSelectionVisualizer from "./components/HeapSelectionVisualizer";

function App() {
  return (
    <ThemeProvider theme ={theme}>
      <CssBaseline />
      <Router>
          <Navbar />
          <div style = {{padding: 24, display: "flex", justifyContent :"center", alignItems: "center", height: "90vh"}}>
            <Routes>
              <Route path="/" element={<h2>Welcome! Let's start visualizing.</h2>}/>
              <Route path="/quick-select" element={<QuickSelectVisualizer/>}/>
              <Route path="/median-of-medians" element={<MedianOfMediansVisualizer/>}/>
              <Route path="/heap-based" element={<HeapSelectionVisualizer/>}/>
            </Routes>
          </div>
      </Router>
        <div style={{ display: "flex", flexDirection: "column" }}>
        </div>
    </ThemeProvider>
  );
}
export default App;