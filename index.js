const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

const mongoUser = 'admin';
const mongoPassword = 'admin';
const mongoHost = '192.168.100.102';
const mongoPort = '27017';
const mongoDatabase = 'dbname'; // Nom de votre base de données
const mongoConnection = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}`;

let db; // Variable pour stocker la référence à la base de données

// Connexion à la base de données MongoDB
MongoClient.connect(mongoConnection, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log('Connected to MongoDB');
    db = client.db(mongoDatabase);

    // Appeler la fonction d'initialisation de la base de données
    initDatabase();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

const initDatabase = async () => {
  try {
    console.log('MongoDB Connection:', db);

    // Création de la base de données si elle n'existe pas
    const dbList = await db.admin().listDatabases();
    if (!dbList.databases.some((database) => database.name === mongoDatabase)) {
      await db.admin().createDatabase(mongoDatabase);
      console.log(`Database ${mongoDatabase} created.`);
    }

    // Utilisation de la base de données
    db = client.db(mongoDatabase);

    // Vérification de l'existence de la collection 'students'
    const collectionExists = await db.listCollections({ name: 'students' }).hasNext();

    if (!collectionExists) {
      const studentsData = [
        { firstName: 'John', lastName: 'Doe', className: 'A' },
        { firstName: 'Jane', lastName: 'Smith', className: 'B' },
        { firstName: 'Bob', lastName: 'Johnson', className: 'A' }
      ];

      // Création de la collection 'students' et insertion des données par défaut
      await db.createCollection('students');
      await db.collection('students').insertMany(studentsData);

      console.log('Students collection initialized with default data.');
    } else {
      console.log('Students collection already initialized.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

app.use(express.json());

// Serve the React app build
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/students', async (req, res) => {
  const { firstName, lastName, className } = req.body;
  const student = { firstName, lastName, className };

  try {
    await db.collection('students').insertOne(student);
    res.status(201).send(student);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await db.collection('students').find({}).toArray();
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
