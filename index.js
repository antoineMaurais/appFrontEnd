const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const mongoUser = 'admin';
const mongoPassword = 'admin';
const mongoHost = 'mongodb';
const mongoPort = '27017';
const mongoConnection = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/school`;

mongoose.connect(mongoConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const studentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  className: String,
});

const Student = mongoose.model('Student', studentSchema);

app.use(express.json());

// Serve the React app build
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/students', async (req, res) => {
  const { firstName, lastName, className } = req.body;
  const student = new Student({ firstName, lastName, className });

  try {
    await student.save();
    res.status(201).send(student);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.send(students);
  } catch (error) {
    res.status(500).send(error);
  }
});



// Handle other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

