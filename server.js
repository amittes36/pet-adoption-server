require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const bodyParser = require('body-parser');
mongoose.connect(
	process.env.MONGODB_URI ||
		`mongodb+srv://admin_user:${process.env.DB_PASS}@cluster0.8pu0h.mongodb.net/<dbname>?retryWrites=true&w=majority`,
	{
		useUnifiedTopology: true,
		useNewUrlParser: true,
	}
);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(
	bodyParser.urlencoded({
		limit: '50mb',
		extended: true,
		parameterLimit: 50000,
	})
);

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('pet-adoption-front-end-amittes36/build'));
}
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
const usersRouter = require('./routs/usersRouter.js');
app.use('/usersTest', usersRouter);
const petsRouter = require('./routs/petsRouter.js');
app.use('/pets', petsRouter);
app.listen(PORT, () => {
	console.log(`server is running on port ${PORT}`);
});
