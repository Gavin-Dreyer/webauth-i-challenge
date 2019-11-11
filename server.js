const express = require('express');
const Users = require('./users/users-model');
const authMidW = require('./auth/authMW');
const bcrypt = require('bcryptjs');

const server = express();

server.use(express.json());

server.post('/api/register', (req, res) => {
	let user = req.body;
	const { password } = req.body;

	const hash = bcrypt.hashSync(user.password, 12);

	user.password = hash;

	Users.add(user)
		.then(uInfo => {
			console.log(uInfo);
			res.status(201).json({ password: password, hash: user.password });
		})
		.catch(error => {
			res.status(500).json(error);
		});
});

server.post('/api/login', (req, res) => {
	let { username, password } = req.body;

	Users.findBy({ username })
		.first()
		.then(user => {
			if (user && bcrypt.compareSync(password, user.password)) {
				res.status(200).json({ message: `Welcome ${user.username}!` });
			} else {
				res.status(401).json({ message: 'Invalid Credentials' });
			}
		})
		.catch(error => {
			res.status(500).json(error);
		});
});

server.get('/api/users', authMidW, (req, res) => {
	Users.find()
		.then(users => {
			res.json(users);
		})
		.catch(err => res.send(err));
});

module.exports = server;
