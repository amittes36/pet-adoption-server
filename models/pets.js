const mongoose = require('mongoose');

const petsSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	height: {
		type: String,
		required: true,
	},
	weight: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		required: true,
	},
	hypoallergenic: {
		type: String,
		required: true,
	},
	diet: {
		type: String,
		required: true,
	},
	breed: {
		type: String,
		required: true,
	},
	breed: {
		type: String,
		required: true,
	},
	petImg: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model('Pet', petsSchema);
