import React from 'react';

function HistoryLog({ history }) {
  return (
    <div className="border rounded p-4 bg-white">
      <h2 className="text-xl mb-2">State Transition History</h2>
      <ul className="list-disc pl-5">
        {history.map((entry, index) => (
          <li key={index}>
            Input: {entry.input}% → New State: {entry.state}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HistoryLog;
