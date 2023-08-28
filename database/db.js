const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const User = require('../models/User');
const Post = require('../models/Post');

const timeAgo = (timestamp) => {
	// Math.floor(current_date - provided_time / 100) -> ellapsed time in seconds
	let providedTime = new Date(timestamp);
	const ellapsedTime = Math.floor((new Date() - providedTime) / 1000);

	if (ellapsedTime < 60) {
		return ellapsedTime + " segs ago";

	} else if (ellapsedTime < 60 * 60) { // Les than 1 hour
		const minutes = Math.floor(ellapsedTime / 60);
		return `${minutes} ${(minutes === 1) ? 'min' : 'mins'} ago`;

	} else if (ellapsedTime < 24 * 60 * 60) { // Less than 24 hours (1 day)
		const hours = Math.floor(ellapsedTime / (60 * 60));
		return `${hours} ${(hours === 1) ? 'hour' : 'hours'} ago`;

	} else if (ellapsedTime < 7 * 24 * 60 * 60) { // Less than 7 days
		const days = Math.floor(ellapsedTime / 86400);
		return `${days} ${(days === 1) ? 'day' : 'days'} ago`;

	} else {
		return providedTime.toLocaleDateString();
	}

}

const haveReaction = (userid, reactions) => {
	for(let i=0; i < reactions.length; i++) {
		if(reactions[i].userid == userid)
			return reactions[i].reaction;
	}
	return false;
}





const connectToDatabase = (callback) => {
	mongoose.connect(process.env.DB_URI, {
		dbName: "social",
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
	// console.log(body)
	let newEntry = new Model(body); // Create new
	newEntry.pubid = await uniqueNanoId(Model, newEntry.pubid); // Check pubid
	// newEntry.author = { id: author.id, username: author.username };
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

// Push to some of user's arrays
// async function pushEntryToModel(Model, id, field, entry) {
// 	await Model.findOneAndUpdate({ pubid: id }, {
// 		$push: { [field]: entry }
// 	});

// 	// user.posts.push(field);
// 	// user.save();
// }






async function formattedPost(posts, userid) {
	// const authors = new Map();
	// let postAuthorIDs = posts.map((post) => post.author);
	// const allAuthors = await User.find({ pubid: { $in: postAuthorIDs } }); // Get all authors
	// allAuthors.map((author) => authors.set(author.pubid, author));

	const modifiedPostsPromisse = posts.map(async (post) => { // sort, reverse
		// let author = authors.get(post.author);
		let author = await User.findOne({ pubid: post.author }).select('nickname').select('username');
		const reactions = post.whoReacted;

		// Calc like and dislike
		const reactionCounts = reactions.reduce((acc, reaction) => {
			if(reaction.reaction === 'like')
				acc.likes++
			else if(reaction.reaction === 'dislike')
				acc.dislikes++;
			return acc;
		}, { likes: 0, dislikes: 0 });

		// Add author nick

		// return all
		return {
			...post.toObject(),
			author: {
				id: post.author,
				username: author.username,
				nickname: author.nickname
			},
			userReacted: haveReaction(userid, reactions), // If viewing user reacted to this post
			formatedDate: timeAgo(post.date),
			likes: reactionCounts.likes,
			dislikes: reactionCounts.dislikes,
			// totalcomments: post.comments.length
		};
	});


	const modifiedPosts = await Promise.all(modifiedPostsPromisse)
	return modifiedPosts;
}


async function getAllPosts(userid, limit=20, skip=0) {
	const allPosts = await Post.find({ "detail.type": 0 })
		.skip(skip).limit(limit)
		.sort({ _id: -1 });
	// if(allPosts.length === 0) return undefined;

	let formatted = await formattedPost(allPosts, userid);
	return formatted;
}


async function getAllPostsFromUser(user, ownuserid, limit=20, skip=0) {
	// Get posts
	let posts = [];
	let userposts = user.posts.reverse(); // Is in new -> older order, so just reverse it
	userposts = userposts.splice(skip, limit); // Get only needed
	
	for(let i = 0; i < userposts.length; i++) {
		let post = await Post.findOne({ pubid: userposts[i] });
		if(!post) continue;
		posts.push(post);
	}
	
	let formatted = await formattedPost(posts, ownuserid);
	return formatted;
}



async function gettAllComments(originalpost, userid, limit=20, skip=0) {
	// Get posts
	let allComments = [];
	let comments = originalpost.comments.reverse(); // Is in new -> older order, so just reverse it
	comments = comments.splice(skip, limit); // Get only needed
	
	for(let i = 0; i < comments.length; i++) {
		let comment = await Post.findOne({ pubid: comments[i] });
		// if(!comment) continue;
		allComments.push(comment);
	}

	let formatted = await formattedPost(allComments, userid);
	return formatted;
}


module.exports = {
	connectToDatabase,
	checkAndCreate,
	getAllPosts,
	getAllPostsFromUser,
	gettAllComments,
	formattedPost
}