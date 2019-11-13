const Users = require('../users/users-model');

const bcrypt = require('bcryptjs');

module.exports = (req, res, next) => {
	// let { username, password } = req.headers;
	// if (username && password) {
	// 	Users.findBy({ username })
	// 		// .first()
	// 		.then(user => {
	// 			console.log(user[0]);
	// 			if (user[0] && bcrypt.compareSync(password, user[0].password)) {
	// 				next();
	// 			} else {
	// 				res.status(401).json({ message: 'Invalid Credentials' });
	// 			}
	// 		})
	// 		.catch(error => {
	// 			console.log(error);
	// 			res.status(500).json(error);
	// 		});
	// } else {
	// 	res.status(400).json({ message: 'please provide credentials' });
	// }

	if (req.session && req.session.username) {
		next()
	} else {
		res.status(401).json({ you: 'shall not pass' })
	}
};
