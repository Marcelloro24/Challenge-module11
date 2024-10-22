// Import required modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// HTML Routes
// GET /notes should return the notes.html file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// API Routes
// GET /api/notes should read the db.json file and return all saved notes as JSON
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error reading notes' });
    }
    res.json(JSON.parse(data));
  });
});

// POST /api/notes should receive a new note to save on the request body, add it to db.json, and return the new note
app.post('/api/notes', (req, res) => {
  const newNote = { ...req.body, id: uuidv4() };
  
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error reading notes' });
    }
    
    const notes = JSON.parse(data);
    notes.push(newNote);
    
    fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error saving note' });
      }
      res.json(newNote);
    });
  });
});

// Bonus: DELETE /api/notes/:id
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error reading notes' });
    }
    
    let notes = JSON.parse(data);
    notes = notes.filter(note => note.id !== noteId);
    
    fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error deleting note' });
      }
      res.json({ message: 'Note deleted successfully' });
    });
  });
});

// GET * should return the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
