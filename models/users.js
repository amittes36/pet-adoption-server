const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
		minlength: [4, 'Password is too short'],
	},
	userPets: {
		type: Array,
	},
});

module.exports = mongoose.model('User', usersSchema);
