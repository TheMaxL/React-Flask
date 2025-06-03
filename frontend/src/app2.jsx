import React, { useState, useEffect } from 'react';
import './index.css'; 
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

function StockMarketFSM() {
  const states = {
    'A': { name: 'Growth', description: 'Strong upward momentum with sustained buying pressure', class: 'state-growth' },
    'B': { name: 'Correction', description: 'Temporary pullback in an overall uptrend', class: 'state-correction' },
    'C': { name: 'Downtrend', description: 'Consistent decline with selling pressure', class: 'state-downtrend' },
    'D': { name: 'Sideways', description: 'Market is in consolidation phase with minimal price movement', class: 'state-sideways' },
    'E': { name: 'Decline', description: 'Severe downward movement with panic selling', class: 'state-decline' }
  };

  const transitions = {
    'A': { '0': 'A', '1': 'B', '2': 'C' },
    'B': { '0': 'A', '1': 'D', '2': 'C' },
    'C': { '0': 'B', '1': 'D', '2': 'E' },
    'D': { '0': 'A', '1': 'D', '2': 'C' },
    'E': { '0': 'C', '1': 'D', '2': 'E' }
  };

  const [analysisResult, setAnalysisResult] = useState('');
  const [investmentAdvice, setInvestmentAdvice] = useState('');
  const [currentState, setCurrentState] = useState('D');
  const [stockSymbol, setStockSymbol] = useState('AAPL');
  const [priceChange, setPriceChange] = useState(0);
  const [selectedTicker, setSelectedTicker] = useState('ASTS');
  const [history, setHistory] = useState([
    {
      time: new Date().toLocaleTimeString(),
      state: 'D',
      stateName: 'Sideways',
      priceChange: 0,
      symbol: '1'
    }
  ]);

  useEffect(() => {
    const header = document.querySelector('.header h1');
    if (header) {
      header.addEventListener('dblclick', runDemo);
      return () => header.removeEventListener('dblclick', runDemo);
    }
  }, []);

  const getPriceSymbol = (change) => {
    if (change > 3) return '0';
    if (change >= -3) return '1';
    return '2';
  };

  const currentSymbol = getPriceSymbol(priceChange);
  const getNextState = (current, input) => transitions[current]?.[input] || current;
  const highlightState = setCurrentState;

  const submitPriceChange = () => {
    const symbol = getPriceSymbol(priceChange);
    const nextState = getNextState(currentState, symbol);
    setCurrentState(nextState);
    addToHistory(stockSymbol, priceChange, symbol, nextState);
    setPriceChange(0);
  };

  const addToHistory = (symbol, change, fsmSymbol, state) => {
    const newEntry = {
      time: new Date().toLocaleTimeString(),
      state,
      stateName: states[state].name,
      priceChange: change,
      symbol: fsmSymbol
    };
    setHistory(prev => [newEntry, ...prev.slice(0, 13)]);
  };

  const getAdviceClass = (advice) => {
    const mapping = {
      "Invest": "invest",
      "Wait": "wait",
      "Not Safe": "not-safe",
      "No Clear Signal": "neutral",
      "Could not analyze data": "error"
    };
    return mapping[advice] || "neutral";
  };

  const runDemo = () => {
    const demoChanges = [5.2, -1.5, -4.1, 2.8, -0.5, 6.3, -2.1];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= demoChanges.length) return clearInterval(interval);
      setPriceChange(demoChanges[i]);
      setTimeout(() => submitPriceChange(), 500);
      i++;
    }, 2000);
  };

  const handleKeyDown = e => { if (e.key === 'Enter') submitPriceChange(); };
  const handleDropdownChange = e => setSelectedTicker(e.target.value);

  const handleFetchAndAnalyzeClick = async () => {
    try {
      console.log(`Fetching data for ${selectedTicker}`);
      setStockSymbol(selectedTicker);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  const fetchHistoricalStates = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/stock_state/${selectedTicker}`);
      const result = await response.json();

      if (Array.isArray(result)) {
        const dailyChanges = result.map(([date, percentChange]) => {
          if (percentChange > 3) return 0;
          if (percentChange < -3) return 2;
          return 1;
        });

        const analyzeRes = await fetch('http://localhost:5000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ series: dailyChanges })
        });

        const { trace } = await analyzeRes.json();

        const stateNameMap = {
          'A': 'Growth',
          'B': 'Correction',
          'C': 'Downtrend',
          'D': 'Sideways',
          'E': 'Decline'
        };

        const newHistory = trace.map((stateLetter, i) => {
          return {
            time: result[i][0],
            state: stateLetter,
            stateName: stateNameMap[stateLetter] || 'Unknown',
            priceChange: result[i][1].toFixed(2) + '%',
            symbol: dailyChanges[i]
          };
        });

        const lastState = trace[trace.length-1] || 'D';
        const lastDayTrend = stateNameMap[lastState] || 'Unknown';

        setCurrentState(lastState);
        setHistory(newHistory);

        await analyzeHistory(lastDayTrend);
      }
    } catch (error) {
      console.error('Failed to fetch stock states:', error);
      setAnalysisResult("Error");
      setInvestmentAdvice("Could not fetch history");
    }
  };

  const analyzeHistory = async (trend) => {
    try {
      setAnalysisResult(trend);

      if (trend === "Growth") {
        setInvestmentAdvice("Invest");
      } else if (["Correction", "Sideways"].includes(trend)) {
        setInvestmentAdvice("Wait");
      } else if (["Downtrend", "Decline"].includes(trend)) {
        setInvestmentAdvice("Not Safe");
      } else {
        setInvestmentAdvice("No Clear Signal");
      }
    } catch (err) {
      console.error("Error analyzing history:", err);
      setAnalysisResult("Error");
      setInvestmentAdvice("Could not analyze data");
    }
  };

  const fetchSignalAndRunFSM = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/stock_signal/${selectedTicker}`);
      const data = await response.json();
      const signal = data.signal;
      if (signal !== null && signal !== undefined) {
        const nextState = getNextState(currentState, signal.toString());
        setCurrentState(nextState);
        addToHistory(selectedTicker, `API signal: ${signal}`, signal.toString(), nextState);
      } else {
        console.error('Invalid signal received from backend');
      }
    } catch (error) {
      console.error('Error fetching stock signal:', error);
    }
  };

  const chartData = history.slice().map((entry, index) => ({
    time: entry.time,
    value: typeof entry.priceChange === 'string' ? parseFloat(entry.priceChange) : entry.priceChange
  }));

  return (
    <div className="container">
      <div className="header">
        <h1>📈 Stock Market FSM Analyzer</h1>
        <p>Analyze trader psychology through Finite State Machine modeling</p>
      </div>
      
      <div className="chart-container">
        <h2>📉 Price Change Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" interval={Math.ceil(chartData.length / 8)} angle={-35} textAnchor="end" height={60} />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>


      <div className="main-grid">
        <div className="card">
          <h2>🔄 Current Market State</h2>
          <div className="fsm-grid">
            {['A', 'B', 'C'].map(key => (
              <div key={key} className={`state-node ${states[key].class} ${currentState === key ? 'active pulse' : ''}`} onClick={() => highlightState(key)}>
                <span className="state-icon">{key === 'A' ? '📈' : key === 'B' ? '📊' : '📉'}</span>
                <div className="state-key">{key}</div>
                <div className="state-name">{states[key].name}</div>
              </div>
            ))}
          </div>

          <div className="fsm-bottom">
            {['D', 'E'].map(key => (
              <div key={key} className={`state-node ${states[key].class} ${currentState === key ? 'active pulse' : ''}`} onClick={() => highlightState(key)}>
                <span className="state-icon">{key === 'D' ? '➡️' : '⚠️'}</span>
                <div className="state-key">{key}</div>
                <div className="state-name">{states[key].name}</div>
              </div>
            ))}
          </div>

          <div className="current-state-info">
            <h3>Current State: {states[currentState].name} ({currentState})</h3>
            <p>{states[currentState].description}</p>
          </div>
        </div>

        <div className="card">
          <h2>📊 Market Input</h2>

          <div className="stock-buttons">
            <select value={selectedTicker} onChange={handleDropdownChange}>
              {[
                { ticker: 'ASTS', name: 'AST SpaceMobile' },
                { ticker: 'BMBL', name: 'Bumble Inc.' },
                { ticker: 'IONQ', name: 'IonQ Inc.' },
                { ticker: 'COIN', name: 'Coinbase Global' },
                { ticker: 'FUBO', name: 'FuboTV Inc.' },
                { ticker: 'JOBY', name: 'Joby Aviation' },
                { ticker: 'PLTR', name: 'Palantir Technologies' },
                { ticker: 'RIVN', name: 'Rivian Automotive' },
                { ticker: 'LMND', name: 'Lemonade Inc.' },
                { ticker: 'UPST', name: 'Upstart Holdings' },
                { ticker: 'NVTA', name: 'Invitae Corporation' },
                { ticker: 'SOFI', name: 'SoFi Technologies Inc.' },
                { ticker: 'NKLA', name: 'Nikola Corporation' },
                { ticker: 'BBIG', name: 'Vinco Ventures Inc.' },
                { ticker: 'CEI', name: 'Camber Energy Inc.' },
                { ticker: 'ROIV', name: 'Roivant Sciences Ltd.' },
                { ticker: 'DNA', name: 'Ginkgo Bioworks Holdings Inc.' },
                { ticker: 'BIGC', name: 'BioCommerce Holdings Inc.' },
                { ticker: 'OPEN', name: 'Opendoor Technologies Inc.' },
                { ticker: 'MARA', name: 'Marathon Digital Holdings Inc.' },
              ].map(({ ticker, name }) => (
                <option key={ticker} value={ticker}>
                  {ticker} ({name})
                </option>
              ))}
            </select>
            <button onClick={fetchHistoricalStates}>Analyze 14-Day History</button>
          </div>

          <div>
            {analysisResult && (
              <div className={`judgement-message ${getAdviceClass(investmentAdvice)}`}>
                <p><strong>Trend:</strong> {analysisResult}</p>
                <p><strong>Final Verdict:</strong> {investmentAdvice}</p>
              </div>  
            )}
          </div>
        </div>

        <div className="card">
          <h2>📜 FSM History</h2>
          <ul className="history-list">
            {history.map((entry, i) => (
              <li key={i} className={`history-entry ${states[entry.state].class}`}>
                <strong>{entry.time}</strong> | {entry.stateName} ({entry.state}) | Change: {entry.priceChange}% | Symbol: {entry.symbol}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StockMarketFSM;
