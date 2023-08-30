const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const User = require('../models/User');
const Post = require('../models/Post');

const { formatPost } = require('./dataManipulation');


const connectToDatabase = (callback) => {
	mongoose.connect(process.env.DB_URI, {
		dbName: process.env.DB_NAME,
		// Avoid URL and Topology error
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}).then(callback())
	.catch((err) => console.log(err));
};

async function uniqueNanoId(Model, query) {
	const sameNanoId = await Model.findOne({ pubid: query });
	console.log(sameNanoId);
	if(sameNanoId) { // If ID exists, generate a new one util it not exists
		let newQuery = nanoid();
		return uniqueNanoId(newQuery);
	}
	return query; // If don't exists return same query else the new id
}

async function checkAndCreate(Model, body, comment=undefined) {
	let newEntry = new Model(body); // Create new
	newEntry.pubid = await uniqueNanoId(Model, newEntry.pubid); // Check pubid
	newEntry.detail = {
		type: 0,
		parent: 'root'
	};
	// console.log("NEW ENTRY =>", newEntry);

	// If is media
	if(newEntry.media) {
		newEntry.media = {
			// 0 -> image, 1 -> Video 
			type: (['.mp4'].includes(newEntry.media.extension)) ? 1 : 0,
			// If have media, the media name must be "pubid + media's extension"
			name: newEntry.pubid + newEntry.media.extension
		}
	}

	// Is is comment
	if(comment) {
		// Get commenting post
		let originalpost = await Model.findOne({ pubid: comment }); // Model in this case is Post (if have comment param, can only be a post)
		originalpost.comments.push(newEntry.pubid);
		await originalpost.save();

		let author = await User.findOne({ pubid: originalpost.author }).select('username');

		// Update type
		newEntry.detail = {
			type: 1,
			parent: comment
		};

		// Update content
		newEntry.content = '@' + author.username + '\n' + newEntry.content;
	}

	// await newEntry.save(); // Insert
	return newEntry;
}

function makeMailObject(postid, authorid, type, origin) {
	return {
		postid: postid, // Reacted post
		from: authorid, // Who Reacted
		read: false,    // Was mail readed?
		date: Date.now(), // Date
		details: {
			type: type, // 0 -> Commentary / 1 -> Like/Dislike
			origin: origin // If Commentary -> Commentary's ID Else if is like or dislike
		}
	}
}





/**
 * 
 * GET ALL MODULES
 * 
 * */

async function getAllPosts(userid, limit=20, skip=0) {
	const allPosts = await Post.find({ "detail.type": 0 })
		.skip(skip).limit(limit)
		.sort({ _id: -1 });
	if(allPosts.length === 0) return [];

	let formatted = await formatPost(allPosts, userid);
	return formatted;
}


async function getAllPostsFromUser(user, ownuserid, limit=20, skip=0) {
	// Get posts
	const userposts = user.posts
	.reverse().splice(skip, limit);
	if (userposts.length === 0) return [];

	const posts = await Post.find({ pubid: { $in: userposts } }).lean();

	const formatted = await formatPost(posts, ownuserid);
	return formatted;
}



async function getAllComments(originalpost, userid, limit=20, skip=0) {
	// Get comments
	const comments = originalpost.comments
	.reverse().splice(skip, limit);
	if(comments.length === 0) return [];

	const allComments = await Post.find({ pubid: { $in: comments } }).lean(); // lean -> basic objects instead of mongoose objects

	let formatted = await formatPost(allComments, userid);
	return formatted;
}


module.exports = {
	connectToDatabase,
	checkAndCreate,
	getAllPosts,
	getAllPostsFromUser,
	getAllComments,
	makeMailObject	
}