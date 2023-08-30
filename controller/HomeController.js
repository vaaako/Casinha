const { checkAndCreate, getAllPosts, makeMailObject } = require('../database/db');
const { storeMessage, getMessage } = require('./MessageTool');
const Post = require('../models/Post');
const User = require('../models/User');

const async = require('async');
const { isPostValid, validateMedia } = require('../database/validator');

/**
 * TO DO
 * X MIDDLEWARE TO BLOCK UNLOGGED USER FROM OTHER PAGES
 * X Instead of a field with likes and dislikes, have just whoReacted (o)
 *   * Pass through each reaction and if like like++ etc.
 *   * post.likes = likes; post.dislikes; (inside the counter loop)
 *   * And after that, pass to 'index' normally

 * X Change the way query to pfp
 *   * Maybe query for the pfp in the folders turns to be a good idea (query if pfp folder has user's id, if not, defaultpfp.png)
 * X Other way to store the postimage
 * X Add "load more messages"
 * */


// eugostodecoisas eugostodechuparrola
const homePage = async (req, res) => {
	// Passport
	// console.log("\n\nPASSPORT =>", req.session, req.sessionID)
	// console.log("USER =>", req.user);
	let user = req.user;

	// TODO: Put mails on req.user
	let mails = await User.findOne({ pubid: user.id }).select('mails').lean();

	let haveMail = false;
	for(const mail of mails.mails) {
		if(!mail.read) {
			haveMail = true;
			break;
		}
	}

	// Add likes and dislikes
	const allPosts = await getAllPosts(user.id, limit=5);

	return res.render('index', {
		allPosts,
		user,
		haveMail,
		message: getMessage()
	});
};


const makePost = async (req, res) => {
	try {
		if(!req.body || !req.body.post) throw new Error("Bad request!");

		let author = req.user; // Add post author's id to Post body
		const { post } = req.body;

		// Is valid
		let isValid = isPostValid(req, author);
		if(isValid) throw new Error(isValid); // Returned error

		// If has file
		let media = validateMedia(req.files, 'postmedia');
		if(typeof media == 'string') throw new Error(media);

		// Check for same and and create
		let entry = await checkAndCreate(Post, { author: author.id, content: post, media }) // Pass media extension as argument

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


		// TODO: When make follow, make here notify the followers

		return res.redirect('/');
	} catch (err) {
		console.log("[ERR] MAKE POST => ", err);
		storeMessage(err); // Only happening if user send request manually
		return res.redirect('/');
		// res.status(500).send({ sucess: false, message: err.message });
	}
};




// Ironically or not, this is faster than builtin findIndex()
const findIndex = (obj, field, search) => {
	for (let i = 0; i < obj.length; i++) {
		// Check if the current object's 'prop' value matches the 'search' value
		if(obj[i][field] === search) return i; // Found return index
	}

	return -1;
}

/* Post Reaction */
const postReactionQueue = async.queue(async ({ postid, userid, reaction, sum }) => {
	try {
		const user = await User.findOne({ pubid: userid });
		const post = await Post.findOne({ pubid: postid });
		const postIndex = findIndex(user.reactedPosts, 'postid', postid);

		/**
		 * Is && to avoid errors
		 * e.g. if false && -1 -> how would someone remove something that is even added?
		 * */
		if(postIndex >= 0 && sum == -1) {
			// console.log("=> REMOVING", postIndex);
			
			user.reactedPosts.splice(postIndex, 1);
			let userIndex = findIndex(post.whoReacted, 'userid', userid);
			// if(userIndex >=0 )
			post.whoReacted.splice(userIndex, 1);
		} else if(postIndex == -1 && sum == 1) {
			// console.log("=> PUSHING", postIndex);

			user.reactedPosts.push({ postid: postid, reaction: reaction });
			post.whoReacted.push({ userid: userid, reaction: reaction });

			// Just notify post author if is adding reaction

			let author = await User.findOne({ pubid: post.author }); // It needs to add to author.mails
			if(userid != post.author){ // Just notify is author is different of who reacted
				author.mails.push(makeMailObject(postid, userid, 1, reaction));
			}

			await author.save();
		} else {
			throw new Error("Impossible request!");
		}

		await Promise.all([user.save(), post.save()]);
		return null; // Return no erros
	} catch (err) {
		return err
	}
}, 1); // Limit to one execution per time


const postReaction = async (req, res) => {
	try {
		// Check request
		if(!req.body) throw new Error("Bad request!");
		const { postid, reaction, sum, message } = req.body;
		const userid = req.user.id;

		if(!postid || !reaction || !sum || !message
			||(!['like', 'dislike'].includes(reaction)
			|| (sum != 1 && sum != -1))) throw new Error("Bad request!");

		postReactionQueue.push({ postid, userid, reaction, sum }, (err) => {
			if(err) throw err.message;

			// Success
			return res.status(200).send({ sucess: true, message: message });
		});

		// Notify post author
	} catch (err) {
		console.log("[ERR] POST Reaction => ", err);

		storeMessage("Bad request!"); // Only happening if user send request manually
		return res.redirect('/');
		// return res.status(500).send({ sucess: false, message: err });
	}
}



module.exports = {
	homePage,
	makePost,
	postReaction
};



// console.log(req.body);
// await Post.findOneAndUpdate({ pubid: body.id }, {
// 	$inc : { [body.reaction]: parseInt(body.sum) }
// }).then(async (post) => {

