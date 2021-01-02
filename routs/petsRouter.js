const express = require('express');
const router = express.Router();
const Pet = require('../models/pets');
const jwt = require('jsonwebtoken');

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

router.get('/all', async (req, res) => {
	try {
		const pets = await Pet.find();
		res.json(pets);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});
//get pet by type
router.get('/search/:searchInfo', async (req, res) => {
	const searchInfo = JSON.parse(req.params.searchInfo);
	console.log(searchInfo);
	// console.log(
	// `first propery object::: ${searchInfo[Object.keys(searchInfo)[0]]}`
	// );

	// all_db_users = await users_collection.find();

	try {
		const resultsPets = await Pet.find(searchInfo);
		// console.log(resultsPets);
		res.json(resultsPets);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
	res.send('ok');
});
router.get('/:id', getPet, (req, res) => {
	res.send(res.pet);
});
async function getPet(req, res, next) {
	try {
		pet = await Pet.findById(req.params.id);
		if (pet == null) {
			return res.status(404).json({ message: 'Cannot find pet' });
		}
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
	res.pet = pet;
	next();
}

router.post('/addPet', async (req, res) => {
	console.log(req.body);

	const newPetInfo = req.body.newPet;
	const pet = new Pet({
		name: newPetInfo.name,
		status: newPetInfo.status,
		description: newPetInfo.description,
		type: newPetInfo.type,
		height: newPetInfo.height,
		weight: newPetInfo.weight,
		color: newPetInfo.color,
		hypoallergenic: newPetInfo.hypoallergenic,
		diet: newPetInfo.diet,
		breed: newPetInfo.breed,
	});
	console.log(pet);

	try {
		const newPet = await pet.save();
		console.log('hop');
		res.json(newPet);
	} catch (err) {
		console.log('nono');

		res.status(400).json({ message: err.message });
	}
});
module.exports = router;
