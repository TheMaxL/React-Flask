export async function sendPriceChange(change) {
  const response = await fetch('/api/transition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price_change: change })
  });

  return await response.json(); // Expected: { state: "A" | "B" | ... }
}
