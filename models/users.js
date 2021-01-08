const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
		maxlength: [100, 'First name is too long'],
	},
	lastName: {
		type: String,
		required: true,
		maxlength: [100, 'Last name is too long'],
	},
	email: {
		type: String,
		required: true,
		maxlength: [100, 'Email name is too long'],
	},
	phone: {
		type: String,
		required: false,
		maxlength: [30, 'Phone number is too long'],
		minlength: [4, 'Phone number is too short'],
	},
	bio: {
		type: String,
		required: true,
		maxlength: [400, 'Bio name is too long'],
	},
	password: {
		type: String,
		required: true,
		minlength: [4, 'Password is too short'],
		maxlength: [100, 'Password name is too long'],
	},
	userPets: {
		type: Array,
	},
	savedPets: {
		type: Array,
	},
	role: {
		type: String,
		required: false,
		maxlength: [100, 'Role is too long'],
	},
});

module.exports = mongoose.model('User', usersSchema);
