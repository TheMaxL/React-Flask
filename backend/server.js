const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors()); // allow requests from frontend
app.use(express.json());

app.post('/analyze', (req, res) => {
  const { input } = req.body;
  const inputs = input.split(',').map(s => s.trim());

  // Example FSM logic
  const trace = inputs.map((val, idx) => `State${idx}_${val}`); // replace with real FSM

  res.json({ trace });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});