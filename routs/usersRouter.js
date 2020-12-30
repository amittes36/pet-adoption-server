const express = require('express');
const router = express.Router();
const User = require('../models/users');
//get all users

router.get('/', async (req, res) => {
	try {
		const users = await User.find();
		res.json('users');
	} catch (err) {
		res.status(500).json({ msessage: err.msessage });
	}
});

router.post('/', async (req, res) => {
	const user = new User({
		fisrtName: req.body.fisrtName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password,
	});
	console.log(user);

	try {
		const newUser = await user.save();
		console.log('hop');
		res.json(newUser);
	} catch (err) {
		console.log('nono');

		res.status(400).json({ msessage: err.msessage });
	}
});
module.exports = router;
