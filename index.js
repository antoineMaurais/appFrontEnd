const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

const mongoUser = 'admin';
const mongoPassword = 'admin';
const mongoHost = '192.168.100.102';
const mongoPort = '27017';
const mongoDatabase = 'dbStudent'; 

const mongoConnection = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}`;

let db; // Variable pour stocker la référence à la base de données

///Test

const mongClient = new mongodb.MongoClient(mongoConnection);

const studentsData = [
  { firstName: 'John', lastName: 'Doe', className: 'A' },
  { firstName: 'Jane', lastName: 'Smith', className: 'B' },
  { firstName: 'Bob', lastName: 'Johnson', className: 'A' }
];

async function initDB(req, res) {
	await mongClient.connect()
	let database = mongClient.db(mongoDatabase)
	let students = database.collection('students')
	let studentsCount = await students.countDocuments()
	if (studentsCount === 0){
		await students.insertMany(studentsData)

	}
	
}
///fin test



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
  initDB(req, res);
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
