// Importation des modules nécessaires
const express = require('express'); // Framework web pour Node.js
const mongodb = require('mongodb'); // Driver MongoDB pour Node.js
const path = require('path'); // Module pour manipuler les chemins de fichiers

// Initialisation de l'application Express
const app = express();
const port = 3000; // Port sur lequel le serveur va écouter

// Informations de connexion à la base de données MongoDB
const mongoUser = 'admin';
const mongoPassword = 'admin';
const mongoHost = '192.168.100.102';
const mongoPort = '27017';
const mongoDatabase = 'dbStudent';

// Construction de l'URL de connexion à MongoDB
const mongoConnection = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}`;

// Création d'une instance du client MongoDB
const mongClient = new mongodb.MongoClient(mongoConnection);

// Données initiales d'étudiants à insérer dans la base de données
const studentsData = [
  { firstName: 'John', lastName: 'Doe', className: 'A' },
  { firstName: 'Jane', lastName: 'Smith', className: 'B' },
  { firstName: 'Bob', lastName: 'Johnson', className: 'A' }
];

// Fonction asynchrone pour initialiser la base de données
async function initDB(req, res) {
  try {
    await mongClient.connect(); // Connexion à la base de données
    let database = mongClient.db(mongoDatabase);
    let students = database.collection('students');
    let studentsCount = await students.countDocuments();

    // Vérification si la base de données est vide, puis insertion des données initiales
    if (studentsCount === 0) {
      await students.insertMany(studentsData);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Utilisation du middleware pour analyser les données JSON dans les requêtes
app.use(express.json());

// Serveur des fichiers statiques de l'application React
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint POST pour ajouter un étudiant à la base de données
app.post('/api/students', async (req, res) => {
  const { firstName, lastName, className } = req.body;
  const student = { firstName, lastName, className };

  try {
    await mongClient.connect(); // Connexion à la base de données si nécessaire
    let database = mongClient.db(mongoDatabase);
    await database.collection('students').insertOne(student);
    res.status(201).send(student);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint GET pour récupérer tous les étudiants de la base de données
app.get('/api/students', async (req, res) => {
  try {
    await mongClient.connect(); // Connexion à la base de données si nécessaire
    let database = mongClient.db(mongoDatabase);
    const students = await database.collection('students').find({}).toArray();
    res.send(students);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Gestion des autres routes en servant l'application React
app.get('*', (req, res) => {
  initDB(req, res);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware pour la gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Lancement du serveur sur le port spécifié
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
