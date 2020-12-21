const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
let users = [];
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());

app.use(cors());
app.use((req, res, next) => {
	users = fs.readFileSync('./db/users.json', 'utf8');
	users = JSON.parse(users);
	// console.log(users);
	next();
});

app.get('/users', (req, res) => {
	res.send(users);
});

app.post('/users/newUser', (req, res) => {
	// console.log(req.body.newUser);
	users.users.push(req.body.newUser);
	console.log(users);
	fs.writeFile('./db/users.json', `\n${JSON.stringify(users)}`, (err) => {
		if (err) console.log(err);
	});
	res.send(req.body);
});

app.listen(port, () => {
	console.log(`server listening at http://localhost:${port}`);
});
