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

  const getSignal = async (ticker) => {
    const response = await fetch("http://localhost:5000/api/stock_signal",{
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ ticker }),
    });

    const data = await response.json();
    console.log("Stock signal:", data.signal);
  };

  const fetchAndAnalyze = async (ticker) => {
  try {
    const response = await fetch(`http://localhost:5000/api/stock_state/${ticker}`);
    const data = await response.json();

    // Extract the state sequence (we only need the state values, not the timestamps)
    const sequence = data.map(([time, state]) => state);

    if (sequence.length === 0) {
      setError("No stock data available for the last hour.");
      setTrace([]);
      return;
    }

    console.log(`Fetched hourly sequence for ${ticker}:`, sequence);

    analyzeFSM(sequence);
    setInputSeries(sequence.join(","));
  } catch (err) {
    console.error(err);
    setError("Network error: Could not fetch stock state.");
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
    <div>
      <div className="fsm-container">
      <h1 className="fsm-title">FSM Stock Analyzer</h1>

      
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
    <div className="stocksearch">
      <h1 className="stocktitle">Stock Search</h1>
    </div>
    <div className="stock-buttons">
      <button onClick={() => fetchAndAnalyze('AAPL')}>Apple (AAPL)</button>
      <button onClick={() => fetchAndAnalyze('MSFT')}>Microsoft (MSFT)</button>
      
    </div>
    </div>
  );
}

export default App;
