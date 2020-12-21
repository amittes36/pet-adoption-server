const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');
var bodyParser = require('body-parser');
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());

app.use(cors());

let users = {
	usersList: [
		{
			uid: 1,
			firstName: 'Amit',
			lastName: 'Tes',
			email: 'amit@gmail.com',
			password: 12345,
			petsIds: [1, 2, 3],
		},
		{
			uid: 2,
			firstName: 'gev',
			lastName: 'eli',
			email: 'gev@gmail.com',
			password: 6688,
			petsIds: [4, 5, 6],
		},
	],
};

app.get('/users', (req, res) => {
	res.send(users);
});

app.post('/users/newUser', (req, res) => {
	console.log(req.body.newUser);
	setNewUser({
		...users.usersList,
		[e.target.name]: e.target.value,
	});
	res.send(req.body);
});

app.listen(port, () => {
	console.log(`server listening at http://localhost:${port}`);
});
