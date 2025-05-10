import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [fsm, setFsmData] = useState(null);
  const [inputSeries, setInputSeries] = useState('');
  const [trace, setTrace] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/fsm')
      .then(response => {
        setFsmData(response.data);
      })
      .catch(error => {
        console.error("Failed to fetch FSM:", error);
      });
  }, []);

  const analyzeFSM = async (series) => {
    try {
      // Step 1: Analyze the input series
      const analyzeResponse = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ series }),
      });

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok) {
        console.error("FSM analysis failed:", analyzeData.error);
        setError(analyzeData.error || "FSM analysis failed.");
        setTrace([]);
        return;
      }

      const trace = analyzeData.trace;
      setTrace(trace);
      setError('');

      // Step 2: Save the result to the database
      const saveResponse = await fetch("http://localhost:5000/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_series: series.join(","),
          result_trace: trace,
        }),
      });

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        console.error("Save failed:", saveData.error);
        alert("Failed to save FSM run.");
        return;
      }

      console.log("FSM run saved with ID:", saveData.id);
      alert("FSM run analyzed and saved successfully!");
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong during the process.");
    }
  };

  const handleAnalyzeAndSave = () => {
    const series = inputSeries.split(',').map(str => str.trim()).map(Number);

    if (series.some(isNaN)) {
      setError('Please enter a valid sequence of numbers, e.g., 0,1,2,0');
      setTrace([]);
      return;
    }

    analyzeFSM(series);
  };

  return (
    <div className="container">
      <h1 className="title">FSM Stock Analyzer</h1>

      {fsm && (
  <div className="fsm-box">
    <h3>FSM States:</h3>
    <ul>
      {fsm.states && fsm.states.map((state, index) => (
        <li key={index}>{state}</li>
      ))}
    </ul>

    <h3>FSM Transitions:</h3>
    {fsm.transitions && Object.entries(fsm.transitions).map(([state, transitions]) => (
      <div key={state}>
        <strong>{state}</strong>
        <ul>
          {Object.entries(transitions).map(([input, nextState]) => (
            <li key={input}>
              On input <code>{input}</code> → <strong>{nextState}</strong>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
)}
      <input
        value={inputSeries}
        onChange={(e) => setInputSeries(e.target.value)}
        placeholder="Enter signal sequence like 0,1,2,0"
      />
      <button className="analyze-button" onClick={handleAnalyzeAndSave}>
        Analyze & Save
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </div>
      )}

      {trace.length > 0 && (
        <div className="output-banner">
          <h3>Resulting States:</h3>
          {trace.map((state, i) => (
            <div key={i}>{i}: {state}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
