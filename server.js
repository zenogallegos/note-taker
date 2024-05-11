// Needed requires for routing
const express = require('express');
const path = require('path');
const fs = require('fs');
let noteData = require('./db/db.json');

const PORT = process.env.PORT || 3001;

const app = express();

// Middleware needed
app.use(express.json());
app.use(express.static('public'));

// Route for the homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, './public/index.html'))
);

// Route for notes
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, './public/notes.html'))
);

// Gets data for the notes
app.get('/api/notes', (req, res) => res.json(noteData));

// Delete route for notes
app.delete(`/api/notes/:id`, (req, res) => {
  console.log("Delete the request:" + req.params.id);
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      // Converts the string into a JSON object
      let parsedNotes = JSON.parse(data);

      // Gets rid of the note that was deleted
      parsedNotes = parsedNotes.filter(function( obj ) {
        return obj.id !== req.params.id;
      });
      noteData = parsedNotes;

      // Writes the note list (updated) back to the specified file
      fs.writeFile(
        './db/db.json',
        JSON.stringify(parsedNotes, null, 4),
        (writeErr) =>
          writeErr
            ? console.error(writeErr)
            : console.info('Newly updated notes')
      );
    }
  });
});

// Write notes to JSON
app.post('/api/notes', (req, res) => {
  // Notification that the POST request was successful
  console.info(`Confirmed ${req.method} request for a review`);
  const id = Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  // Makes a new object if the fields have data
  const {title, text} = req.body;
  if(title && text) {
    const newNote = {
      title,
      text,
      id,
    };
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Converts the string into a JSON object
        const parsedNotes = JSON.parse(data);

        // Adds a new note to the JSON database
        parsedNotes.push(newNote);
        // Updates JSON database data
        noteData = parsedNotes;

        // Writes the note list (updated) back to the specified file
        fs.writeFile(
          './db/db.json',
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('updated notes')
        );
      }
    });


  }

});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);