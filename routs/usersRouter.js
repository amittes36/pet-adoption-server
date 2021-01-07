const express = require('express');
const router = express.Router();
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { get } = require('./petsRouter');
const { authenticateToken, authRole } = require('../userAuth');

// function authenticateToken(req, res, next) {
// 	const authHeader = req.headers['authorization'];
// 	const token = authHeader && authHeader.split(' ')[1];
// 	console.log(token);
// 	if (token == null) return res.sendStatus(401);
// 	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
// 		if (err) return res.sendStatus(403);
// 		req.user = user;
// 		next();
// 	});
// }

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}

router.post('/login', async (req, res) => {
	const userEmail = req.body.loginUser.email;
	const user = await User.find({
		$and: [
			{ email: req.body.loginUser.email },
			{ password: req.body.loginUser.password },
		],
	}).limit(1);
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
	const checkIfEmailExists = await User.findOne({ email: newUserInfo.email });
	if (checkIfEmailExists) {
		res.status(500).json('Email already Signed up');
	}

	const user = new User({
		firstName: newUserInfo.firstName,
		lastName: newUserInfo.lastName,
		email: newUserInfo.email,
		password: newUserInfo.password,
		usersPets: [],
		savedPets: [],
		role: 'user',
	});
	let error = user.validateSync();
	if (error) {
		console.log(Object.keys(error.errors)[0]);
		const unValidField = Object.keys(error.errors)[0];
		const errorPath = error.errors[`${unValidField}`].properties.path;

		return res
			.status(400)
			.json(error.errors[`${errorPath}`].properties.message);
	} else {
		try {
			const newUser = await user.save();
			res.json(newUser);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}
});
router.patch('/:id', authenticateToken, getUser, async (req, res) => {
	const updatedInfo = req.body.updatedInfo;
	if (updatedInfo.firstName != null) {
		res.user.firstName = updatedInfo.firstName;
	}
	if (updatedInfo.lastName != null) {
		res.user.lastName = updatedInfo.lastName;
	}
	if (updatedInfo.email != null) {
		res.user.email = updatedInfo.email;
	}
	if (updatedInfo.password != null) {
		res.user.password = updatedInfo.password;
	}
	try {
		const updatedUser = await res.user.save();
		res.json(updatedUser);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

module.exports = router;
