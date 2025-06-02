import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [fsm, setFsmData] = useState(null);
  const [inputSeries, setInputSeries] = useState('');
  const [trace, setTrace] = useState([]);
  const [error, setError] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [finalState, setFinalState] = useState(null);

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
        return null;
      }

      const trace = analyzeData.trace;
      setTrace(trace);
      setError('');

      await fetch("http://localhost:5000/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_series: series.join(","),
          result_trace: trace,
        }),
      });

      return trace;
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong during the process.");
      return null;
    }
  };

  const getSignal = async (ticker) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stock_state/${ticker}`);
      const data = await response.json();
      console.log("Stock signal:", data.signal);
    } catch (error) {
      console.error("Error fetching signal:", error);
    }
  };

  const fetchAndAnalyze = async (ticker) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stock_state/${ticker}`);
      const data = await response.json();

      const sequence = data.map(([time, state]) => state);

      if (sequence.length === 0) {
        setError("No stock data available for the last hour.");
        setTrace([]);
        return;
      }

      console.log(`Fetched hourly sequence for ${ticker}:`, sequence);

      setInputSeries(sequence.join(","));
      const fsmTrace = await analyzeFSM(sequence);

      if (fsmTrace && fsmTrace.length > 0) {
        setFinalState(fsmTrace[fsmTrace.length - 1]);
      }
    } catch (err) {
      console.error(err);
      setError("Network error: Could not fetch stock state.");
    }
  };

  const handleAnalyzeAndSave = async () => {
    const series = inputSeries.split(',').map(str => str.trim()).map(Number);

    if (series.some(isNaN)) {
      setError('Please enter a valid sequence of numbers, e.g., 0,1,2,0');
      setTrace([]);
      return;
    }

    const fsmTrace = await analyzeFSM(series);
    if (fsmTrace && fsmTrace.length > 0) {
      setFinalState(fsmTrace[fsmTrace.length - 1]);
    }
  };

  const handleDropdownChange = (e) => {
    setSelectedTicker(e.target.value);
  };

  const handleFetchAndAnalyzeClick = () => {
    fetchAndAnalyze(selectedTicker);
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

        {finalState !== null && (
          <div className="final-state-banner">
            <h3>Final State:</h3>
            <div>{finalState}</div>
          </div>
        )}
      </div>

      <div className="stocksearch">
        <h1 className="stocktitle">Stock Search</h1>
      </div>

      <div className="stock-buttons">
        <select value={selectedTicker} onChange={handleDropdownChange}>
          <option value="ASTS">AST SpaceMobile (ASTS)</option>
          <option value="BMBL">Bumble Inc. (BMBL)</option>
          <option value="IONQ">IONQ Inc. (IONQ)</option>
          <option value="COIN">Coinbase Global Inc. (COIN)</option>
          <option value="FUBO">FuboTv inc. (FUBO)</option>
          <option value="JOBY">Joby Aviation (JOBY)</option>
          <option value="PLTR">Palantir Technologies (PLTR)</option>
          <option value="RIVN">Rivian Automative (RIVN)</option>
          <option value="LMND">Lemonade Inc. (LMND)</option>
          <option value="UPST">Upstart Holdings (UPST)</option>
        </select>
        <button onClick={handleFetchAndAnalyzeClick}>Fetch & Analyze</button>
      </div>
    </div>
  );
}

export default App;
