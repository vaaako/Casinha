const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

// TODO: Add likecount and dislikecount
//		so it don't need to calculate each time

const userSchema = new mongoose.Schema({
	pubid:          { type: String, unique: true, default: () => nanoid(15) },
	nickname:       { type: String, require: true },
	username:       { type: String, require: true },
	email:          { type: String, require: true },
	password:       { type: String, require: true },

	mails:          { type: Array, default: [] }, // { postid: reactedPostID, from: userid, date: Date.now(), read: false,details: { type: 0, origin: postid/reactiontype } } / 0 -> Comment, 1 -> Like/Dislike
	bio:            { type: String, default: "Blablabla" },
	role:           { type: Number, default: 1 }, // 0 = Admin, 1 = User
	posts:          { type: Array, default: [] }, // ID of made posts
	reactedPosts:   { type: Array, default: [] }, // { postid: id, reaction: "like" }
	commentedPosts: { type: Array, default: [] }  // ID of commented posts (change later)
});

module.exports = mongoose.model("Users", userSchema);
