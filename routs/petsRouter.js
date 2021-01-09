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

router.patch(
	'/adopt/:petId/:userId/:fosterPet',
	authenticateToken,
	async (req, res) => {
		try {
			const fosterPet = req.params.fosterPet;
			const userId = req.params.userId;
			const updatedUser = await User.findById(userId);
			const pet = await Pet.findById(req.params.petId);
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
	'/save/:petId/:userId/:fosterPet',
	authenticateToken,
	async (req, res) => {
		try {
			const userId = req.params.userId;
			const updatedUser = await User.findById(userId);
			const pet = await Pet.findById(req.params.petId);
			updatedUser.savedPets.push(req.params.petId);
			await User.updateOne(
				{ _id: userId },
				{ savedPets: updatedUser.savedPets }
			);
			res.json('ok');
		} catch (err) {
			res.status(400).json({ message: err.message });
		}
	}
);

router.patch(
	'/unsave/:petId/:userId/:fosterPet',
	authenticateToken,
	async (req, res) => {
		try {
			const petId = req.params.petId;
			const userId = req.params.userId;
			const updatedUser = await User.findById(userId);
			const index = updatedUser.savedPets.indexOf(petId);
			if (index > -1) {
				updatedUser.savedPets.splice(index, 1);
			} else res.json('Pet is not saved');
			await User.updateOne(
				{ _id: userId },
				{ savedPets: updatedUser.savedPets }
			);
			res.json('unsaved successfully');
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
		if (!Object.keys(searchInfo).length) {
			res.status(400).json({ message: 'Please enter at least one field' });
		}
		let searchMaxHeight;
		let searchMinHeight;
		let searchMaxWeight;
		let searchMinWeight;
		if (searchInfo.maxHeight) {
			searchMaxHeight = parseInt(searchInfo.maxHeight);
			delete searchInfo['maxHeight'];
		}
		if (searchInfo.minHeight) {
			searchMinHeight = parseInt(searchInfo.minHeight);
			delete searchInfo['minHeight'];
		}
		if (searchInfo.maxWeight) {
			searchMaxWeight = parseInt(searchInfo.maxWeight);
			delete searchInfo['maxWeight'];
		}
		if (searchInfo.minWeight) {
			searchMinWeight = parseInt(searchInfo.minWeight);
			delete searchInfo['minWeight'];
		}
		const resultsPets = await Pet.find({
			$and: [
				{
					height: { $lte: searchMaxHeight || 5000 },
				},
				{
					height: { $gte: searchMinHeight || 0 },
				},
				{
					weight: { $lte: searchMaxWeight || 5000 },
				},
				{
					weight: { $gte: searchMinWeight || 0 },
				},
				searchInfo,
			],
		});
		res.status(200).json(resultsPets || 'not found');
	} catch (err) {
		res.status(400).json({ message: err.message });
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
	try {
		let uploadedResponse;
		let imgUrl;
		if (req.body.newPet.petImg) {
			uploadedResponse = await cloudinary.uploader.upload(
				req.body.newPet.petImg
			);
			imgUrl = uploadedResponse.url;
		}
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
			const unValidField = Object.keys(error.errors)[0];
			const errorPath = error.errors[`${unValidField}`].properties.path;
			const errMessage = error.errors[`${errorPath}`].properties.message;
			return res.status(400).json(errMessage);
		} else {
			try {
				const newPet = await pet.save();
				res.json('Pet was added successfully');
			} catch (err) {
				res.status(400).json({ message: err.message });
			}
		}
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

router.patch('/petEdit/:id', authenticateToken, getPet, async (req, res) => {
	const updatedInfo = req.body.updatedInfo;
	if (updatedInfo.name != null) {
		res.pet.name = updatedInfo.name;
	}
	if (updatedInfo.status != null) {
		res.pet.status = updatedInfo.status;
	}
	if (updatedInfo.description != null) {
		res.pet.description = updatedInfo.description;
	}
	if (updatedInfo.type != null) {
		res.pet.type = updatedInfo.type;
	}
	if (updatedInfo.height != null) {
		res.pet.height = updatedInfo.height;
	}
	if (updatedInfo.weight != null) {
		res.pet.weight = updatedInfo.weight;
	}
	if (updatedInfo.color != null) {
		res.pet.color = updatedInfo.color;
	}
	if (updatedInfo.hypoallergenic != null) {
		res.pet.hypoallergenic = updatedInfo.hypoallergenic;
	}
	if (updatedInfo.diet != null) {
		res.pet.diet = updatedInfo.diet;
	}
	if (updatedInfo.breed != null) {
		res.pet.breed = updatedInfo.breed;
	}
	if (updatedInfo.petImg != null) {
		res.pet.petImg = updatedInfo.petImg;
	}
	try {
		const updatedPet = await res.pet.save();
		res.json('OK');
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

module.exports = router;
