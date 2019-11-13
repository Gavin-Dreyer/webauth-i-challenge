const express = require('express');
const Users = require('./users/users-model');
const authMidW = require('./auth/authMW');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session')
const KnexSessionStorage = require('connect-session-knex')(session)

const knexConnection = require('./database/dbConfig')

const server = express();

const sessionConfiguration = {
	name: 'mySesh',
	secret: process.env.COOKIE_SECRET || 'it is secret! it is safe!',
	cookie: {
		maxAge: 1000 * 60 * 60,
		secure: process.env.NODE_ENV === 'development' ? false : true,
		httpOnly: true
	},
	resave: false,
	saveUninitialized: true,
	store: new KnexSessionStorage({
		knex: knexConnection,
		clearInterval: 1000 * 60 * 10,
		tablename: 'user_sessions',
		sidfieldname: 'id',
		createtable: true
	})
}

server.use(express.json());
server.use(cors());
server.use(session(sessionConfiguration))

server.post('/api/register', (req, res) => {
	let user = req.body;
	const { password } = req.body;

	const hash = bcrypt.hashSync(user.password, 12);

	user.password = hash;

	Users.add(user)
		.then(uInfo => {
			req.session.username = uInfo.username;
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
				req.session.username = user.username
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

server.get('/logout', (req, res) => {
	if (req.session) {
		req.session.destroy(err => {
			if (err) {
				res.status(500).json({ error: err })
			}
		})
		res.status(200).json({ you: 'logged out successfully' })
	} else {
		res.status(200).json({ you: 'are already logged out' })
	}
})

module.exports = server;
