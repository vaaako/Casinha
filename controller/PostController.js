const { checkAndCreate, formattedPost, gettAllComments } = require('../database/db');
const Post = require('../models/Post');
const User = require('../models/User');
const { isPostValid, validateMedia } = require('../database/validator');
const { storeMessage, getMessage } = require('./MessageTool');

const postPage = async (req, res) => {
	let user = req.user;
	let post = await Post.findOne({ pubid: req.params.postid });
	if(!post) return res.render('notfound', { user });

	let formattedpost = await formattedPost([post], req.user.id);

	let allComments = await gettAllComments(post, user.id, limit=5);

	return res.render('post', {
		user,
		allComments,
		post: formattedpost[0],
		message: getMessage()
	});
}

const makeComment = async (req, res) => {
	try {
		const { post } = req.body;
		let author = req.user; // Add post author's id to Post body
		let postid = req.params.postid;
		
		// Is valid
		let isValid = isPostValid(req, author);
		if(isValid) throw new Error(isValid); // Returned error

		// If has file
		let media = validateMedia(req.files, 'postmedia');
		if(typeof media == 'string') throw new Error(media);

		// Check for same and and create
		let entry = await checkAndCreate(Post, { author: author.id, content: post, media }, comment=postid) // Pass media extension as argument


		// Push pubid to user.posts
		let user = await User.findOne({ pubid: author.id });
		user.posts.push(entry.pubid)

		// It needs to move here because of pubid
		if(media) {
			await media.sampleFile.mv('public/medias/posts/' + entry.pubid + media.extension, (err) => {
				if(err) throw new Error(err);
			});
		}

		// No errors, now save
		await entry.save();
		await user.save();

		return res.redirect('/post/'+postid);
	} catch (err) {
		console.log("[ERR] MAKE POST => ", err);
		storeMessage(err.message); // Only happening if user send request manually
		return res.redirect('/post/'+req.params.postid);
		// res.status(500).send({ sucess: false, message: err.message });
	}
}

module.exports = {
	postPage,
	makeComment
}

