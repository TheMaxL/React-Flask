import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [fsm, setFsm] = useState(null);
  const [inputSeries, setInputSeries] = useState('');
  const [trace, setTrace] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/fsm')
      .then(response => {
        setFsmData(response.data);
        // maybe don't render it yet
      })
      .catch(error => {
        console.error("Failed to fetch FSM:", error);
      });
  }, []);

  const analyze = () => {
    const series = inputSeries.split(',').map(str => str.trim()).map(Number);
    console.log("Preparing to send:", series);

    if (series.some(isNaN)) {
      setError('Please enter a valid sequence of numbers, e.g., 0,1,2,0');
      setTrace([]);
      return;
    }

    axios.post("http://localhost:5000/api/analyze", { series })
      
      .then(res => {
        setTrace(res.data.trace);
        setError('');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to analyze input.');
        setTrace([]);
      });
  };

  return (
    <div className="container">
      <h1 className="title">FSM Stock Analyzer</h1>

      {fsm && (
        <div className="fsm-box">
          <h3>FSM Configuration:</h3>
          <pre>{JSON.stringify(fsm, null, 2)}</pre>
        </div>
      )}

      <input
        value={inputSeries}
        onChange={(e) => setInputSeries(e.target.value)}
        placeholder="Enter signal sequence like 0,1,2,0"
      />
      <button className="analyze-button" onClick={analyze}>Analyze</button>

      {/* Error Message */}
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </div>
      )}

      {/* Output Display */}
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

