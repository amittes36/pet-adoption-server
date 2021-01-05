const express = require('express');
const router = express.Router();
const Pet = require('../models/pets');
const User = require('../models/users');
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

router.patch(
	'/adopt/:petId/:userId/:fosterPet',
	authenticateToken,
	async (req, res) => {
		try {
			const fosterPet = req.params.fosterPet;
			console.log(fosterPet);

			const userId = req.params.userId;
			const updatedUser = await User.findById(userId);
			const pet = await Pet.findById(req.params.petId);
			console.log(pet.status);
			if (pet.status != 'Fostered') updatedUser.userPets.push(req.params.petId);
			await User.updateOne({ _id: userId }, { userPets: updatedUser.userPets });
			if (fosterPet == 'true') {
				await Pet.updateOne({ _id: req.params.petId }, { status: 'Fostered' });
			} else
				await Pet.updateOne({ _id: req.params.petId }, { status: 'Adopted' });

			res.json('ok');
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}
);
router.patch(
	'/return/:petId/:userId/:fosterPet',
	authenticateToken,
	async (req, res) => {
		try {
			const userId = req.params.userId;
			const petId = req.params.petId;
			const updatedUser = await User.findById(userId);
			const index = updatedUser.userPets.indexOf(petId);
			if (index > -1) {
				updatedUser.userPets.splice(index, 1);
			}

			await User.updateOne({ _id: userId }, { userPets: updatedUser.userPets });
			await Pet.updateOne({ _id: petId }, { status: 'Available' });

			res.json('ok');
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}
);

router.get('/all', async (req, res) => {
	try {
		const pets = await Pet.find();
		res.json(pets);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get('/search/:searchInfo', async (req, res) => {
	try {
		const searchInfo = JSON.parse(req.params.searchInfo);
		let searchMaxHeight;
		let searchMinHeight;
		if (searchInfo.maxHeight) {
			searchMaxHeight = parseInt(searchInfo.maxHeight);
			delete searchInfo['maxHeight'];
		}
		if (searchInfo.minHeight) {
			searchMinHeight = parseInt(searchInfo.minHeight);
			delete searchInfo['minHeight'];
		}
		console.log(typeof searchMaxHeight);
		console.log(searchInfo);

		const resultsPets = await Pet.find({
			$and: [
				{
					height: { $lte: searchMaxHeight || 5000 },
				},
				{
					height: { $gte: searchMinHeight || 0 },
				},
				searchInfo,
			],
		});
		res.status(200).json(resultsPets || 'not found');
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

router.post('/addPet', authenticateToken, async (req, res) => {
	const uploadedResponse = await cloudinary.uploader.upload(
		req.body.newPet.petImg
	);
	const imgUrl = uploadedResponse.url;
	console.log(imgUrl);

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
	let error = pet.validateSync();
	if (error) {
		console.log(Object.keys(error.errors)[0]);
		const unValidField = Object.keys(error.errors)[0];
		const errorPath = error.errors[`${unValidField}`].properties.path;

		return res
			.status(400)
			.json(error.errors[`${errorPath}`].properties.message);
	} else {
		try {
			const newPet = await pet.save();
			res.json(newPet);
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}
});
module.exports = router;
