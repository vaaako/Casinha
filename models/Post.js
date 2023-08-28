const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const postSchema = new mongoose.Schema({
	pubid:      { type: String, unique: true, default: () => nanoid(15) },
	author:     { type: String, require: true }, // { id, nickname, username, bio }
	content:    { type: String, require: true },
	detail:     { type: Object, require: true }, // 0 -> Post / 1 -> Comment (I DON'T KNOW HOW TO CALL THIS)

	comments:   { type: Array, default: [] }, // Post IDs
	media:      { type: Object, default: undefined },
	whoReacted: { type: Array, default: [] }, // { userid: id, reaction: "like" }
	date:       { type: Date, default: () => Date.now() },
});

module.exports = mongoose.model("Post", postSchema);

/*
const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);
module.exports = {
	Post, User
}
*/