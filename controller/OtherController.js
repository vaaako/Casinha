const Post = require('../models/Post');
const User = require('../models/User');
const { getAllPosts, getAllPostsFromUser, gettAllComments } = require('../database/db');

const path = require('path');
const ejs  = require('ejs');


async function renderEjsTemplate(post) {
	return new Promise((resolve, reject) => {
		ejs.renderFile(path.join(__dirname, '../views/partials/posts.ejs'), { post }, (err, res) => {
			if(err) reject(err);
			else resolve(res);
		});
	});
}

// Used in '/' and '/username'
const loadMore = async (req, res) => {
	let { limit, startfrom, username, parentpostid } = req.body;
	let allPosts;
	let user = req.user;

	if(username) { // If username, load posts from user
		let thisuser = await User.findOne({ username: username });
		allPosts = await getAllPostsFromUser(thisuser, user.id, limit=limit, skip=startfrom);
	} else if(parentpostid) { // If has postid, is a comment, load more comments
		let post = await Post.findOne({ pubid: parentpostid });
		allPosts = await gettAllComments(post, user.id, limit=limit, skip=startfrom);
	} else {
		allPosts = await getAllPosts(user.id, limit=limit, skip=startfrom);
	}


	if(!allPosts) return res.status(200).send({ html: undefined }); // It needs to be 200 to not occur erro
	
	let html = "";
	for(const post of allPosts) {
		let result = await renderEjsTemplate(post);
		html += result
	}

	return res.status(200).send({ html });
}

const notfound = (req, res) => {
	return res.render('notfound', { user: req.user });
}

module.exports = {
	loadMore,
	notfound
}

