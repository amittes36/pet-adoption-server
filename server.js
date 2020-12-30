require('dotenv').config();
const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const port = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const storage = multer.diskStorage({
	destination: 'public/photo-gallery/',
	filename: function (req, file, cb) {
		cb(
			null,
			file.fieldname + '-' + Date.now() + path.extname(file.originalname)
		);
	},
});
const upload = multer({
	storage: storage,
}).single('img');

let tokenes = [];
let users = [];
let pets = [];

mongoose.connect(
	`mongodb+srv://admin_user:${process.env.DB_PASS}@cluster0.8pu0h.mongodb.net/<dbname>?retryWrites=true&w=majority`,
	{
		useUnifiedTopology: true,
		useNewUrlParser: true,
	}
);
const db = mongoose.connection;

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

const usersRouter = require('./routs/usersRouter.js');
app.use('/usersTest', usersRouter);
app.get('/petsByUserId', (req, res) => {
	console.log(req.query);
	for (let i in users.users) {
		console.log(users.users[i].id);
		console.log(req.query.userId);

		if (users.users[i].id === req.query.userId) {
			console.log('found');
			console.log(users.users[i].usersPets);
			res.send(users.users[i].usersPets);
		}
	}
	// console.log(users.users);
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
			pets.pets[i].status = 'Available';
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
app.post('/uploadImg', (req, res) => {
	console.log('ypypyppypy');

	res.send('Uploaded Img');
});
app.post('/addPet', (req, res) => {
	pets.pets.push(req.body.newPet);
	fs.writeFile('./db/pets.json', `\n${JSON.stringify(pets)}`, (err) => {
		if (err) console.log(err);
	});
	let images;
	upload(req, res, (err) => {
		if (err) {
			console.log(err);
			res.render('app');
		} else {
			fs.readFile('./db/images.json', 'utf8', (err, data, next) => {
				console.log(req.file);
				// console.log(req.file);
				images = data;
				processImg(images, req.body);

				function processImg(images, newImgData) {
					images = JSON.parse(images);
					images.images.push(newImgData);
					fs.writeFile('images.json', JSON.stringify(images), (err) => {
						if (err) console.log(err);
					});
				}
			});
		}
	});
	res.send(req.body);
});

app.post('/users/login', (req, res) => {
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
