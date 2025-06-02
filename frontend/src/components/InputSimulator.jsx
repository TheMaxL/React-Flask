import React, { useState } from 'react';

function InputSimulator({ onSubmit }) {
  const [priceChange, setPriceChange] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (priceChange === '') return;
    onSubmit(parseFloat(priceChange));
    setPriceChange('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label className="block mb-1">Enter price change (%):</label>
      <input
        type="number"
        value={priceChange}
        onChange={(e) => setPriceChange(e.target.value)}
        className="border px-2 py-1 mr-2"
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
        Submit
      </button>
    </form>
  );
}

export default InputSimulator;
