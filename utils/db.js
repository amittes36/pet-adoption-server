const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		await mongoose.connect(
			process.env.MONGODB_URI ||
				`mongodb+srv://admin_user:${process.env.DB_PASS}@cluster0.8pu0h.mongodb.net/<dbname>?retryWrites=true&w=majority`,
			{
				useUnifiedTopology: true,
				useNewUrlParser: true,
			}
		);
		console.log('MongoDB Connected');
	} catch (err) {
		console.error(err);
		process.exit(err);
	}
};

module.exports = connectDB;
