import express from 'express';
import path from 'path';

// Initialize express app
const app = express();

// Serve the static files (for Replit Auth JS and index.html)
app.use(express.static(path.join(__dirname, '../public')));

// Serve the index.html page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Setup the server
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
