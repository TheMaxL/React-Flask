import React from 'react';

const stateLabels = {
  A: 'Growth',
  B: 'Correction',
  C: 'Downtrend',
  D: 'Sideways',
  E: 'Decline'
};

function FSMVisualizer({ currentState }) {
  return (
    <div className="border rounded p-4 mb-4 bg-gray-100">
      <h2 className="text-xl mb-2">FSM Visualizer</h2>
      <p>Current State: <strong>{stateLabels[currentState]}</strong> ({currentState})</p>
    </div>
  );
}

export default FSMVisualizer;
