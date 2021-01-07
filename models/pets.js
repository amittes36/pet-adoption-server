const mongoose = require('mongoose');

const petsSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: [4, 'Name is too short'],
		maxlength: [100, 'Name is too long'],
	},
	status: {
		type: String,
		required: true,
		maxlength: [100, 'Status name is too long'],
	},
	description: {
		type: String,
		required: true,
		maxlength: [
			200,
			'Description is too long, max chars for description is 200',
		],
	},
	type: {
		type: String,
		required: true,
		maxlength: [100, 'Type is too long'],
	},
	height: {
		type: Number,
		required: true,
	},
	weight: {
		type: Number,
		required: true,
	},
	color: {
		type: String,
		required: true,
	},
	hypoallergenic: {
		type: String,
		required: true,
		maxlength: [
			200,
			'Hypoallergenic is too long, max chars for description is 200',
		],
	},
	diet: {
		type: String,
		required: true,
	},
	breed: {
		type: String,
		required: true,
		maxlength: [100, 'Breed is too long'],
	},
	petImg: {
		type: String,
		required: false,
	},
});

module.exports = mongoose.model('Pet', petsSchema);
