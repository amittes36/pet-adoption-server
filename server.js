require('dotenv').config();
const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken');
let tokenes = [];
let users = [];
let pets = [];
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
	users = fs.readFileSync('./db/users.json', 'utf8');
	users = JSON.parse(users);
	pets = fs.readFileSync('./db/pets.json', 'utf8');
	pets = JSON.parse(pets);
	next();
});

app.get('/users', (req, res) => {
	res.json(users);
});

app.get('/pets', (req, res) => {
	req.user;
	res.send(pets);
});

app.get('/adopt', authenticateToken, (req, res) => {
	for (let i in pets.pets) {
		if (pets.pets[i].id == req.query.petId) {
			pets.pets[i].status = 'Adopted';
		}
	}
	fs.writeFile('./db/pets.json', `\n${JSON.stringify(pets)}`, (err) => {
		if (err) console.log(err);
	});
	for (let i in users.users) {
		if (users.users[i].id == req.query.userId) {
			let usersPets = users.users[i].usersPets;
			usersPets.push(req.query.petId);
			users.users[i].usersPets = usersPets;
		}
	}
	fs.writeFile('./db/users.json', `\n${JSON.stringify(users)}`, (err) => {
		if (err) console.log(err);
	});
	res.send(req.body);
});

app.get('/foster', authenticateToken, (req, res) => {
	for (let i in pets.pets) {
		if (pets.pets[i].id == req.query.petId) {
			pets.pets[i].status = 'Fostered';
		}
	}
	fs.writeFile('./db/pets.json', `\n${JSON.stringify(pets)}`, (err) => {
		if (err) console.log(err);
	});
	for (let i in users.users) {
		if (users.users[i].id == req.query.userId) {
			let usersPets = users.users[i].usersPets;
			usersPets.push(req.query.petId);
			users.users[i].usersPets = usersPets;
		}
	}
	fs.writeFile('./db/users.json', `\n${JSON.stringify(users)}`, (err) => {
		if (err) console.log(err);
	});
	res.send(req.body);
});

app.get('/return', authenticateToken, (req, res) => {
	for (let i in pets.pets) {
		if (pets.pets[i].id == req.query.petId) {
			pets.pets[i].status = 'Availble';
		}
	}

	fs.writeFile('./db/pets.json', `\n${JSON.stringify(pets)}`, (err) => {
		if (err) console.log(err);
	});

	for (let i in users.users) {
		if (users.users[i].id == req.query.userId) {
			let usersPets = users.users[i].usersPets;
			const indexToRemove = usersPets.indexOf(req.query.petId);
			usersPets.splice(indexToRemove, 1);
			users.users[i].usersPets = usersPets;
		}
	}
	fs.writeFile('./db/users.json', `\n${JSON.stringify(users)}`, (err) => {
		if (err) console.log(err);
	});

	res.send(req.body);
});

app.post('/users/newUser', (req, res) => {
	users.users.push(req.body.newUser);
	fs.writeFile('./db/users.json', `\n${JSON.stringify(users)}`, (err) => {
		if (err) console.log(err);
	});
	res.send(req.body);
});

app.post('/addPet', (req, res) => {
	pets.pets.push(req.body.newPet);
	fs.writeFile('./db/pets.json', `\n${JSON.stringify(pets)}`, (err) => {
		if (err) console.log(err);
	});
	res.send(req.body);
});

app.post('/users/login', (req, res) => {
	// console.log(req.body.loginUser.email);
	const userEmail = req.body.loginUser.email;
	const user = users.users.find(
		(user) =>
			user.email == userEmail && user.password == req.body.loginUser.password
	);
	// else res.status(500).send('not allowed');
	// if (user) res.status(200).send('Log in success');
	const accessToken = generateAccessToken(user);
	res.json({ accessToken: accessToken, user: user });
});

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (token == null) return res.sendStatus(401);
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
}

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}

app.listen(port, () => {
	console.log(`server listening at http://localhost:${port}`);
});
