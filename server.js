require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');

mongoose.connect(
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
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
const usersRouter = require('./routs/usersRouter.js');
app.use('/usersTest', usersRouter);
const petsRouter = require('./routs/petsRouter.js');
app.use('/pets', petsRouter);
app.listen(port, () => {});
