const express = require('express');
const router = express.Router();
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const cors = require('cors');

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

router.post('/login', async (req, res) => {
	const userEmail = req.body.loginUser.email;
	const user = await User.find(
		{ email: req.body.loginUser.email },
		{ password: req.body.loginUser.password }
	).limit(1);
	if (user[0]) {
		const accessToken = generateAccessToken(JSON.stringify(user));
		res.json({ accessToken: accessToken, user: user });
	} else {
		res.status(401).json({ message: 'Incorrect email or password' });
	}
});

router.get('/all', async (req, res) => {
	try {
		const users = await User.find();
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});
router.get('/:id', getUser, (req, res) => {
	res.send(res.user);
});
async function getUser(req, res, next) {
	try {
		user = await User.findById(req.params.id);
		if (user == null) {
			return res.status(404).json({ message: 'Cannot find user' });
		}
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
	res.user = user;
	next();
}

router.post('/', async (req, res) => {
	const newUserInfo = req.body.newUser;
	const user = new User({
		firstName: newUserInfo.firstName,
		lastName: newUserInfo.lastName,
		email: newUserInfo.email,
		password: newUserInfo.password,
		usersPets: [],
	});
	console.log(user);

	try {
		const newUser = await user.save();
		console.log('hop');
		res.json(newUser);
	} catch (err) {
		console.log('nono');

		res.status(400).json({ message: err.message });
	}
});
module.exports = router;
