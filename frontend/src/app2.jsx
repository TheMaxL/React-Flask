import React, { useState } from 'react';
import FSMVisualizer from './components/FSMVisualizer';
import InputSimulator from './components/InputSimulator';
import HistoryLog from './components/HistoryLog';
import { sendPriceChange } from './api';

function App() {
  const [currentState, setCurrentState] = useState('D'); // Default: Sideways
  const [history, setHistory] = useState([]);

  const handleNewPriceChange = async (change) => {
    const res = await sendPriceChange(change);
    setCurrentState(res.state);
    setHistory(prev => [...prev, { input: change, state: res.state }]);
  };

  return (
    <div className="p-6 font-sans max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Business Trends FSM</h1>
      <FSMVisualizer currentState={currentState} />
      <InputSimulator onSubmit={handleNewPriceChange} />
      <HistoryLog history={history} />
    </div>
  );
}

export default App;
