const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const userSchema = new mongoose.Schema({
	pubid:          { type: String, unique: true, default: () => nanoid(15) },
	nickname:       { type: String, require: true },
	username:       { type: String, require: true },
	email:          { type: String, require: true },
	password:       { type: String, require: true },

	bio:            { type: String, default: "Blablabla" },
	role:           { type: String, default: 1 }, // Admin, User
	// pfp:            { type: String, default: 'defaultpfp.png' }, // e.g. public/pfp/user_id.png (I know i can query in the folder, but this is faster)
	posts:          { type: Array, default: [] }, // ID of made posts
	reactedPosts:   { type: Array, default: [] }, // { postid: id, reaction: "like" }
	commentedPosts: { type: Array, default: [] }  // ID of commented posts (change later)
});

module.exports = mongoose.model("Users", userSchema);
