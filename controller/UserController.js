const { getAllPostsFromUser } = require('../database/db');
const User = require('../models/User');

const userPage = async (req, res) => {
	if(!req.isAuthenticated()) return res.redirect('/');

	let username = req.params.username;
	let user = await User.findOne({ username: username }).lean();
	let ownuser = req.user;

	if(!user) return res.render('notfound', { user: ownuser }); // User not found

	let allPosts = await getAllPostsFromUser(user, ownuser.id, limit=5);

	return res.render('user', { allPosts, user, ownuser }); // user -> user's profile / ownuser -> user acessing profile
};


module.exports = {
	userPage,
};