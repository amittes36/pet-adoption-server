const express = require('express');
const router = express.Router();
const Pet = require('../models/pets');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { cloudinary } = require('../utils/cloudinary');
router.use(cors());

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
	try {
		const searchInfo = JSON.parse(req.params.searchInfo);
		const resultsPets = await Pet.find(searchInfo);
		// const resultsPets = 'okokoko';
		res.json(resultsPets);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
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
	try {
		const uploadedResponse = await cloudinary.uploader.upload(
			req.body.newPet.petImg
		);
		const imgUrl = uploadedResponse.url;
		console.log(imgUrl);

		// console.log(`uploadedImg:=:${JSON.stringify(uploadedResponse)}`);

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
			petImg: imgUrl,
		});
		const newPet = await pet.save();
		res.json(newPet);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});
module.exports = router;
