const mongoose = require("mongoose");
const nanoid = require("nanoid");


const replySchema = new mongoose.Schema({
	pubid:  { type: String, default: nanoid.nanoid() },
	author: { type: String, require: true }, // e.g. public/pfp/user_id.png
	post:   { type: String, require: true, },
	image:  { type: String, require: false }, // e.g. public/images/post_id.png
	likes:  { type: Number, default: 0 },
	date:   { type: Date, default: Date.now() },
	replyingTo: { type: String, require: true  } // Post ID
});

module.exports = mongoose.model("Replies", replySchema);
