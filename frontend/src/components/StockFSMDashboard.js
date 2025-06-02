import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, AlertTriangle } from 'lucide-react';

const StockFSMDashboard = () => {
  const [currentState, setCurrentState] = useState('D'); // Start at Sideways
  const [priceChange, setPriceChange] = useState(0);
  const [stockSymbol, setStockSymbol] = useState('AAPL');
  const [stateHistory, setStateHistory] = useState([
    { timestamp: new Date().toLocaleTimeString(), state: 'D', priceChange: 0, stateName: 'Sideways' }
  ]);

  // FSM State definitions
  const states = {
    'A': { name: 'Growth', color: 'bg-green-500', icon: TrendingUp, description: 'Strong upward momentum' },
    'B': { name: 'Correction', color: 'bg-yellow-500', icon: BarChart3, description: 'Temporary pullback in uptrend' },
    'C': { name: 'Downtrend', color: 'bg-orange-500', icon: TrendingDown, description: 'Consistent decline' },
    'D': { name: 'Sideways', color: 'bg-blue-500', icon: Minus, description: 'Consolidation phase' },
    'E': { name: 'Decline', color: 'bg-red-500', icon: AlertTriangle, description: 'Severe downward movement' }
  };

  // FSM Transitions (simplified example - you'll need to implement full transition logic)
  const getNextState = (currentState, input) => {
    const transitions = {
      'A': { '0': 'A', '1': 'B', '2': 'C' },
      'B': { '0': 'A', '1': 'D', '2': 'C' },
      'C': { '0': 'B', '1': 'D', '2': 'E' },
      'D': { '0': 'A', '1': 'D', '2': 'C' },
      'E': { '0': 'C', '1': 'D', '2': 'E' }
    };
    
    return transitions[currentState]?.[input] || currentState;
  };

  // Convert price change to FSM input symbol
  const getPriceSymbol = (change) => {
    if (change > 3) return '0';
    if (change >= -3) return '1';
    return '2';
  };

  const handlePriceSubmit = () => {
    const symbol = getPriceSymbol(priceChange);
    const nextState = getNextState(currentState, symbol);
    
    setCurrentState(nextState);
    setStateHistory(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        state: nextState,
        priceChange: priceChange,
        stateName: states[nextState].name
      },
      ...prev.slice(0, 9) // Keep last 10 entries
    ]);
  };

  const StateNode = ({ stateKey, isActive }) => {
    const state = states[stateKey];
    const IconComponent = state.icon;
    
    return (
      <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
        isActive 
          ? `${state.color} text-white border-white shadow-lg scale-110` 
          : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400'
      }`}>
        <div className="flex items-center justify-center mb-2">
          <IconComponent size={24} />
        </div>
        <div className="text-center">
          <div className="font-bold text-sm">{stateKey}</div>
          <div className="text-xs">{state.name}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Stock Market FSM Analyzer</h1>
        <p className="text-gray-600">Analyze trader psychology through Finite State Machine modeling</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FSM Visualization */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Market State</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StateNode stateKey="A" isActive={currentState === 'A'} />
            <StateNode stateKey="B" isActive={currentState === 'B'} />
            <StateNode stateKey="C" isActive={currentState === 'C'} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 justify-center max-w-md mx-auto">
            <StateNode stateKey="D" isActive={currentState === 'D'} />
            <StateNode stateKey="E" isActive={currentState === 'E'} />
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700">Current State: {states[currentState].name}</h3>
            <p className="text-sm text-gray-600">{states[currentState].description}</p>
          </div>
        </div>

        {/* Input Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Market Input</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Symbol
              </label>
              <input
                type="text"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter stock symbol"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Change (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={priceChange}
                onChange={(e) => setPriceChange(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter price change percentage"
              />
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>FSM Input Mapping:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Symbol 0: Price change &gt; 3%</li>
                <li>• Symbol 1: -3% ≤ Price change ≤ 3%</li>
                <li>• Symbol 2: Price change &lt; -3%</li>
              </ul>
              <div className="mt-2">
                <strong>Current Symbol: {getPriceSymbol(priceChange)}</strong>
              </div>
            </div>
            
            <button
              onClick={handlePriceSubmit}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Submit Price Change
            </button>
          </div>
        </div>
      </div>

      {/* State History */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">State Transition History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3">Time</th>
                <th className="text-left py-2 px-3">State</th>
                <th className="text-left py-2 px-3">State Name</th>
                <th className="text-left py-2 px-3">Price Change (%)</th>
                <th className="text-left py-2 px-3">FSM Symbol</th>
              </tr>
            </thead>
            <tbody>
              {stateHistory.map((entry, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3">{entry.timestamp}</td>
                  <td className="py-2 px-3">
                    <span className={`inline-block w-8 h-8 rounded text-white text-center leading-8 text-sm font-bold ${states[entry.state].color}`}>
                      {entry.state}
                    </span>
                  </td>
                  <td className="py-2 px-3">{entry.stateName}</td>
                  <td className="py-2 px-3 font-mono">
                    <span className={entry.priceChange > 0 ? 'text-green-600' : entry.priceChange < 0 ? 'text-red-600' : 'text-gray-600'}>
                      {entry.priceChange > 0 ? '+' : ''}{entry.priceChange.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono">{getPriceSymbol(entry.priceChange)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockFSMDashboard;