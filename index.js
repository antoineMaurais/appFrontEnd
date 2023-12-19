const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const mongoUser = 'admin';
const mongoPassword = 'admin';
const mongoHost = 'mongodb';
const mongoPort = '27017';
const mongoConnection = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}`;

mongoose.connect(mongoConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Quitter l'application en cas d'erreur de connexion à la base de données
});

const initDatabase = async () => {
  try {
    const collectionExists = await mongoose.connection.db.listCollections({ name: 'people' }).hasNext();

    if (!collectionExists) {
      const peopleData = [
        { name: 'John', surname: 'Doe', classe: 'A' },
        { name: 'Jane', surname: 'Smith', classe: 'B' },
        { name: 'Bob', surname: 'Johnson', classe: 'A' },
      ];

      await mongoose.connection.db.createCollection('people');
      await mongoose.connection.db.collection('people').insertMany(peopleData);

      console.log('Database initialized with default data.');
    } else {
      console.log('Database already initialized.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialiser la base de données lors du démarrage du serveur
initDatabase();

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

// Middleware pour la gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});