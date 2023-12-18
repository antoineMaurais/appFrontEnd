
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

mongoose.connect('mongodb://mongodb:27017/school', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a mongoose schema for the 'students' collection
const studentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  className: String,
});

// Create a mongoose model based on the schema
const Student = mongoose.model('Student', studentSchema);

// Middleware to parse JSON
app.use(express.json());

// Endpoint to add a new student
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

// Endpoint to get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.send(students);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
