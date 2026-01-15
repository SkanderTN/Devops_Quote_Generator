const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Quote API is running! ', status: 'healthy' });
});

// Placeholder for quote route 
app.get('/quote', (req, res) => {
  res.json({ quote: 'This is a placeholder - full implementation coming soon!' });
});

app.listen(PORT, () => {
  console.log(`🎉 Quote API running on port ${PORT}`);
});